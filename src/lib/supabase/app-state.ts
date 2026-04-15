import type { SupabaseClient, User } from "@supabase/supabase-js";

import { demoMilestones, demoPath, demoState, getAllLessons } from "@/lib/demo-data";
import {
  AppState,
  LearnerOnboarding,
  LearnerProfile,
  LearningPath,
  Lesson,
  LessonDraft,
  LessonExercise,
  LessonSubmission,
  LessonSubmissionFeedback,
  Unit,
} from "@/lib/types";

interface LearningPathRow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

interface UnitRow {
  id: string;
  path_id: string;
  title: string;
  description: string;
  sort_order: number;
}

interface LessonRow {
  id: string;
  unit_id: string;
  title: string;
  summary: string;
  sort_order: number;
  difficulty: "easy" | "medium";
  jlpt_track: "future-n5" | "future-n4";
  theme_tags: string[];
  published: boolean;
}

interface LessonExerciseRow {
  id: string;
  lesson_id: string;
  kind: "read" | "answer" | "write";
  prompt: string;
  question: string;
  reference_answer: string;
  explanation: string;
  xp: number;
}

interface LearnerProfileRow {
  id: string;
  display_name: string;
  email: string;
  role: "learner" | "admin";
  beginner_confirmed: boolean;
  daily_minutes: number;
  goal: string;
  motivation: string;
  streak: number;
  xp: number;
  current_lesson_id: string;
  completed_lesson_ids: string[];
  milestone_ids: string[];
}

interface LessonSubmissionRow {
  lesson_id: string;
  total_awarded_xp: number;
  feedback: LessonSubmissionFeedback[];
  completed_at: string;
}

interface LessonDraftRow {
  id: string;
  source_prompt: string;
  review_state: "draft" | "reviewed" | "published";
  generated_lesson: Lesson;
  published_lesson_id: string | null;
}

function computeMilestoneIds(xp: number) {
  return demoMilestones
    .filter((milestone) => xp >= milestone.targetXp)
    .map((milestone) => milestone.id);
}

export function getNextLessonId(
  path: LearningPath,
  completedLessonIds: string[],
  currentLessonId?: string,
) {
  const allLessons = getAllLessons(path);
  const nextLesson = allLessons.find(
    (lesson) => !completedLessonIds.includes(lesson.id),
  );

  return nextLesson?.id ?? currentLessonId ?? allLessons[0]?.id ?? "";
}

function mapExercises(exerciseRows: LessonExerciseRow[]) {
  const exercisesByLessonId = new Map<string, LessonExercise[]>();

  exerciseRows.forEach((exercise) => {
    const currentExercises = exercisesByLessonId.get(exercise.lesson_id) ?? [];

    currentExercises.push({
      id: exercise.id,
      kind: exercise.kind,
      prompt: exercise.prompt,
      question: exercise.question,
      referenceAnswer: exercise.reference_answer,
      explanation: exercise.explanation,
      xp: exercise.xp,
    });

    exercisesByLessonId.set(exercise.lesson_id, currentExercises);
  });

  return exercisesByLessonId;
}

function mapLessons(
  lessonRows: LessonRow[],
  exerciseRows: LessonExerciseRow[],
) {
  const lessonsByUnitId = new Map<string, Lesson[]>();
  const exercisesByLessonId = mapExercises(exerciseRows);

  lessonRows.forEach((lesson) => {
    const currentLessons = lessonsByUnitId.get(lesson.unit_id) ?? [];

    currentLessons.push({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      order: lesson.sort_order,
      difficulty: lesson.difficulty,
      themeTags: lesson.theme_tags ?? [],
      jlptTrack: lesson.jlpt_track,
      published: lesson.published,
      exercises: exercisesByLessonId.get(lesson.id) ?? [],
    });

    lessonsByUnitId.set(lesson.unit_id, currentLessons);
  });

  return lessonsByUnitId;
}

function mapPath(
  pathRow: LearningPathRow,
  unitRows: UnitRow[],
  lessonRows: LessonRow[],
  exerciseRows: LessonExerciseRow[],
): LearningPath {
  const lessonsByUnitId = mapLessons(lessonRows, exerciseRows);
  const units: Unit[] = unitRows.map((unit) => ({
    id: unit.id,
    title: unit.title,
    description: unit.description,
    order: unit.sort_order,
    lessons: (lessonsByUnitId.get(unit.id) ?? []).sort(
      (left, right) => left.order - right.order,
    ),
  }));

  return {
    id: pathRow.id,
    title: pathRow.title,
    subtitle: pathRow.subtitle,
    description: pathRow.description,
    units,
  };
}

export async function loadPublishedPath(
  client: SupabaseClient,
): Promise<LearningPath> {
  const [pathResult, unitsResult, lessonsResult, exercisesResult] =
    await Promise.all([
      client
        .from("learning_paths")
        .select("id, title, subtitle, description")
        .eq("id", demoPath.id)
        .maybeSingle(),
      client
        .from("units")
        .select("id, path_id, title, description, sort_order")
        .eq("path_id", demoPath.id)
        .order("sort_order", { ascending: true }),
      client
        .from("lessons")
        .select(
          "id, unit_id, title, summary, sort_order, difficulty, jlpt_track, theme_tags, published",
        )
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      client
        .from("lesson_exercises")
        .select(
          "id, lesson_id, kind, prompt, question, reference_answer, explanation, xp",
        )
        .order("id", { ascending: true }),
    ]);

  const pathRow = pathResult.data as LearningPathRow | null;
  const unitRows = (unitsResult.data ?? []) as UnitRow[];
  const lessonRows = (lessonsResult.data ?? []) as LessonRow[];
  const exerciseRows = (exercisesResult.data ?? []) as LessonExerciseRow[];

  if (
    pathResult.error ||
    unitsResult.error ||
    lessonsResult.error ||
    exercisesResult.error ||
    !pathRow ||
    !unitRows.length ||
    !lessonRows.length
  ) {
    return demoPath;
  }

  return mapPath(
    pathRow,
    unitRows,
    lessonRows,
    exerciseRows,
  );
}

function mapLearnerProfile(
  row: LearnerProfileRow,
  fallbackEmail: string,
): LearnerProfile {
  const completedLessonIds = row.completed_lesson_ids ?? [];
  const xp = row.xp ?? 0;

  return {
    userId: row.id,
    displayName: row.display_name,
    email: row.email || fallbackEmail,
    role: row.role,
    onboarding: {
      beginnerConfirmed: row.beginner_confirmed,
      dailyMinutes: row.daily_minutes,
      goal: row.goal,
      motivation: row.motivation,
    },
    streak: row.streak,
    xp,
    currentLessonId: row.current_lesson_id,
    completedLessonIds,
    milestoneIds:
      row.milestone_ids && row.milestone_ids.length
        ? row.milestone_ids
        : computeMilestoneIds(xp),
  };
}

export async function ensureLearnerProfile(
  client: SupabaseClient,
  user: User,
  path: LearningPath,
) {
  const email = user.email ?? "";
  const { data: existingProfile, error: selectError } = await client
    .from("learner_profiles")
    .select(
      "id, display_name, email, role, beginner_confirmed, daily_minutes, goal, motivation, streak, xp, current_lesson_id, completed_lesson_ids, milestone_ids",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProfile) {
    return mapLearnerProfile(existingProfile as LearnerProfileRow, email);
  }

  const firstLessonId = getAllLessons(path)[0]?.id ?? "";
  const profileNameCandidates = [
    user.user_metadata?.display_name,
    user.user_metadata?.full_name,
    user.user_metadata?.name,
  ];
  const defaultDisplayName =
    profileNameCandidates.find(
      (value): value is string => typeof value === "string" && value.length > 0,
    ) ??
    (email.split("@")[0] || "Learner");

  const { data: createdProfile, error: insertError } = await client
    .from("learner_profiles")
    .insert({
      id: user.id,
      display_name: defaultDisplayName,
      email,
      current_lesson_id: firstLessonId,
      completed_lesson_ids: [],
      milestone_ids: [],
    })
    .select(
      "id, display_name, email, role, beginner_confirmed, daily_minutes, goal, motivation, streak, xp, current_lesson_id, completed_lesson_ids, milestone_ids",
    )
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: retriedProfile, error: retryError } = await client
        .from("learner_profiles")
        .select(
          "id, display_name, email, role, beginner_confirmed, daily_minutes, goal, motivation, streak, xp, current_lesson_id, completed_lesson_ids, milestone_ids",
        )
        .eq("id", user.id)
        .single();

      if (retryError) {
        throw retryError;
      }

      return mapLearnerProfile(retriedProfile as LearnerProfileRow, email);
    }

    throw insertError;
  }

  return mapLearnerProfile(createdProfile as LearnerProfileRow, email);
}

export async function loadSubmissions(
  client: SupabaseClient,
  learnerId: string,
): Promise<LessonSubmission[]> {
  const { data, error } = await client
    .from("lesson_submissions")
    .select("lesson_id, total_awarded_xp, feedback, completed_at")
    .eq("learner_id", learnerId)
    .order("completed_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as LessonSubmissionRow[]).map((submission) => ({
    lessonId: submission.lesson_id,
    totalAwardedXp: submission.total_awarded_xp,
    feedback: submission.feedback,
    completedAt: submission.completed_at,
  }));
}

export async function loadDrafts(
  client: SupabaseClient,
  isAdmin: boolean,
): Promise<LessonDraft[]> {
  if (!isAdmin) {
    return [];
  }

  const { data, error } = await client
    .from("lesson_drafts")
    .select(
      "id, source_prompt, review_state, generated_lesson, published_lesson_id",
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as LessonDraftRow[]).map((draft) => ({
    id: draft.id,
    sourcePrompt: draft.source_prompt,
    reviewState: draft.review_state,
    generatedLesson: draft.generated_lesson,
    publishedLessonId: draft.published_lesson_id ?? undefined,
  }));
}

export async function loadAppState(
  client: SupabaseClient,
): Promise<AppState> {
  const path = await loadPublishedPath(client);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return {
      ...demoState,
      learner: null,
      path,
      milestones: demoMilestones,
      submissions: [],
      drafts: [],
    };
  }

  const learner = await ensureLearnerProfile(client, user, path);
  const [submissions, drafts] = await Promise.all([
    loadSubmissions(client, learner.userId),
    loadDrafts(client, learner.role === "admin"),
  ]);

  return {
    learner,
    path,
    milestones: demoMilestones,
    submissions,
    drafts,
  };
}

export function buildProfilePatch(
  onboarding: LearnerOnboarding,
  learner: LearnerProfile,
) {
  return {
    beginner_confirmed: onboarding.beginnerConfirmed,
    daily_minutes: onboarding.dailyMinutes,
    goal: onboarding.goal,
    motivation: onboarding.motivation,
    display_name: learner.displayName,
  };
}

export function buildCompletionPatch(
  learner: LearnerProfile,
  path: LearningPath,
  lessonId: string,
  feedback: LessonSubmissionFeedback[],
) {
  const totalAwardedXp = feedback.reduce(
    (sum, item) => sum + item.awardedXp,
    0,
  );
  const completedLessonIds = Array.from(
    new Set([...learner.completedLessonIds, lessonId]),
  );
  const xp = learner.xp + totalAwardedXp;

  return {
    completedLessonIds,
    totalAwardedXp,
    xp,
    profilePatch: {
      xp,
      streak: learner.streak + 1,
      current_lesson_id: getNextLessonId(path, completedLessonIds, lessonId),
      completed_lesson_ids: completedLessonIds,
      milestone_ids: computeMilestoneIds(xp),
    },
  };
}
