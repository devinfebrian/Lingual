import { AppShell } from "@/components/app/app-shell";
import { OnboardingForm } from "@/components/app/onboarding-form";
import { RequireAuth } from "@/components/app/protected-page";

export default function OnboardingPage() {
  return (
    <AppShell eyebrow="Onboarding" title="Tune the first-week routine">
      <RequireAuth>
        <div className="mx-auto max-w-3xl">
          <OnboardingForm />
        </div>
      </RequireAuth>
    </AppShell>
  );
}
