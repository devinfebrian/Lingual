"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";

import { demoState, getAllLessons } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { generateLessonDraft } from "@/lib/lesson-generator";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildCompletionPatch,
  buildProfilePatch,
  loadAppState,
} from "@/lib/supabase/app-state";
import {
  AppState,
  LearnerOnboarding,
  LessonDraft,
  LessonSubmissionFeedback,
  SignInResult,
} from "@/lib/types";

interface AuthInput {
  displayName?: string;
  email: string;
}

interface AppContextValue {
  state: AppState;
  ready: boolean;
  signIn: (
    input: AuthInput,
    mode: "sign-in" | "sign-up",
  ) => Promise<SignInResult>;
  signInWithGoogle: (mode: "sign-in" | "sign-up") => Promise<void>;
  signOut: () => Promise<void>;
  updateOnboarding: (onboarding: LearnerOnboarding) => Promise<void>;
  completeLesson: (
    lessonId: string,
    feedback: LessonSubmissionFeedback[],
  ) => Promise<void>;
  generateDraft: (prompt: string) => Promise<LessonDraft>;
  updateDraft: (
    draftId: string,
    generatedLesson: LessonDraft["generatedLesson"],
  ) => Promise<void>;
  markDraftReviewed: (draftId: string) => Promise<void>;
  publishDraft: (draftId: string) => Promise<void>;
  useAdminDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const baseState: AppState = {
  ...demoState,
  learner: null,
  submissions: [],
};

function createLearner(input: AuthInput, role: "learner" | "admin") {
  const firstLessonId = getAllLessons(demoState.path)[0]?.id ?? "";

  return {
    onboarding: {
      beginnerConfirmed: true,
      dailyMinutes: 10,
      goal: "",
      motivation: "",
    },
    userId: `user-${Date.now()}`,
    role,
    displayName: input.displayName || input.email.split("@")[0] || "Learner",
    email: input.email,
    streak: 0,
    xp: 0,
    currentLessonId: firstLessonId,
    completedLessonIds: [],
    milestoneIds: [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(baseState);
  const [ready, setReady] = useState(false);
  const [supabase] = useState(() => createSupabaseBrowserClient());

  useEffect(() => {
    let cancelled = false;

    async function refreshState() {
      if (!supabase) {
        if (!cancelled) {
          startTransition(() => {
            setState(baseState);
            setReady(true);
          });
        }
        return;
      }

      try {
        await fetch("/api/bootstrap", { method: "POST" });
      } catch {
        // Keep going even when bootstrap is unavailable; the app can still load fallback content.
      }

      try {
        const nextState = await loadAppState(supabase);

        if (!cancelled) {
          startTransition(() => {
            setState(nextState);
            setReady(true);
          });
        }
      } catch (error) {
        console.error("Failed to load app state", error);

        if (!cancelled) {
          startTransition(() => {
            setState((current) => ({
              ...current,
              learner: null,
              submissions: [],
              path: demoState.path,
            }));
            setReady(true);
          });
        }
      }
    }

    void refreshState();

    if (!supabase) {
      return () => {
        cancelled = true;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshState();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value: AppContextValue = {
    state,
    ready,
    async signIn(input, mode) {
      if (!supabase || !isSupabaseConfigured) {
        startTransition(() => {
          setState((current) => ({
            ...current,
            learner: createLearner(
              input,
              input.email.includes("admin") ? "admin" : "learner",
            ),
          }));
        });

        return {
          needsEmailCheck: false,
          redirectTo: mode === "sign-up" ? "/onboarding" : "/dashboard",
        };
      }

      const redirectTo = mode === "sign-up" ? "/onboarding" : "/dashboard";
      const { error } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          shouldCreateUser: mode === "sign-up",
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            redirectTo,
          )}`,
          data: input.displayName
            ? {
                display_name: input.displayName,
              }
            : undefined,
        },
      });

      if (error) {
        throw error;
      }

      return {
        needsEmailCheck: true,
        redirectTo,
      };
    },
    async signInWithGoogle(mode) {
      const redirectTo = mode === "sign-up" ? "/onboarding" : "/dashboard";

      if (!supabase || !isSupabaseConfigured) {
        startTransition(() => {
          setState((current) => ({
            ...current,
            learner: createLearner(
              {
                displayName: "Google learner",
                email: "google-learner@example.com",
              },
              "learner",
            ),
          }));
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            redirectTo,
          )}`,
        },
      });

      if (error) {
        throw error;
      }
    },
    async signOut() {
      if (!supabase) {
        startTransition(() => {
          setState((current) => ({ ...current, learner: null }));
        });
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    },
    async updateOnboarding(onboarding) {
      if (!state.learner) {
        return;
      }

      if (!supabase) {
        startTransition(() => {
          setState((current) => {
            if (!current.learner) {
              return current;
            }

            return {
              ...current,
              learner: {
                ...current.learner,
                onboarding,
              },
            };
          });
        });
        return;
      }

      const { error } = await supabase
        .from("learner_profiles")
        .update(buildProfilePatch(onboarding, state.learner))
        .eq("id", state.learner.userId);

      if (error) {
        throw error;
      }

      startTransition(() => {
        setState((current) => {
          if (!current.learner) {
            return current;
          }

          return {
            ...current,
            learner: {
              ...current.learner,
              onboarding,
            },
          };
        });
      });
    },
    async completeLesson(lessonId, feedback) {
      if (!state.learner) {
        return;
      }

      const { completedLessonIds, profilePatch, totalAwardedXp, xp } =
        buildCompletionPatch(state.learner, state.path, lessonId, feedback);

      if (!supabase) {
        startTransition(() => {
          setState((current) => {
            if (!current.learner) {
              return current;
            }

            return {
              ...current,
              learner: {
                ...current.learner,
                xp,
                streak: current.learner.streak + 1,
                completedLessonIds,
                milestoneIds: profilePatch.milestone_ids,
                currentLessonId: profilePatch.current_lesson_id,
              },
              submissions: [
                {
                  lessonId,
                  feedback,
                  totalAwardedXp,
                  completedAt: new Date().toISOString(),
                },
                ...current.submissions.filter(
                  (submission) => submission.lessonId !== lessonId,
                ),
              ],
            };
          });
        });
        return;
      }

      const { error: submissionError } = await supabase
        .from("lesson_submissions")
        .insert({
          learner_id: state.learner.userId,
          lesson_id: lessonId,
          total_awarded_xp: totalAwardedXp,
          feedback,
        });

      if (submissionError) {
        throw submissionError;
      }

      const { error: profileError } = await supabase
        .from("learner_profiles")
        .update(profilePatch)
        .eq("id", state.learner.userId);

      if (profileError) {
        throw profileError;
      }

      startTransition(() => {
        setState((current) => {
          if (!current.learner) {
            return current;
          }

          return {
            ...current,
            learner: {
              ...current.learner,
              xp,
              streak: current.learner.streak + 1,
              completedLessonIds,
              milestoneIds: profilePatch.milestone_ids,
              currentLessonId: profilePatch.current_lesson_id,
            },
            submissions: [
              {
                lessonId,
                feedback,
                totalAwardedXp,
                completedAt: new Date().toISOString(),
              },
              ...current.submissions.filter(
                (submission) => submission.lessonId !== lessonId,
              ),
            ],
          };
        });
      });
    },
    async generateDraft(prompt) {
      const draft = generateLessonDraft(prompt, getAllLessons(state.path).length + 1);

      if (!supabase) {
        startTransition(() => {
          setState((current) => ({
            ...current,
            drafts: [draft, ...current.drafts],
          }));
        });

        return draft;
      }

      const { data, error } = await supabase
        .from("lesson_drafts")
        .insert({
          source_prompt: prompt,
          review_state: "draft",
          generated_lesson: draft.generatedLesson,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      const persistedDraft = {
        ...draft,
        id: (data as { id: string }).id,
      };

      startTransition(() => {
        setState((current) => ({
          ...current,
          drafts: [persistedDraft, ...current.drafts],
        }));
      });

      return persistedDraft;
    },
    async updateDraft(draftId, generatedLesson) {
      if (!supabase) {
        startTransition(() => {
          setState((current) => ({
            ...current,
            drafts: current.drafts.map((draft) =>
              draft.id === draftId ? { ...draft, generatedLesson } : draft,
            ),
          }));
        });
        return;
      }

      const { error } = await supabase
        .from("lesson_drafts")
        .update({ generated_lesson: generatedLesson })
        .eq("id", draftId);

      if (error) {
        throw error;
      }

      startTransition(() => {
        setState((current) => ({
          ...current,
          drafts: current.drafts.map((draft) =>
            draft.id === draftId ? { ...draft, generatedLesson } : draft,
          ),
        }));
      });
    },
    async markDraftReviewed(draftId) {
      if (!supabase) {
        startTransition(() => {
          setState((current) => ({
            ...current,
            drafts: current.drafts.map((draft) =>
              draft.id === draftId
                ? { ...draft, reviewState: "reviewed" }
                : draft,
            ),
          }));
        });
        return;
      }

      const { error } = await supabase
        .from("lesson_drafts")
        .update({ review_state: "reviewed" })
        .eq("id", draftId);

      if (error) {
        throw error;
      }

      startTransition(() => {
        setState((current) => ({
          ...current,
          drafts: current.drafts.map((draft) =>
            draft.id === draftId ? { ...draft, reviewState: "reviewed" } : draft,
          ),
        }));
      });
    },
    async publishDraft(draftId) {
      if (!supabase) {
        startTransition(() => {
          setState((current) => {
            const targetDraft = current.drafts.find((draft) => draft.id === draftId);

            if (!targetDraft) {
              return current;
            }

            const updatedUnits = current.path.units.map((unit, index) =>
              index === current.path.units.length - 1
                ? {
                    ...unit,
                    lessons: [
                      ...unit.lessons,
                      {
                        ...targetDraft.generatedLesson,
                        published: true,
                      },
                    ],
                  }
                : unit,
            );

            return {
              ...current,
              path: {
                ...current.path,
                units: updatedUnits,
              },
              drafts: current.drafts.map((draft) =>
                draft.id === draftId
                  ? {
                      ...draft,
                      reviewState: "published",
                      publishedLessonId: draft.generatedLesson.id,
                    }
                  : draft,
              ),
            };
          });
        });
        return;
      }

      const response = await fetch("/api/admin/publish-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to publish draft.");
      }

      const nextState = await loadAppState(supabase);

      startTransition(() => {
        setState(nextState);
      });
    },
    useAdminDemo() {
      if (supabase) {
        return;
      }

      startTransition(() => {
        setState((current) => ({
          ...current,
          learner: {
            ...createLearner(
              {
                displayName: "Sensei Admin",
                email: "admin@kotoba.app",
              },
              "admin",
            ),
            role: "admin",
            displayName: "Sensei Admin",
            email: "admin@kotoba.app",
          },
        }));
      });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }

  return context;
}
