import { AppShell } from "@/components/app/app-shell";
import { LessonPlayer } from "@/components/app/lesson-player";
import { RequireAuth } from "@/components/app/protected-page";

export default function LearnPage() {
  return (
    <AppShell eyebrow="Lesson" title="Read, answer, and write">
      <RequireAuth>
        <LessonPlayer />
      </RequireAuth>
    </AppShell>
  );
}
