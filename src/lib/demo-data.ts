import {
  AppState,
  LearningPath,
  Lesson,
  LessonDraft,
  Milestone,
} from "@/lib/types";

const introLesson: Lesson = {
  id: "lesson-hello",
  title: "Start with hello",
  summary: "Meet your first Japanese greetings and write your first polite reply.",
  order: 1,
  difficulty: "easy",
  themeTags: ["everyday", "greeting"],
  jlptTrack: "future-n5",
  published: true,
  exercises: [
    {
      id: "hello-read",
      kind: "read",
      prompt: "Reading warm-up",
      question: "Konnichiwa means hello or good afternoon in a polite everyday tone.",
      referenceAnswer: "konnichiwa",
      explanation: "This is one of the safest beginner greetings to recognize early.",
      xp: 8,
    },
    {
      id: "hello-answer",
      kind: "answer",
      prompt: "Quick response",
      question: "You meet a coworker for the first time today. Which greeting fits best?",
      referenceAnswer: "Konnichiwa",
      explanation: "It works well for daytime everyday and workplace conversation.",
      xp: 12,
    },
    {
      id: "hello-write",
      kind: "write",
      prompt: "Write your first line",
      question: "Type a short self-introduction starting with 'Konnichiwa'.",
      referenceAnswer: "Konnichiwa, watashi wa Alex desu.",
      explanation: "Beginners should practice producing a simple full sentence quickly.",
      xp: 16,
    },
  ],
};

const nameLesson: Lesson = {
  id: "lesson-name",
  title: "Say your name",
  summary: "Introduce yourself politely with watashi wa ... desu.",
  order: 2,
  difficulty: "easy",
  themeTags: ["everyday", "intro"],
  jlptTrack: "future-n5",
  published: true,
  exercises: [
    {
      id: "name-read",
      kind: "read",
      prompt: "Pattern focus",
      question: "Watashi wa ___ desu means 'I am ___.'",
      referenceAnswer: "watashi wa",
      explanation: "This pattern is a core beginner structure for introductions.",
      xp: 8,
    },
    {
      id: "name-answer",
      kind: "answer",
      prompt: "Meaning check",
      question: "What is the polite ending in 'watashi wa Mika desu'?",
      referenceAnswer: "desu",
      explanation: "Desu gives the sentence a polite, beginner-friendly ending.",
      xp: 12,
    },
    {
      id: "name-write",
      kind: "write",
      prompt: "Production practice",
      question: "Write a polite sentence introducing yourself by name.",
      referenceAnswer: "Watashi wa ___ desu.",
      explanation: "Keep the sentence simple and polished rather than long.",
      xp: 16,
    },
  ],
};

const cafeLesson: Lesson = {
  id: "lesson-cafe",
  title: "Order at a cafe",
  summary: "Learn one useful phrase for asking politely in a real-world place.",
  order: 3,
  difficulty: "medium",
  themeTags: ["everyday", "cafe"],
  jlptTrack: "future-n5",
  published: true,
  exercises: [
    {
      id: "cafe-read",
      kind: "read",
      prompt: "Useful phrase",
      question: "Koohii o onegaishimasu means 'Coffee, please.'",
      referenceAnswer: "onegaishimasu",
      explanation: "Onegaishimasu is a polite phrase you will reuse often.",
      xp: 10,
    },
    {
      id: "cafe-answer",
      kind: "answer",
      prompt: "Intent check",
      question: "Which part makes the phrase sound like a polite request?",
      referenceAnswer: "onegaishimasu",
      explanation: "It softens the request and makes it suitable for service situations.",
      xp: 12,
    },
    {
      id: "cafe-write",
      kind: "write",
      prompt: "Mini scenario",
      question: "Write one polite line ordering tea or coffee.",
      referenceAnswer: "Koohii o onegaishimasu.",
      explanation: "Object + o + onegaishimasu is a good pattern to retain.",
      xp: 18,
    },
  ],
};

const workLesson: Lesson = {
  id: "lesson-office",
  title: "A small office hello",
  summary: "Blend your beginner greeting skills with a lightweight work context.",
  order: 4,
  difficulty: "medium",
  themeTags: ["work", "intro"],
  jlptTrack: "future-n5",
  published: true,
  exercises: [
    {
      id: "office-read",
      kind: "read",
      prompt: "Workplace phrase",
      question: "Hajimemashite is often used when meeting someone for the first time.",
      referenceAnswer: "hajimemashite",
      explanation: "It is especially helpful in introductions and new work settings.",
      xp: 10,
    },
    {
      id: "office-answer",
      kind: "answer",
      prompt: "Tone check",
      question: "Would 'hajimemashite' fit better for a first meeting or a repeated daily hello?",
      referenceAnswer: "first meeting",
      explanation: "It is a first-meeting phrase rather than a daily greeting.",
      xp: 12,
    },
    {
      id: "office-write",
      kind: "write",
      prompt: "Work intro",
      question: "Write a short first-meeting introduction with hajimemashite and your name.",
      referenceAnswer: "Hajimemashite. Watashi wa ___ desu.",
      explanation: "Use two short sentences if that feels clearer.",
      xp: 18,
    },
  ],
};

export const demoPath: LearningPath = {
  id: "jp-beginner-core",
  title: "Japanese Foundations",
  subtitle: "Everyday first, confidence fast.",
  description:
    "A fixed path for complete beginners who want visible progress in short sessions.",
  units: [
    {
      id: "unit-foundations",
      title: "First words",
      description: "Start speaking with greetings and self-introductions.",
      order: 1,
      lessons: [introLesson, nameLesson],
    },
    {
      id: "unit-real-life",
      title: "Useful moments",
      description: "Practice simple phrases for cafes and beginner work interactions.",
      order: 2,
      lessons: [cafeLesson, workLesson],
    },
  ],
};

export const demoMilestones: Milestone[] = [
  {
    id: "milestone-1",
    title: "First voice in Japanese",
    description: "Write and recognize your first greetings and introduction patterns.",
    targetXp: 24,
  },
  {
    id: "milestone-2",
    title: "Simple everyday confidence",
    description: "Finish enough lessons to ask politely in a basic real-world setting.",
    targetXp: 48,
  },
  {
    id: "milestone-3",
    title: "Beginner routine unlocked",
    description: "Build a repeatable study habit and prepare for more structured review.",
    targetXp: 72,
  },
];

const seededDrafts: LessonDraft[] = [
  {
    id: "draft-1",
    sourcePrompt: "Everyday beginner lesson for saying thank you and sorry politely.",
    reviewState: "reviewed",
    generatedLesson: {
      id: "draft-thanks",
      title: "Polite thanks and sorry",
      summary: "AI draft focusing on arigatou gozaimasu and sumimasen.",
      order: 5,
      difficulty: "easy",
      themeTags: ["everyday", "manners"],
      jlptTrack: "future-n5",
      published: false,
      exercises: [
        {
          id: "thanks-read",
          kind: "read",
          prompt: "Phrase read",
          question: "Arigatou gozaimasu is a polite way to say thank you.",
          referenceAnswer: "arigatou gozaimasu",
          explanation: "This phrase fits many public and work situations.",
          xp: 8,
        },
        {
          id: "thanks-answer",
          kind: "answer",
          prompt: "Usage check",
          question: "Which phrase works to politely apologize or say excuse me?",
          referenceAnswer: "sumimasen",
          explanation: "Sumimasen helps in many beginner interactions.",
          xp: 12,
        },
        {
          id: "thanks-write",
          kind: "write",
          prompt: "Compose",
          question: "Write one short line thanking a coworker politely.",
          referenceAnswer: "Arigatou gozaimasu.",
          explanation: "Keep it short and practical for v1 drafting.",
          xp: 16,
        },
      ],
    },
  },
];

export const demoState: AppState = {
  learner: {
    userId: "demo-user",
    displayName: "Aiko-in-progress",
    email: "demo@kotoba.app",
    role: "learner",
    onboarding: {
      beginnerConfirmed: true,
      dailyMinutes: 10,
      goal: "Speak a few useful words in daily Japanese as fast as possible.",
      motivation: "I want an efficient beginner path that still feels fun.",
    },
    streak: 4,
    xp: 28,
    currentLessonId: "lesson-name",
    completedLessonIds: ["lesson-hello"],
    milestoneIds: ["milestone-1"],
  },
  path: demoPath,
  milestones: demoMilestones,
  submissions: [
    {
      lessonId: "lesson-hello",
      totalAwardedXp: 24,
      completedAt: "2026-04-15T08:00:00.000Z",
      feedback: introLesson.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        learnerResponse: exercise.referenceAnswer,
        correctness: "correct",
        suggestedAnswer: exercise.referenceAnswer,
        explanation: exercise.explanation,
        awardedXp: Math.round(exercise.xp * 0.75),
      })),
    },
  ],
  drafts: seededDrafts,
};

export function getAllLessons(path: LearningPath) {
  return path.units.flatMap((unit) => unit.lessons);
}
