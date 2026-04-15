"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAppState } from "@/components/app/app-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.48a4.7 4.7 0 0 1-2.03 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.63Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.77-2.46l-3.3-2.56c-.91.61-2.08.98-3.47.98-2.67 0-4.93-1.8-5.74-4.22H2.86v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.26 13.74A5.98 5.98 0 0 1 5.94 12c0-.6.11-1.19.32-1.74V7.62H2.86a10 10 0 0 0 0 8.76l3.4-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.04c1.5 0 2.84.52 3.89 1.53l2.92-2.92C17.07 3 14.75 2 12 2A10 10 0 0 0 2.86 7.62l3.4 2.64C7.07 7.84 9.33 6.04 12 6.04Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAppState();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [activeMethod, setActiveMethod] = useState<"email" | "google" | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveMethod("email");
    setNotice("");
    setError("");

    try {
      const result = await signIn({ displayName, email }, mode);

      if (result.needsEmailCheck) {
        setNotice(
          `Magic link sent to ${email}. Open it to continue into the app.`,
        );
      } else {
        router.push(result.redirectTo);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed.",
      );
    } finally {
      setActiveMethod(null);
    }
  }

  async function handleGoogleAuth() {
    setActiveMethod("google");
    setNotice("");
    setError("");

    try {
      await signInWithGoogle(mode);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Google authentication failed.",
      );
      setActiveMethod(null);
    }
  }

  return (
    <Card className="w-full rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">
          {mode === "sign-up" ? "Create your learner account" : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {mode === "sign-up"
            ? "Save progress, track streaks, and keep your fixed beginner path in sync."
            : "Pick up exactly where your Japanese routine left off."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-border/70"
          disabled={activeMethod !== null}
          onClick={() => void handleGoogleAuth()}
        >
          <GoogleMark />
          {activeMethod === "google"
            ? "Opening Google..."
            : mode === "sign-up"
              ? "Continue with Google"
              : "Sign in with Google"}
        </Button>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          <div className="h-px flex-1 bg-border/70" />
          <span>Email magic link</span>
          <div className="h-px flex-1 bg-border/70" />
        </div>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {mode === "sign-up" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                placeholder="Mika-in-progress"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {notice ? (
            <p className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            This MVP supports email magic links and Google only.
          </p>
          <Button
            type="submit"
            className="h-12 rounded-2xl"
            disabled={activeMethod !== null}
          >
            {activeMethod === "email"
              ? "Sending link..."
              : mode === "sign-up"
                ? "Start with email"
                : "Continue with email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
