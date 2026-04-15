import { Lesson, LessonDraft } from "@/lib/types";

function toLessonId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateLessonDraft(prompt: string, order: number): LessonDraft {
  const topic =
    prompt
      .split(/[,.;]/)
      .map((item) => item.trim())
      .find(Boolean) ?? "Beginner everyday Japanese";

  const normalizedTopic = topic.slice(0, 48);
  const lessonId = `draft-${toLessonId(normalizedTopic) || "lesson"}`;

  const lesson: Lesson = {
    id: lessonId,
    title: normalizedTopic,
    summary:
      "AI-assisted draft lesson prepared for review before it becomes learner-facing content.",
    order,
    difficulty: "easy",
    themeTags: ["everyday", "ai-draft"],
    jlptTrack: "future-n5",
    published: false,
    exercises: [
      {
        id: `${lessonId}-read`,
        kind: "read",
        prompt: "Read and recognize",
        question: `Learners first read a model line related to: ${normalizedTopic}.`,
        referenceAnswer: "Model phrase",
        explanation: "Start by grounding the learner in one useful phrase.",
        xp: 8,
      },
      {
        id: `${lessonId}-answer`,
        kind: "answer",
        prompt: "Meaning and context",
        question:
          "Ask the learner to identify when the phrase is useful and why its tone fits.",
        referenceAnswer: "Correct context and tone",
        explanation:
          "This checks comprehension before open-ended writing begins.",
        xp: 12,
      },
      {
        id: `${lessonId}-write`,
        kind: "write",
        prompt: "Write a short response",
        question:
          "Have the learner write one beginner-friendly line using the target pattern.",
        referenceAnswer: "Short polite response",
        explanation:
          "V1 should encourage output quickly, even if the sentence stays simple.",
        xp: 16,
      },
    ],
  };

  return {
    id: `draft-${Date.now()}`,
    sourcePrompt: prompt,
    reviewState: "draft",
    generatedLesson: lesson,
  };
}
