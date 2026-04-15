import Link from "next/link";

import { AuthForm } from "@/components/app/auth-form";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f0_0%,#fff 60%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Sign in
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Pick up your Japanese routine without friction.
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Continue with Google or a one-tap email link, then jump back into your next beginner lesson.
          </p>
          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/sign-up" className="font-medium text-foreground underline underline-offset-4">
              Create one here
            </Link>
          </p>
        </div>
        <AuthForm mode="sign-in" />
      </div>
    </main>
  );
}
