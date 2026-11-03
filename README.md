# System Design, From First Principles

A course that makes system design *derivable* instead of memorisable — then puts
you in the interview chair at Senior EM / Principal level.

The spine:

> Every system is a negotiation between three constraints — **physics** (latency,
> capacity, bandwidth), **economics** (cost per request, unit economics), and
> **coordination** (ordering, consistency, failure). Design is choosing which one
> to violate, and knowing who pays.

Each module runs the same six movements:

| Movement | What you do |
| --- | --- |
| **Intuition** | The one mental model, stated plainly. |
| **Derive** | One worked number, by hand. No hand-waving. |
| **Play** | A live model — drag the inputs, watch the system bend. |
| **Break** | Inject failure or 10× traffic. Predict first, then observe. |
| **Decide** | A forced tradeoff, written as a four-line ADR. |
| **Say it** | The 150-word answer you'd give out loud. |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
```

No account, no network, no database required. Progress and notes live in
`localStorage`.

## Optional: accounts and sync

Sync is opt-in. Without credentials the app is fully usable and stores
everything locally.

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Copy `env.example` to `.env.local` and fill in the project URL and anon key.
4. Restart `npm run dev`.

Sign-in is an email magic link. Tables are row-level-security scoped to
`auth.uid()`, so the anon key cannot read another user's rows. Signing in merges
local progress upward — it never clears what you already did.

## Curriculum

| Part | Modules |
| --- | --- |
| **I · The physics of software** | 01 latency & estimation · 02 capacity & queueing · 03 storage & access patterns · 04 consistency & time |
| **II · The scaling moves** | 05 load balancing & caching · 06 replication · 07 partitioning · 08 async & idempotency · 09 multi-region & blast radius |
| **III · Principal judgement** | 10 ambiguity → decision problem · 11 cost & unit economics · 12 SLOs & incident command · 13 evolution, org & Conway |
| **IV · Case drills** | 14 read-heavy · 15 write-heavy · 16 money moves · 17 media & CDN · 18 proximity |
| **V · The Arena** | 45-minute timed simulator, five gates, rubric scored on framing, numbers, tradeoffs, failure, and cost |

Module 01 ships with the app; the rest are authored in batches. Locked modules
render their promise so the arc stays visible.

## Authoring a module

A module is one file under `src/content/modules/`, typed by
`src/content/types.ts`. To ship one:

1. Write the six stages (markdown strings) and the resources list.
2. Add any widget to `src/widgets/registry.tsx` and reference it by id.
3. Set `ready: true` and remove the matching stub from `roadmap.ts`.

Content rules that keep the course honest:

- **Every module must contain a number you can derive.** If it can't be
  quantified, it isn't a first-principles module.
- **Every "Break" stage must be falsifiable** — the learner predicts, then the
  model disagrees.
- **Every "Decide" stage must name a cost and a reversal condition.**

## Sources

Built on Kleppmann's *Designing Data-Intensive Applications*, Dean & Barroso's
*The Tail at Scale*, Google's *SRE* book, the AWS Builders' Library, and
[liquidslr/system-design-notes](https://github.com/liquidslr/system-design-notes).
Every module links its own sources.

## Deploy

`main` deploys to GitHub Pages via `.github/workflows/pages.yml`. Set
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets to enable
sync in the deployed build; without them it deploys in local-only mode.
