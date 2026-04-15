"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAppState } from "@/components/app/app-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OnboardingForm() {
  const router = useRouter();
  const { state, updateOnboarding } = useAppState();
  const current = state.learner?.onboarding;
  const [dailyMinutes, setDailyMinutes] = useState(current?.dailyMinutes ?? 10);
  const [goal, setGoal] = useState(current?.goal ?? "");
  const [motivation, setMotivation] = useState(current?.motivation ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await updateOnboarding({
        beginnerConfirmed: true,
        dailyMinutes,
        goal,
        motivation,
      });
      router.push("/dashboard");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save onboarding.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Shape your first routine</CardTitle>
        <CardDescription>
          Keep this lightweight. The goal is to start strong, not over-plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dailyMinutes">Daily study minutes</Label>
            <Input
              id="dailyMinutes"
              type="number"
              min={5}
              max={45}
              value={dailyMinutes}
              onChange={(event) => setDailyMinutes(Number(event.target.value))}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal">Main goal</Label>
            <Textarea
              id="goal"
              placeholder="I want to say a few useful Japanese lines quickly and confidently."
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="motivation">What keeps you motivated?</Label>
            <Textarea
              id="motivation"
              placeholder="Friendly streaks, short wins, and clear visible progress."
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-12 rounded-2xl"
            disabled={isSaving}
          >
            Save and start
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
