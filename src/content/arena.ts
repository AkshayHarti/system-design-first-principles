export interface Axis {
  id: string;
  label: string;
  /** What a 4/4 answer sounds like. Shared with the learner, so they can aim. */
  anchor: string;
}

export const AXES: Axis[] = [
  {
    id: "framing",
    label: "Framing & ambiguity",
    anchor:
      "Restates the problem in your own words, names two non-goals, and asks the one question that actually changes the design.",
  },
  {
    id: "numbers",
    label: "Numbers & capacity",
    anchor:
      "Derives peak rps, storage per year and a latency budget out loud. States assumptions when data is missing instead of skipping the arithmetic.",
  },
  {
    id: "tradeoffs",
    label: "Tradeoffs & alternatives",
    anchor:
      "Presents two viable options with the cost of each, picks one, and names what would reverse the choice.",
  },
  {
    id: "failure",
    label: "Failure & operability",
    anchor:
      "Names the blast radius, the failure mode you cannot prevent, the rollback path, and the signal you would watch at 3am.",
  },
  {
    id: "cost_people",
    label: "Cost, evolution & ownership",
    anchor:
      "Prices the design per request or per customer, explains the migration from today's system, and says who owns it afterwards.",
  },
];

export interface Gate {
  id: string;
  atMinute: number;
  label: string;
  detail: string;
}

/** The 45-minute clock. Each gate is a thing you must have said before moving on. */
export const GATES: Gate[] = [
  {
    id: "frame",
    atMinute: 0,
    label: "Reframe and bound",
    detail:
      "Say the problem back in one sentence. Name two non-goals. Ask the one clarifying question that could change the design.",
  },
  {
    id: "numbers",
    atMinute: 5,
    label: "Do the arithmetic",
    detail:
      "Peak rps, bytes per day, retention, latency budget. Write the numbers where the interviewer can see them.",
  },
  {
    id: "shape",
    atMinute: 12,
    label: "Draw the spine",
    detail:
      "Client → edge → service → data. Only the components that earn their place. No box without a reason.",
  },
  {
    id: "deep",
    atMinute: 20,
    label: "Go deep on one thing",
    detail:
      "Pick the part that is actually hard and show depth: partitioning, ordering, consistency, or the hot path.",
  },
  {
    id: "break",
    atMinute: 32,
    label: "Break it yourself",
    detail:
      "Name the failure modes: a node dies, a region dies, traffic triples, a consumer lags. Say what degrades and what stops.",
  },
  {
    id: "land",
    atMinute: 40,
    label: "Land the tradeoff",
    detail:
      "What you would build first, what you would not build, what it costs, and what would make you change your mind.",
  },
];

export interface Prompt {
  id: string;
  title: string;
  brief: string;
  /** The hook that separates a senior answer from a staff+ answer. */
  twist: string;
}

export const PROMPTS: Prompt[] = [
  {
    id: "notifications",
    title: "Global notifications platform",
    brief:
      "Design a notification system for 200M users across email, push and SMS: preferences, fan-out, retries, and a hard guarantee that a user is never notified twice.",
    twist:
      "Marketing wants a send-now button for the whole user base. Legal wants an audit trail. Your on-call wants neither.",
  },
  {
    id: "checkout",
    title: "Checkout is slow and losing money",
    brief:
      "Payment API p99 is 4 seconds. Abandonment is costing roughly $180k/day. You have one quarter and no mandate to rewrite anything.",
    twist:
      "Half the latency is a third-party processor you cannot change. The other half is your own retry policy.",
  },
  {
    id: "migration",
    title: "Escape the monolith, without a rewrite",
    brief:
      "A 12-year-old monolith serves 40M users. Deploys take 6 hours and 3 teams are blocked on each other. Design the migration.",
    twist:
      "The CEO has read a blog post about microservices and wants a date. You have 14 engineers.",
  },
  {
    id: "flags",
    title: "Feature flags at 10M evaluations/sec",
    brief:
      "Design a feature-flag service: targeting rules, instant rollout, kill switches, and evaluation in under 5 ms at the edge.",
    twist:
      "If the flag service is down, every product decision freezes. That makes it tier-zero infrastructure.",
  },
  {
    id: "analytics",
    title: "Product analytics for 1M events/sec",
    brief:
      "Design ingestion and query for 1M events per second, with dashboards that must answer last-7-days questions in under 2 seconds.",
    twist:
      "Finance uses the same numbers to bill customers. Approximate answers are fine for product, not for invoices.",
  },
];
