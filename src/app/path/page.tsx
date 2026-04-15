import { AppShell } from "@/components/app/app-shell";
import { PathOverview } from "@/components/app/path-overview";
import { RequireAuth } from "@/components/app/protected-page";

export default function PathPage() {
  return (
    <AppShell eyebrow="Curriculum" title="A fixed path for complete beginners">
      <RequireAuth>
        <PathOverview />
      </RequireAuth>
    </AppShell>
  );
}
