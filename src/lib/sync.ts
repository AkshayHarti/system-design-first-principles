import type { StageId } from "../content/types";
import { getState, mergeRemote, subscribeChange } from "./store";
import { supabase } from "./supabase";

/**
 * Progress is local-first: localStorage is the source of truth for this device.
 * Signing in unions local and remote stages (never loses progress), then mirrors
 * every change upward on a short debounce.
 */
export function startSync(userId: string): () => void {
  if (!supabase) return () => {};

  const db = supabase;

  async function push(): Promise<void> {
    const s = getState();
    const now = new Date().toISOString();

    const progress = Object.entries(s.progress).map(([slug, stages]) => ({
      user_id: userId,
      module_slug: slug,
      stages,
      updated_at: now,
    }));
    if (progress.length) {
      await db
        .from("module_progress")
        .upsert(progress, { onConflict: "user_id,module_slug" });
    }

    const notes = Object.entries(s.notes).map(([slug, body]) => ({
      user_id: userId,
      module_slug: slug,
      body,
      updated_at: now,
    }));
    if (notes.length) {
      await db.from("notes").upsert(notes, { onConflict: "user_id,module_slug" });
    }

    const attempts = s.attempts.map((a) => ({
      id: a.id,
      user_id: userId,
      prompt_id: a.promptId,
      started_at: new Date(a.startedAt).toISOString(),
      submitted_at: new Date(a.submittedAt).toISOString(),
      scores: a.scores,
      notes: a.notes,
    }));
    if (attempts.length) {
      await db.from("drill_attempts").upsert(attempts, { onConflict: "id" });
    }
  }

  async function pull(): Promise<void> {
    const [progressRes, notesRes] = await Promise.all([
      db.from("module_progress").select("module_slug, stages").eq("user_id", userId),
      db.from("notes").select("module_slug, body").eq("user_id", userId),
    ]);

    const progress: Record<string, StageId[]> = {};
    for (const row of progressRes.data ?? []) {
      progress[row.module_slug] = (row.stages ?? []) as StageId[];
    }
    const notes: Record<string, string> = {};
    for (const row of notesRes.data ?? []) {
      notes[row.module_slug] = row.body ?? "";
    }
    mergeRemote({ progress, notes });
  }

  void pull().then(push);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = subscribeChange(() => {
    clearTimeout(timer);
    timer = setTimeout(() => void push(), 700);
  });

  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
