import { ArrowRight, BookOpenText, Flame, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/app/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,236,221,0.9),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,214,179,0.55),transparent_24%),linear-gradient(180deg,#fffaf5_0%,#fff 52%,#fff8f2 100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between rounded-[2.5rem] border border-border/60 bg-background/82 p-6 shadow-[0_30px_80px_rgba(94,63,36,0.12)] backdrop-blur sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Beginner Japanese MVP
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Text-first, progress-first
              </Badge>
            </div>
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Kotoba Companion
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Learn useful Japanese fast, with a calmer path than noisy gamified apps.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                This app is built for complete beginners who want quick everyday progress, short lessons, visible milestones, and a friendly routine that actually sticks.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/sign-up" className="h-12 rounded-2xl px-6">
                Create account
                <ArrowRight data-icon="inline-end" />
              </ButtonLink>
              <ButtonLink
                href="/dashboard"
                variant="outline"
                className="h-12 rounded-2xl px-6"
              >
                Open demo app
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="rounded-[2rem] border-border/60 bg-[linear-gradient(180deg,rgba(255,248,240,0.85),rgba(255,255,255,0.96))] shadow-sm">
              <CardHeader>
                <CardTitle>What the first session unlocks</CardTitle>
                <CardDescription>
                  A beginner should leave with a few real phrases, not just taps.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-start gap-3 rounded-[1.5rem] bg-background/90 p-4">
                  <Sparkles className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-medium">Read a greeting with confidence</p>
                    <p className="text-sm text-muted-foreground">
                      Recognize your first polite daytime hello.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.5rem] bg-background/90 p-4">
                  <BookOpenText className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-medium">Write a simple self-introduction</p>
                    <p className="text-sm text-muted-foreground">
                      Produce a tiny sentence instead of just reading one.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.5rem] bg-background/90 p-4">
                  <Flame className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-medium">Start a habit loop that feels kind</p>
                    <p className="text-sm text-muted-foreground">
                      Gentle streaks, clear milestones, and no punishment theater.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
