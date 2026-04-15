import Link from "next/link";

import { AuthForm } from "@/components/app/auth-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f0_0%,#fff 60%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Start here
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Build your first Japanese habit with short, practical lessons.
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Start with Google or email, then move through a fixed beginner path with friendly momentum and real progress.
          </p>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
              Sign in instead
            </Link>
          </p>
        </div>
        <AuthForm mode="sign-up" />
      </div>
    </main>
  );
}
