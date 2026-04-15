"use client";

import { ButtonLink } from "@/components/app/button-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "@/components/app/app-provider";
import { isSupabaseConfigured } from "@/lib/env";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const {
    state: { learner },
    ready,
  } = useAppState();

  if (!ready) {
    return (
      <Card className="mx-auto max-w-lg rounded-[2rem] border-border/60 bg-background/90">
        <CardHeader>
          <CardTitle>Loading your learning space</CardTitle>
          <CardDescription>
            Checking your session and syncing the latest learner state.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (learner) {
    return <>{children}</>;
  }

  return (
    <Card className="mx-auto max-w-lg rounded-[2rem] border-border/60 bg-background/90">
      <CardHeader>
        <CardTitle>Sign in to continue</CardTitle>
        <CardDescription>
          The learner app, saved progress, and daily routine are protected behind account access.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/sign-up" className="flex-1 rounded-2xl">
          Create account
        </ButtonLink>
        <ButtonLink href="/sign-in" variant="outline" className="flex-1 rounded-2xl">
          Sign in
        </ButtonLink>
      </CardContent>
    </Card>
  );
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { learner } = useAppState().state;
  const { useAdminDemo } = useAppState();

  if (learner?.role === "admin") {
    return <>{children}</>;
  }

  return (
    <Card className="mx-auto max-w-xl rounded-[2rem] border-border/60 bg-background/90">
      <CardHeader>
        <CardTitle>Admin workspace is protected</CardTitle>
        <CardDescription>
          This area now expects a real Supabase-backed admin profile. Set your learner profile role to `admin` in the database to access publishing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        {!isSupabaseConfigured ? (
          <Button className="flex-1 rounded-2xl" onClick={useAdminDemo}>
            Use admin demo
          </Button>
        ) : null}
        <ButtonLink href="/settings" variant="outline" className="flex-1 rounded-2xl">
          Open settings
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
