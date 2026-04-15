"use client";

import { Database, LogOut, ShieldCheck } from "lucide-react";

import { useAppState } from "@/components/app/app-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";

export function SettingsOverview() {
  const { learner } = useAppState().state;
  const { signOut, useAdminDemo } = useAppState();

  if (!learner) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Profile and routine</CardTitle>
          <CardDescription>
            Keep the settings lightweight so learners stay in motion.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="rounded-[1.5rem] bg-secondary/70 p-4">
            <p className="font-medium">{learner.displayName}</p>
            <p className="text-muted-foreground">{learner.email}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/60 p-4">
            <p className="font-medium">Daily study target</p>
            <p className="text-muted-foreground">
              {learner.onboarding.dailyMinutes} minutes a day
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => void signOut()}
          >
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </CardContent>
      </Card>
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Backend readiness</CardTitle>
          <CardDescription>
            The app is demo-capable locally and Supabase-ready for production wiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-border/60 p-4">
            <Database className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Supabase status</p>
              <p>{isSupabaseConfigured ? "Configured via env vars." : "Running in demo mode until env vars are added."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-border/60 p-4">
            <ShieldCheck className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Admin access</p>
              <p>
                {isSupabaseAdminConfigured
                  ? "Server-side admin routes are ready. Grant your learner profile the admin role in Supabase to publish drafts."
                  : "Publish routes need a real service-role or secret key. Right now your admin key looks missing or invalid."}
              </p>
            </div>
          </div>
          {!isSupabaseConfigured && learner.role !== "admin" ? (
            <Button className="rounded-2xl" onClick={useAdminDemo}>
              Switch to admin demo
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
