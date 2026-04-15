import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { demoPath } from "@/lib/demo-data";
import { seedStarterCurriculum } from "@/lib/supabase/seed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Lesson } from "@/lib/types";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json(
      { error: "Supabase server clients are not configured correctly." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("learner_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if ((profile as { role?: "learner" | "admin" } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { draftId } = (await request.json()) as { draftId?: string };

  if (!draftId) {
    return NextResponse.json({ error: "Draft id is required." }, { status: 400 });
  }

  await seedStarterCurriculum(admin);

  const { data: draftRow, error: draftError } = await admin
    .from("lesson_drafts")
    .select("id, generated_lesson")
    .eq("id", draftId)
    .single();

  if (draftError || !draftRow) {
    return NextResponse.json(
      { error: draftError?.message ?? "Draft not found." },
      { status: 404 },
    );
  }

  const typedDraft = draftRow as { id: string; generated_lesson: Lesson };

  const { data: targetUnit, error: unitError } = await admin
    .from("units")
    .select("id, sort_order")
    .eq("path_id", demoPath.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  if (unitError || !targetUnit) {
    return NextResponse.json(
      { error: unitError?.message ?? "No target unit available." },
      { status: 500 },
    );
  }

  const typedUnit = targetUnit as { id: string; sort_order: number };

  const { data: existingLesson } = await admin
    .from("lessons")
    .select("id")
    .eq("id", typedDraft.generated_lesson.id)
    .maybeSingle();

  const { data: lastLesson } = await admin
    .from("lessons")
    .select("sort_order")
    .eq("unit_id", typedUnit.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lessonId = existingLesson
    ? `${typedDraft.generated_lesson.id}-${Date.now()}`
    : typedDraft.generated_lesson.id;
  const nextOrder = ((lastLesson as { sort_order?: number } | null)?.sort_order ?? 0) + 1;

  const { error: lessonInsertError } = await admin.from("lessons").insert({
    id: lessonId,
    unit_id: typedUnit.id,
    title: typedDraft.generated_lesson.title,
    summary: typedDraft.generated_lesson.summary,
    sort_order: nextOrder,
    difficulty: typedDraft.generated_lesson.difficulty,
    jlpt_track: typedDraft.generated_lesson.jlptTrack,
    theme_tags: typedDraft.generated_lesson.themeTags,
    published: true,
  });

  if (lessonInsertError) {
    return NextResponse.json(
      { error: lessonInsertError.message },
      { status: 500 },
    );
  }

  const exerciseRows = typedDraft.generated_lesson.exercises.map((exercise) => ({
    id: existingLesson ? `${exercise.id}-${Date.now()}` : exercise.id,
    lesson_id: lessonId,
    kind: exercise.kind,
    prompt: exercise.prompt,
    question: exercise.question,
    reference_answer: exercise.referenceAnswer,
    explanation: exercise.explanation,
    xp: exercise.xp,
  }));

  const { error: exerciseInsertError } = await admin
    .from("lesson_exercises")
    .insert(exerciseRows);

  if (exerciseInsertError) {
    return NextResponse.json(
      { error: exerciseInsertError.message },
      { status: 500 },
    );
  }

  const { error: draftUpdateError } = await admin
    .from("lesson_drafts")
    .update({
      review_state: "published",
      published_lesson_id: lessonId,
    })
    .eq("id", draftId);

  if (draftUpdateError) {
    return NextResponse.json(
      { error: draftUpdateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ publishedLessonId: lessonId });
}
