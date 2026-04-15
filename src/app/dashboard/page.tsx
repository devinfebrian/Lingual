import { AppShell } from "@/components/app/app-shell";
import { DashboardOverview } from "@/components/app/dashboard-overview";
import { RequireAuth } from "@/components/app/protected-page";

export default function DashboardPage() {
  return (
    <AppShell eyebrow="Dashboard" title="A fast, friendly Japanese routine">
      <RequireAuth>
        <DashboardOverview />
      </RequireAuth>
    </AppShell>
  );
}
