import type { SupabaseClient } from "@supabase/supabase-js";

import { demoPath } from "@/lib/demo-data";

export async function seedStarterCurriculum(client: SupabaseClient) {
  const { data: existingPath } = await client
    .from("learning_paths")
    .select("id")
    .eq("id", demoPath.id)
    .maybeSingle();

  if (!existingPath) {
    const { error: pathError } = await client.from("learning_paths").upsert({
      id: demoPath.id,
      title: demoPath.title,
      subtitle: demoPath.subtitle,
      description: demoPath.description,
    });

    if (pathError) {
      throw pathError;
    }
  }

  const unitRows = demoPath.units.map((unit) => ({
    id: unit.id,
    path_id: demoPath.id,
    title: unit.title,
    description: unit.description,
    sort_order: unit.order,
  }));

  const lessonRows = demoPath.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      id: lesson.id,
      unit_id: unit.id,
      title: lesson.title,
      summary: lesson.summary,
      sort_order: lesson.order,
      difficulty: lesson.difficulty,
      jlpt_track: lesson.jlptTrack,
      theme_tags: lesson.themeTags,
      published: true,
    })),
  );

  const exerciseRows = demoPath.units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) =>
      lesson.exercises.map((exercise) => ({
        id: exercise.id,
        lesson_id: lesson.id,
        kind: exercise.kind,
        prompt: exercise.prompt,
        question: exercise.question,
        reference_answer: exercise.referenceAnswer,
        explanation: exercise.explanation,
        xp: exercise.xp,
      })),
    ),
  );

  const { error: unitsError } = await client.from("units").upsert(unitRows);

  if (unitsError) {
    throw unitsError;
  }

  const { error: lessonsError } = await client.from("lessons").upsert(lessonRows);

  if (lessonsError) {
    throw lessonsError;
  }

  const { error: exercisesError } = await client
    .from("lesson_exercises")
    .upsert(exerciseRows);

  if (exercisesError) {
    throw exercisesError;
  }
}
