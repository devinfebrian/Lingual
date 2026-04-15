import { AdminWorkspace } from "@/components/app/admin-workspace";
import { AppShell } from "@/components/app/app-shell";
import { RequireAdmin, RequireAuth } from "@/components/app/protected-page";

export default function AdminPage() {
  return (
    <AppShell eyebrow="Admin" title="Draft, review, and publish lessons">
      <RequireAuth>
        <RequireAdmin>
          <AdminWorkspace />
        </RequireAdmin>
      </RequireAuth>
    </AppShell>
  );
}
