import { AppShell } from "@/components/app/app-shell";
import { RequireAuth } from "@/components/app/protected-page";
import { SettingsOverview } from "@/components/app/settings-overview";

export default function SettingsPage() {
  return (
    <AppShell eyebrow="Settings" title="Profile, auth, and deployment readiness">
      <RequireAuth>
        <SettingsOverview />
      </RequireAuth>
    </AppShell>
  );
}
