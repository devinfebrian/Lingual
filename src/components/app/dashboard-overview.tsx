"use client";

import { ArrowRight, Flame, Sparkles, Target } from "lucide-react";

import { ButtonLink } from "@/components/app/button-link";
import { useAppState } from "@/components/app/app-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAllLessons } from "@/lib/demo-data";

export function DashboardOverview() {
  const { learner, path, milestones } = useAppState().state;

  if (!learner) {
    return null;
  }

  const lessons = getAllLessons(path);
  const currentLesson =
    lessons.find((lesson) => lesson.id === learner.currentLessonId) ?? lessons[0];
  const nextMilestone =
    milestones.find((milestone) => !learner.milestoneIds.includes(milestone.id)) ??
    milestones[milestones.length - 1];
  const progressToMilestone = Math.min(
    100,
    Math.round((learner.xp / nextMilestone.targetXp) * 100),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
      <Card className="overflow-hidden rounded-[2rem] border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,245,238,0.95))] shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Daily lesson
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Beginner-safe
            </Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-tight">
              Keep momentum with {currentLesson.title.toLowerCase()}.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground">
              {currentLesson.summary}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Current streak</p>
              <p className="mt-2 text-3xl font-semibold">{learner.streak}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="mt-2 text-3xl font-semibold">{learner.xp}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Lessons done</p>
              <p className="mt-2 text-3xl font-semibold">
                {learner.completedLessonIds.length}/{lessons.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Next milestone</p>
                <p className="text-sm text-muted-foreground">{nextMilestone.title}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {learner.xp}/{nextMilestone.targetXp} XP
              </p>
            </div>
            <Progress value={progressToMilestone} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/learn" className="h-12 flex-1 rounded-2xl">
              Continue lesson
              <ArrowRight data-icon="inline-end" />
            </ButtonLink>
            <ButtonLink
              href="/path"
              variant="outline"
              className="h-12 flex-1 rounded-2xl"
            >
              View full path
            </ButtonLink>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-5 text-orange-500" />
              Habit engine
            </CardTitle>
            <CardDescription>
              Short wins are doing the heavy lifting in v1.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground">
            <p>Today&apos;s target: one text-first lesson, one written response, one quick recap.</p>
            <p>Friendly companion tone: celebratory, calm, and never punishing.</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-emerald-600" />
              Why this path works
            </CardTitle>
            <CardDescription>
              Everyday Japanese first, with work context layered in later.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 rounded-[1.25rem] bg-secondary/80 p-3">
              <Sparkles className="size-4 text-primary" />
              Fast beginner wins without overwhelming grammar walls.
            </div>
            <div className="flex items-center gap-3 rounded-[1.25rem] bg-secondary/80 p-3">
              <Sparkles className="size-4 text-primary" />
              Fixed sequencing so each lesson feels earned and clear.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
