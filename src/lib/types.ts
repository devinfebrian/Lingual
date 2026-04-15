export type ExerciseKind = "read" | "answer" | "write";

export interface LessonExercise {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  question: string;
  referenceAnswer: string;
  explanation: string;
  xp: number;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  order: number;
  difficulty: "easy" | "medium";
  themeTags: string[];
  jlptTrack: "future-n5" | "future-n4";
  published: boolean;
  exercises: LessonExercise[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  units: Unit[];
}

export interface LearnerOnboarding {
  beginnerConfirmed: boolean;
  dailyMinutes: number;
  goal: string;
  motivation: string;
}

export interface LearnerProfile {
  userId: string;
  displayName: string;
  email: string;
  role: "learner" | "admin";
  onboarding: LearnerOnboarding;
  streak: number;
  xp: number;
  currentLessonId: string;
  completedLessonIds: string[];
  milestoneIds: string[];
}

export interface SignInResult {
  needsEmailCheck: boolean;
  redirectTo: string;
}

export interface LessonSubmissionFeedback {
  exerciseId: string;
  learnerResponse: string;
  correctness: "correct" | "close" | "retry";
  suggestedAnswer: string;
  explanation: string;
  awardedXp: number;
}

export interface LessonSubmission {
  lessonId: string;
  feedback: LessonSubmissionFeedback[];
  totalAwardedXp: number;
  completedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetXp: number;
}

export interface LessonDraft {
  id: string;
  sourcePrompt: string;
  reviewState: "draft" | "reviewed" | "published";
  generatedLesson: Lesson;
  publishedLessonId?: string;
}

export interface AppState {
  learner: LearnerProfile | null;
  path: LearningPath;
  milestones: Milestone[];
  submissions: LessonSubmission[];
  drafts: LessonDraft[];
}
