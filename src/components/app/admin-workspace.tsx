"use client";

import { FormEvent, useDeferredValue, useEffect, useState } from "react";
import { AlertCircle, Check, Search, Send } from "lucide-react";

import { useAppState } from "@/components/app/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Lesson, LessonDraft } from "@/lib/types";

type QueueFilter = "all" | LessonDraft["reviewState"];

const queueFilters: QueueFilter[] = ["all", "draft", "reviewed", "published"];

const reviewLabels: Record<LessonDraft["reviewState"], string> = {
  draft: "Needs review",
  reviewed: "Reviewed",
  published: "Published",
};

function cloneLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    themeTags: [...lesson.themeTags],
    exercises: lesson.exercises.map((exercise) => ({ ...exercise })),
  };
}

function parseThemeTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildReview(lesson: Lesson) {
  const totalXp = lesson.exercises.reduce((sum, exercise) => sum + exercise.xp, 0);
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const coveredKinds = new Set(lesson.exercises.map((exercise) => exercise.kind));

  if (!lesson.title.trim()) {
    criticalIssues.push("Add a lesson title before publishing.");
  }

  if (!lesson.summary.trim()) {
    criticalIssues.push("Add a lesson summary before publishing.");
  }

  if (!lesson.exercises.length) {
    criticalIssues.push("Add at least one exercise so the lesson is usable.");
  }

  lesson.exercises.forEach((exercise, index) => {
    const label = `Exercise ${index + 1}`;

    if (!exercise.prompt.trim()) {
      criticalIssues.push(`${label} needs a short prompt label.`);
    }

    if (!exercise.question.trim()) {
      criticalIssues.push(`${label} needs a learner-facing question.`);
    }

    if (!exercise.referenceAnswer.trim()) {
      criticalIssues.push(`${label} needs a reference answer.`);
    }

    if (!exercise.explanation.trim()) {
      criticalIssues.push(`${label} needs an explanation.`);
    }

    if (exercise.xp <= 0) {
      criticalIssues.push(`${label} needs XP greater than zero.`);
    }
  });

  if (lesson.exercises.length < 3) {
    warnings.push("Consider at least three exercises for a fuller lesson flow.");
  }

  if (lesson.themeTags.length === 0) {
    warnings.push("Add theme tags so the draft is easier to scan in the queue.");
  }

  if (!coveredKinds.has("read") || !coveredKinds.has("answer") || !coveredKinds.has("write")) {
    warnings.push("Consider covering read, answer, and write practice in one draft.");
  }

  if (totalXp < 24 || totalXp > 60) {
    warnings.push("Total XP is outside the usual short lesson range of 24-60.");
  }

  return {
    criticalIssues,
    warnings,
    publishReady: criticalIssues.length === 0,
    totalXp,
  };
}

export function AdminWorkspace() {
  const { state, generateDraft, updateDraft, markDraftReviewed, publishDraft } =
    useAppState();
  const { drafts, path } = state;
  const [prompt, setPrompt] = useState(
    "Create a complete beginner lesson for Japanese greetings in a new team meeting.",
  );
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(
    drafts[0]?.id ?? null,
  );
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [queueQuery, setQueueQuery] = useState("");
  const [draftForm, setDraftForm] = useState<Lesson | null>(
    drafts[0] ? cloneLesson(drafts[0].generatedLesson) : null,
  );
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatorError, setGeneratorError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const deferredQueueQuery = useDeferredValue(queueQuery);

  const filteredDrafts = drafts.filter((draft) => {
    const matchesFilter = queueFilter === "all" || draft.reviewState === queueFilter;
    const query = deferredQueueQuery.trim().toLowerCase();

    if (!matchesFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      draft.generatedLesson.title,
      draft.generatedLesson.summary,
      draft.sourcePrompt,
      ...draft.generatedLesson.themeTags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const selectedDraft =
    drafts.find((draft) => draft.id === selectedDraftId) ?? filteredDrafts[0] ?? null;
  const selectedLesson = draftForm;
  const targetUnit = path.units[path.units.length - 1];
  const anchorLesson = targetUnit?.lessons[targetUnit.lessons.length - 1];
  const review = selectedLesson ? buildReview(selectedLesson) : null;
  const isDirty =
    selectedDraft && selectedLesson
      ? JSON.stringify(selectedDraft.generatedLesson) !== JSON.stringify(selectedLesson)
      : false;
  const draftCounts = {
    draft: drafts.filter((draft) => draft.reviewState === "draft").length,
    reviewed: drafts.filter((draft) => draft.reviewState === "reviewed").length,
    published: drafts.filter((draft) => draft.reviewState === "published").length,
  };

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setGeneratorError("");
    setActionMessage("");

    try {
      const draft = await generateDraft(prompt);
      setSelectedDraftId(draft.id);
    } catch (generateError) {
      setGeneratorError(
        generateError instanceof Error
          ? generateError.message
          : "Could not generate draft.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (!filteredDrafts.length) {
      setSelectedDraftId(null);
      return;
    }

    if (!selectedDraftId || !filteredDrafts.some((draft) => draft.id === selectedDraftId)) {
      setSelectedDraftId(filteredDrafts[0].id);
    }
  }, [filteredDrafts, selectedDraftId]);

  useEffect(() => {
    if (!selectedDraft) {
      setDraftForm(null);
      return;
    }

    setDraftForm(cloneLesson(selectedDraft.generatedLesson));
  }, [selectedDraft]);

  function updateLessonField<K extends keyof Lesson>(key: K, value: Lesson[K]) {
    setDraftForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateExerciseField(
    exerciseId: string,
    key: keyof Lesson["exercises"][number],
    value: Lesson["exercises"][number][typeof key],
  ) {
    setDraftForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, [key]: value } : exercise,
        ),
      };
    });
  }

  async function handleSaveDraft() {
    if (!selectedDraft || !selectedLesson) {
      return;
    }

    setIsSaving(true);
    setActionError("");
    setActionMessage("");

    try {
      await updateDraft(selectedDraft.id, selectedLesson);
      setActionMessage("Draft changes saved.");
    } catch (saveError) {
      setActionError(
        saveError instanceof Error ? saveError.message : "Could not save draft changes.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleResetDraft() {
    if (!selectedDraft) {
      return;
    }

    setDraftForm(cloneLesson(selectedDraft.generatedLesson));
    setActionError("");
    setActionMessage("Local edits reset to the last saved version.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Draft generator</CardTitle>
          <CardDescription>
            AI drafts the lesson shape. Human review decides what gets published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleGenerate}>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-36 rounded-[1.5rem]"
            />
            {generatorError ? (
              <p className="rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {generatorError}
              </p>
            ) : null}
            <Button type="submit" className="rounded-2xl" disabled={isGenerating}>
              <Send data-icon="inline-start" />
              Generate lesson draft
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Publishing status</CardTitle>
          <CardDescription>
            Drafts publish into the curriculum tail after review.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-[1.5rem] border border-border/60 p-4">
            <p className="font-medium text-foreground">{path.title}</p>
            <p>{path.units.length} units with built-in learner sequencing.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border/60 p-4">
              <p className="font-medium text-foreground">Needs review</p>
              <p>{draftCounts.draft} draft items.</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/60 p-4">
              <p className="font-medium text-foreground">Reviewed</p>
              <p>{draftCounts.reviewed} ready to publish.</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/60 p-4">
              <p className="font-medium text-foreground">Published</p>
              <p>{draftCounts.published} archived snapshots.</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/60 p-4">
            <p className="font-medium text-foreground">
              Next publish target: {targetUnit?.title ?? "No unit available"}
            </p>
            <p>
              New lessons append after {anchorLesson?.title ?? "the current last lesson"}.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:col-span-2 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
          <CardHeader className="gap-4">
            <div>
              <CardTitle>Draft review queue</CardTitle>
              <CardDescription>
                Filter the queue, then open one draft for focused review.
              </CardDescription>
            </div>
            <div className="grid gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={queueQuery}
                  onChange={(event) => setQueueQuery(event.target.value)}
                  placeholder="Search titles, prompts, or tags"
                  className="h-11 rounded-[1.25rem] pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {queueFilters.map((filter) => (
                  <Button
                    key={filter}
                    type="button"
                    variant={queueFilter === filter ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setQueueFilter(filter)}
                  >
                    {filter === "all" ? "All drafts" : reviewLabels[filter]}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {filteredDrafts.length ? filteredDrafts.map((draft) => {
              const totalXp = draft.generatedLesson.exercises.reduce(
                (sum, exercise) => sum + exercise.xp,
                0,
              );

              return (
                <button
                  key={draft.id}
                  type="button"
                  className={`grid gap-3 rounded-[1.5rem] border p-4 text-left transition-colors ${
                    selectedDraft?.id === draft.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-background hover:bg-secondary/40"
                  }`}
                  onClick={() => {
                    setSelectedDraftId(draft.id);
                    setActionError("");
                    setActionMessage("");
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {reviewLabels[draft.reviewState]}
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {draft.generatedLesson.exercises.length} exercises
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {totalXp} XP
                    </Badge>
                  </div>
                  <p className="font-medium text-foreground">
                    {draft.generatedLesson.title || "Untitled draft"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {draft.generatedLesson.summary}
                  </p>
                </button>
              );
            }) : (
              <div className="rounded-[1.5rem] border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
                No drafts match the current filters.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-background/90 shadow-sm">
          {selectedDraft && selectedLesson && review ? (
            <>
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {reviewLabels[selectedDraft.reviewState]}
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {selectedLesson.exercises.length} exercises
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        {review.totalXp} XP
                      </Badge>
                    </div>
                    <div>
                      <CardTitle>{selectedLesson.title || "Untitled draft"}</CardTitle>
                      <CardDescription>
                        Review the lesson copy, answer key, and publish destination before it goes live.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  {selectedDraft.reviewState !== "published" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        disabled={!isDirty || isSaving}
                        onClick={handleResetDraft}
                      >
                        Reset edits
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        disabled={!isDirty || isSaving}
                        onClick={handleSaveDraft}
                      >
                        Save changes
                      </Button>
                      {selectedDraft.reviewState === "draft" ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl"
                          disabled={busyDraftId === selectedDraft.id || isDirty || !review.publishReady}
                          onClick={async () => {
                            setBusyDraftId(selectedDraft.id);
                            setActionError("");
                            setActionMessage("");

                            try {
                              await markDraftReviewed(selectedDraft.id);
                              setActionMessage("Draft marked as reviewed.");
                            } catch (reviewError) {
                              setActionError(
                                reviewError instanceof Error
                                  ? reviewError.message
                                  : "Could not mark draft reviewed.",
                              );
                            } finally {
                              setBusyDraftId(null);
                            }
                          }}
                        >
                          <Check data-icon="inline-start" />
                          Mark reviewed
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        className="rounded-2xl"
                        disabled={busyDraftId === selectedDraft.id || isDirty || !review.publishReady}
                        onClick={async () => {
                          setBusyDraftId(selectedDraft.id);
                          setActionError("");
                          setActionMessage("");

                          try {
                            await publishDraft(selectedDraft.id);
                            setActionMessage("Draft published to the learner path.");
                          } catch (publishError) {
                            setActionError(
                              publishError instanceof Error
                                ? publishError.message
                                : "Could not publish draft.",
                            );
                          } finally {
                            setBusyDraftId(null);
                          }
                        }}
                      >
                        Publish to learner path
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Published as {selectedDraft.publishedLessonId}
                    </p>
                  )}
                </div>

                {isDirty ? (
                  <p className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Save changes before marking the draft reviewed or publishing it.
                  </p>
                ) : null}
                {actionError ? (
                  <p className="rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {actionError}
                  </p>
                ) : null}
                {!actionError && actionMessage ? (
                  <p className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    {actionMessage}
                  </p>
                ) : null}

                <div className="rounded-[1.5rem] border border-border/60 p-4">
                  <div className="flex items-center gap-2">
                    {review.publishReady ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="size-4 text-destructive" />
                    )}
                    <p className="font-medium text-foreground">Publish readiness</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Publishes into {path.title} under {targetUnit?.title}, after{" "}
                    {anchorLesson?.title ?? "the current last lesson"}.
                  </p>
                  <div className="mt-3 grid gap-2">
                    {review.criticalIssues.length ? (
                      review.criticalIssues.map((issue) => (
                        <div
                          key={issue}
                          className="rounded-xl bg-destructive/5 px-3 py-2 text-sm text-muted-foreground"
                        >
                          {issue}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                        Required fields are covered.
                      </div>
                    )}
                    {review.warnings.map((warning) => (
                      <div
                        key={warning}
                        className="rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="draft-title">Lesson title</Label>
                    <Input
                      id="draft-title"
                      value={selectedLesson.title}
                      onChange={(event) => updateLessonField("title", event.target.value)}
                      className="h-11 rounded-[1.25rem]"
                      disabled={selectedDraft.reviewState === "published"}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="draft-summary">Summary</Label>
                    <Textarea
                      id="draft-summary"
                      value={selectedLesson.summary}
                      onChange={(event) => updateLessonField("summary", event.target.value)}
                      className="min-h-24 rounded-[1.5rem]"
                      disabled={selectedDraft.reviewState === "published"}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="draft-tags">Theme tags</Label>
                      <Input
                        id="draft-tags"
                        value={selectedLesson.themeTags.join(", ")}
                        onChange={(event) =>
                          updateLessonField("themeTags", parseThemeTags(event.target.value))
                        }
                        className="h-11 rounded-[1.25rem]"
                        placeholder="everyday, work, greetings"
                        disabled={selectedDraft.reviewState === "published"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="draft-source">Source prompt</Label>
                      <Textarea
                        id="draft-source"
                        value={selectedDraft.sourcePrompt}
                        className="min-h-24 rounded-[1.5rem]"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Difficulty</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["easy", "medium"] as const).map((difficulty) => (
                          <Button
                            key={difficulty}
                            type="button"
                            variant={selectedLesson.difficulty === difficulty ? "default" : "outline"}
                            className="rounded-full"
                            disabled={selectedDraft.reviewState === "published"}
                            onClick={() => updateLessonField("difficulty", difficulty)}
                          >
                            {difficulty}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>JLPT track</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["future-n5", "future-n4"] as const).map((track) => (
                          <Button
                            key={track}
                            type="button"
                            variant={selectedLesson.jlptTrack === track ? "default" : "outline"}
                            className="rounded-full"
                            disabled={selectedDraft.reviewState === "published"}
                            onClick={() => updateLessonField("jlptTrack", track)}
                          >
                            {track}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <p className="font-medium text-foreground">Exercise details</p>
                  {selectedLesson.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="grid gap-3 rounded-[1.5rem] border border-border/60 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                          Exercise {index + 1}
                        </Badge>
                        <Badge variant="ghost" className="rounded-full px-3 py-1">
                          {exercise.kind}
                        </Badge>
                        <Badge variant="ghost" className="rounded-full px-3 py-1">
                          {exercise.xp} XP
                        </Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <Input
                          value={exercise.prompt}
                          onChange={(event) =>
                            updateExerciseField(exercise.id, "prompt", event.target.value)
                          }
                          className="h-11 rounded-[1.25rem]"
                          disabled={selectedDraft.reviewState === "published"}
                        />
                        <Input
                          type="number"
                          min={1}
                          value={exercise.xp}
                          onChange={(event) =>
                            updateExerciseField(
                              exercise.id,
                              "xp",
                              Math.max(1, Number(event.target.value) || 0),
                            )
                          }
                          className="h-11 w-28 rounded-[1.25rem]"
                          disabled={selectedDraft.reviewState === "published"}
                        />
                      </div>
                      <Textarea
                        value={exercise.question}
                        onChange={(event) =>
                          updateExerciseField(exercise.id, "question", event.target.value)
                        }
                        className="min-h-20 rounded-[1.5rem]"
                        disabled={selectedDraft.reviewState === "published"}
                      />
                      <Textarea
                        value={exercise.referenceAnswer}
                        onChange={(event) =>
                          updateExerciseField(
                            exercise.id,
                            "referenceAnswer",
                            event.target.value,
                          )
                        }
                        className="min-h-16 rounded-[1.5rem]"
                        disabled={selectedDraft.reviewState === "published"}
                      />
                      <Textarea
                        value={exercise.explanation}
                        onChange={(event) =>
                          updateExerciseField(
                            exercise.id,
                            "explanation",
                            event.target.value,
                          )
                        }
                        className="min-h-20 rounded-[1.5rem]"
                        disabled={selectedDraft.reviewState === "published"}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>No draft selected</CardTitle>
                <CardDescription>
                  Generate a lesson or pick one from the queue to start reviewing.
                </CardDescription>
              </CardHeader>
              <CardContent />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
