# AGENTS.md — system-design-first-principles

Repo-local agent rules. Read before editing.

## What this repo is

A teaching course, not a product. It has three audiences:

- **Learners** read modules in the browser, complete stages, write notes, and
  run Arena attempts.
- **The author** adds modules as typed content files.
- **CI** runs `npm run build`, which typechecks before building.

If the build is red, the course is broken. If a module loses its number, its
"Break" stage, or its reversal condition, the course is also broken even when CI
is green.

## Stack

- Vite · React 18 · TypeScript, no UI framework, no CSS framework.
- Markdown content rendered by `marked` at runtime (content is in-repo, never
  user input — do not introduce a sanitiser dependency for it).
- Optional Supabase (Auth + Postgres + RLS). The app must work with **zero**
  credentials; sync is additive, never required.
- Hash routing, deliberately: `base: "./"` plus `#/` paths deploy to GitHub Pages,
  Cloudflare Pages, or a static bucket with no server rewrites.

## Commands

```bash
npm install
npm run dev        # vite
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build
```

## Where things live

```
src/content/        course data — modules are data, not code
src/widgets/        interactive models; register in registry.tsx
src/pages/          one file per route
src/components/     Shell, stage renderer, resources, notes
src/lib/            store (local-first), sync, supabase, router, markdown
supabase/migrations one file; RLS is mandatory on every table
```

## Content rules (non-negotiable)

1. **Every module contains a number you can derive.** Prose without arithmetic
   is not a module.
2. **Every Play widget must be honest.** If it simulates, it simulates — no
   decorative sliders. State the model in the stage body.
3. **Every Break stage is falsifiable.** The learner predicts, then the widget
   disagrees.
4. **Every Decide stage names a cost and a reversal condition.** No preferences
   dressed as decisions.
5. **Cite sources with real URLs.** Prefer primary sources and free access.

## Engineering rules

- Progress is **local-first**. Never make sign-in a prerequisite for reading or
  completing a module.
- Never overwrite local progress with remote state; merge (union of stages).
- Any new DB table gets RLS scoped to `auth.uid()` in the same migration.
- Keep dependencies boring. No router, no state library, no component library
  unless the existing machinery genuinely cannot do the job.
