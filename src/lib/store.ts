import { useSyncExternalStore } from "react";
import type { StageId } from "../content/types";

const KEY = "sdfp.v1";

export interface Attempt {
  id: string;
  promptId: string;
  startedAt: number;
  submittedAt: number;
  scores: Record<string, number>;
  notes: string;
}

export interface State {
  progress: Record<string, StageId[]>;
  notes: Record<string, string>;
  attempts: Attempt[];
}

const EMPTY: State = { progress: {}, notes: {}, attempts: [] };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      progress: parsed.progress ?? {},
      notes: parsed.notes ?? {},
      attempts: parsed.attempts ?? [],
    };
  } catch {
    return { ...EMPTY };
  }
}

let state: State = load();
const listeners = new Set<() => void>();
const changeListeners = new Set<(s: State) => void>();

function commit(next: State): void {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode or quota — keep working in memory */
  }
  listeners.forEach((l) => l());
  changeListeners.forEach((l) => l(state));
}

export function subscribeChange(fn: (s: State) => void): () => void {
  changeListeners.add(fn);
  return () => changeListeners.delete(fn);
}

export function getState(): State {
  return state;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function completedStages(slug: string): StageId[] {
  return state.progress[slug] ?? [];
}

export function completeStage(slug: string, stage: StageId): void {
  const done = completedStages(slug);
  if (done.includes(stage)) return;
  commit({
    ...state,
    progress: { ...state.progress, [slug]: [...done, stage] },
  });
}

export function uncompleteStage(slug: string, stage: StageId): void {
  const done = completedStages(slug).filter((s) => s !== stage);
  commit({ ...state, progress: { ...state.progress, [slug]: done } });
}

export function setNote(slug: string, text: string): void {
  commit({ ...state, notes: { ...state.notes, [slug]: text } });
}

export function addAttempt(attempt: Attempt): void {
  commit({ ...state, attempts: [attempt, ...state.attempts] });
}

export function mergeRemote(remote: {
  progress: Record<string, StageId[]>;
  notes: Record<string, string>;
}): void {
  const progress = { ...state.progress };
  for (const [slug, stages] of Object.entries(remote.progress)) {
    progress[slug] = Array.from(new Set([...(progress[slug] ?? []), ...stages]));
  }
  const notes = { ...remote.notes, ...state.notes };
  commit({ ...state, progress, notes });
}
