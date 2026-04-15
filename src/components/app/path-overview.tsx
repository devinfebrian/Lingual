"use client";

import { CheckCircle2, Circle, Lock } from "lucide-react";

import { useAppState } from "@/components/app/app-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllLessons } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function PathOverview() {
  const { learner, path } = useAppState().state;

  if (!learner) {
    return null;
  }

  const unlockedLessons = new Set<string>();
  const allLessons = getAllLessons(path);
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === learner.currentLessonId);

  allLessons.forEach((lesson, index) => {
    if (index <= currentIndex) {
      unlockedLessons.add(lesson.id);
    }
  });

  return (
    <div className="grid gap-4">
      {path.units.map((unit) => (
        <Card key={unit.id} className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{unit.title}</CardTitle>
            <CardDescription>{unit.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {unit.lessons.map((lesson) => {
              const complete = learner.completedLessonIds.includes(lesson.id);
              const unlocked = unlockedLessons.has(lesson.id);

              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-[1.5rem] border p-4",
                    complete
                      ? "border-emerald-200 bg-emerald-50"
                      : unlocked
                        ? "border-border/60 bg-background"
                        : "border-border/40 bg-secondary/60 opacity-75",
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.themeTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{lesson.summary}</p>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {complete ? (
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    ) : unlocked ? (
                      <Circle className="size-5 text-primary" />
                    ) : (
                      <Lock className="size-5" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
