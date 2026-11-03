import type { Module } from "../types";

/**
 * Modules 2–18. Titles and promises are fixed now so the curriculum is visible
 * (and so progress has something to point at). Content lands in batches; each
 * becomes `ready` by adding stages and resources to a file like 01-latency.ts.
 */
export const roadmap: Module[] = [
  {
    slug: "capacity-and-queueing",
    number: 2,
    part: "physics",
    title: "Capacity and the utilisation cliff",
    promise:
      "Predict when a system collapses using Little's Law, before it collapses.",
    minutes: 90,
    stages: [],
    resources: [],
  },
  {
    slug: "storage-and-access-patterns",
    number: 3,
    part: "physics",
    title: "Storage and access patterns",
    promise:
      "Choose between a B-tree and an LSM tree from the read/write ratio, not from fashion.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "consistency-and-time",
    number: 4,
    part: "physics",
    title: "Consistency and time",
    promise:
      "Explain what CAP does and does not say, and pick a consistency model your users can feel.",
    minutes: 110,
    stages: [],
    resources: [],
  },
  {
    slug: "load-balancing-and-caching",
    number: 5,
    part: "scaling",
    title: "Load balancing and caching",
    promise:
      "Turn a single box into a fleet, and know exactly when the cache becomes the outage.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "replication",
    number: 6,
    part: "scaling",
    title: "Replication",
    promise:
      "Choose a replication topology and articulate the failure it cannot survive.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "partitioning",
    number: 7,
    part: "scaling",
    title: "Partitioning",
    promise:
      "Split data without creating a hot key, and rebalance without a maintenance window.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "async-and-idempotency",
    number: 8,
    part: "scaling",
    title: "Async, retries and idempotency",
    promise:
      "Design for at-least-once delivery and prove that a duplicate request cannot charge twice.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "multi-region",
    number: 9,
    part: "scaling",
    title: "Multi-region and blast radius",
    promise:
      "Put a number on RTO and RPO, and contain failure to one cell instead of one company.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "ambiguity-to-decision",
    number: 10,
    part: "principal",
    title: "From vague prompt to decision problem",
    promise:
      "Convert \"design a chat app\" into scope, non-goals and the two questions worth asking.",
    minutes: 90,
    stages: [],
    resources: [],
  },
  {
    slug: "cost-as-architecture",
    number: 11,
    part: "principal",
    title: "Cost is an architecture constraint",
    promise:
      "Put unit economics on the whiteboard next to latency, and defend both.",
    minutes: 90,
    stages: [],
    resources: [],
  },
  {
    slug: "slos-and-incidents",
    number: 12,
    part: "principal",
    title: "SLOs and incident command",
    promise:
      "Set an error budget you will actually honour, and run the first 30 minutes of an incident.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "evolution-and-org",
    number: 13,
    part: "principal",
    title: "Evolution, org and Conway",
    promise:
      "Design the migration, not just the destination — and the team that will own it.",
    minutes: 100,
    stages: [],
    resources: [],
  },
  {
    slug: "drill-read-heavy",
    number: 14,
    part: "drills",
    title: "Drill: read-heavy",
    promise:
      "A feed that 50M people open on the same morning. Cache, fan-out, and the refresh storm.",
    minutes: 60,
    stages: [],
    resources: [],
  },
  {
    slug: "drill-write-heavy",
    number: 15,
    part: "drills",
    title: "Drill: write-heavy",
    promise:
      "Metrics ingestion at a million points a second. Ordering, partitioning, aggregation.",
    minutes: 60,
    stages: [],
    resources: [],
  },
  {
    slug: "drill-strong-consistency",
    number: 16,
    part: "drills",
    title: "Drill: money moves",
    promise:
      "Payments and bookings. Idempotency, sagas, and the ledger you cannot rewrite.",
    minutes: 60,
    stages: [],
    resources: [],
  },
  {
    slug: "drill-media",
    number: 17,
    part: "drills",
    title: "Drill: media and CDN",
    promise:
      "Video that must start in 400 ms, from a bucket that is 8,000 km away.",
    minutes: 60,
    stages: [],
    resources: [],
  },
  {
    slug: "drill-geo",
    number: 18,
    part: "drills",
    title: "Drill: proximity",
    promise:
      "Find the nearest driver without scanning the planet, and keep the index fresh.",
    minutes: 60,
    stages: [],
    resources: [],
  },
];
