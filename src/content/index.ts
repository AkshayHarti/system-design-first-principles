import { latency } from "./modules/01-latency";
import { roadmap } from "./modules/roadmap";
import type { Module } from "./types";

export const modules: Module[] = [latency, ...roadmap].sort(
  (a, b) => a.number - b.number,
);

export const moduleBySlug = new Map(modules.map((m) => [m.slug, m]));

export const readyModules = modules.filter((m) => m.ready);

export const firstModule = readyModules[0];

export const STAGE_ORDER = [
  "intuition",
  "derive",
  "play",
  "break",
  "decide",
  "say",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  intuition: "Intuition",
  derive: "Derive",
  play: "Play",
  break: "Break",
  decide: "Decide",
  say: "Say it",
};
