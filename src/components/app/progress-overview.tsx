"use client";

import { Trophy } from "lucide-react";

import { useAppState } from "@/components/app/app-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressOverview() {
  const { learner, milestones, submissions } = useAppState().state;

  if (!learner) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Milestone ladder</CardTitle>
          <CardDescription>
            Visible progress matters more than formal exams in the first release.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {milestones.map((milestone) => {
            const earned = learner.milestoneIds.includes(milestone.id);
            const value = Math.min(100, Math.round((learner.xp / milestone.targetXp) * 100));

            return (
              <div
                key={milestone.id}
                className="rounded-[1.5rem] border border-border/60 bg-secondary/60 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                  <Trophy className={earned ? "size-5 text-amber-500" : "size-5 text-muted-foreground"} />
                </div>
                <Progress value={value} />
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Recent wins</CardTitle>
          <CardDescription>Your latest completed lessons and feedback loops.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {submissions.map((submission) => (
            <div
              key={submission.lessonId}
              className="rounded-[1.5rem] border border-border/60 bg-background p-4"
            >
              <p className="font-medium">{submission.lessonId}</p>
              <p className="text-sm text-muted-foreground">
                {submission.totalAwardedXp} XP earned on{" "}
                {new Date(submission.completedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
