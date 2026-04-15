import { AppShell } from "@/components/app/app-shell";
import { ProgressOverview } from "@/components/app/progress-overview";
import { RequireAuth } from "@/components/app/protected-page";

export default function ProgressPage() {
  return (
    <AppShell eyebrow="Progress" title="Visible progress, not abstract scores">
      <RequireAuth>
        <ProgressOverview />
      </RequireAuth>
    </AppShell>
  );
}
