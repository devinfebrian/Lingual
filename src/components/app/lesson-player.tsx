"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";

import { ButtonLink } from "@/components/app/button-link";
import { useAppState } from "@/components/app/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getAllLessons } from "@/lib/demo-data";
import { LessonSubmissionFeedback } from "@/lib/types";

export function LessonPlayer() {
  const { state, completeLesson } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const learner = state.learner;
  const lesson = useMemo(() => {
    if (!learner) {
      return null;
    }

    return getAllLessons(state.path).find(
      (item) => item.id === learner.currentLessonId,
    );
  }, [learner, state.path]);

  if (!learner || !lesson) {
    return null;
  }

  const activeLesson = lesson;
  const exercise = activeLesson.exercises[stepIndex];
  const progressValue = ((stepIndex + 1) / activeLesson.exercises.length) * 100;

  function scoreResponse(answer: string, referenceAnswer: string) {
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedReference = referenceAnswer.trim().toLowerCase();

    if (!normalizedAnswer) {
      return "retry" as const;
    }

    if (
      normalizedAnswer === normalizedReference ||
      normalizedAnswer.includes(normalizedReference) ||
      normalizedReference.includes(normalizedAnswer)
    ) {
      return "correct" as const;
    }

    if (normalizedAnswer.split(" ").some((token) => normalizedReference.includes(token))) {
      return "close" as const;
    }

    return "retry" as const;
  }

  async function handleNext() {
    if (stepIndex < activeLesson.exercises.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    const feedback: LessonSubmissionFeedback[] = activeLesson.exercises.map((item) => {
      const learnerResponse = responses[item.id] ?? "";
      const correctness = scoreResponse(learnerResponse, item.referenceAnswer);
      const awardedXp =
        correctness === "correct"
          ? item.xp
          : correctness === "close"
            ? Math.round(item.xp * 0.7)
            : Math.round(item.xp * 0.35);

      return {
        exerciseId: item.id,
        learnerResponse,
        correctness,
        suggestedAnswer: item.referenceAnswer,
        explanation: item.explanation,
        awardedXp,
      };
    });

    setIsSaving(true);
    setError("");

    try {
      await completeLesson(activeLesson.id, feedback);
      setCompleted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save lesson progress.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setStepIndex(0);
    setResponses({});
    setCompleted(false);
  }

  if (completed) {
    return (
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <CheckCircle2 className="size-7 text-emerald-600" />
            Lesson complete
          </CardTitle>
          <CardDescription>
            You finished {activeLesson.title.toLowerCase()} and your dashboard is updated with new XP and the next lesson.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/dashboard" className="rounded-2xl">
            Return to dashboard
          </ButtonLink>
          <Button variant="outline" className="rounded-2xl" onClick={handleReset}>
            <RotateCcw data-icon="inline-start" />
            Replay lesson
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {exercise.kind}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {stepIndex + 1}/{activeLesson.exercises.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-tight">{activeLesson.title}</CardTitle>
            <CardDescription className="text-base leading-7">
              {exercise.prompt}
            </CardDescription>
          </div>
          <Progress value={progressValue} />
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="rounded-[1.5rem] border border-border/60 bg-secondary/50 p-4 text-base leading-7">
            {exercise.question}
          </div>
          <Textarea
            value={responses[exercise.id] ?? ""}
            onChange={(event) =>
              setResponses((current) => ({
                ...current,
                [exercise.id]: event.target.value,
              }))
            }
            placeholder="Write your answer here..."
            className="min-h-32 rounded-[1.5rem]"
          />
          {error ? (
            <p className="rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            className="h-12 rounded-2xl"
            disabled={isSaving}
            onClick={() => void handleNext()}
          >
            {stepIndex === lesson.exercises.length - 1 ? "Finish lesson" : "Next step"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Why this lesson is structured this way</CardTitle>
          <CardDescription>
            Each session moves from recognition to output so complete beginners feel real progress fast.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-[1.5rem] border border-border/60 p-4">
            <p className="font-medium text-foreground">Read first</p>
            <p>Reduce pressure and anchor the phrase in context.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/60 p-4">
            <p className="font-medium text-foreground">Answer second</p>
            <p>Check meaning and tone before asking for open production.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/60 p-4">
            <p className="font-medium text-foreground">Write third</p>
            <p>Force a small, achievable output moment for confidence.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
