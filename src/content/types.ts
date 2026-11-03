export type StageId =
  | "intuition"
  | "derive"
  | "play"
  | "break"
  | "decide"
  | "say";

export interface Stage {
  id: StageId;
  title: string;
  /** Markdown. Rendered below the stage heading. */
  body: string;
  /** Optional interactive widget, registered by id in widgets/registry.tsx */
  widget?: string;
  /** Optional single-question check, answered inline. */
  check?: {
    question: string;
    options: string[];
    answer: number;
    explain: string;
  };
}

export type ResourceKind = "video" | "paper" | "blog" | "book" | "docs" | "code";

export interface Resource {
  title: string;
  url: string;
  kind: ResourceKind;
  note?: string;
}

export interface Module {
  slug: string;
  number: number;
  part: PartId;
  title: string;
  /** One sentence: what you can do after this module. */
  promise: string;
  minutes: number;
  stages: Stage[];
  resources: Resource[];
  /** Modules without content render as "locked / next" in the sidebar. */
  ready?: boolean;
}

export type PartId = "physics" | "scaling" | "principal" | "drills";

export interface Part {
  id: PartId;
  label: string;
  title: string;
  blurb: string;
}

export const PARTS: Part[] = [
  {
    id: "physics",
    label: "Part I",
    title: "The physics of software",
    blurb:
      "Latency, capacity, storage and time. The constraints you cannot negotiate with, only budget for.",
  },
  {
    id: "scaling",
    label: "Part II",
    title: "The scaling moves",
    blurb:
      "The standard toolbox — derived, not memorised. Each move buys one property and pays for it with another.",
  },
  {
    id: "principal",
    label: "Part III",
    title: "Principal judgement",
    blurb:
      "Ambiguity, money, failure and time. What separates a design that works from a design that survives the org.",
  },
  {
    id: "drills",
    label: "Part IV",
    title: "Case drills",
    blurb:
      "Five 45-minute simulations. Same loop, real prompts, scored on the rubric interviewers actually use.",
  },
];
