-- Progress, notes and Arena attempts for system-design-first-principles.
-- Run in the Supabase SQL editor, or `supabase db push`.
-- Every table is user-scoped: RLS means the anon key cannot read another row.

create table if not exists public.module_progress (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  module_slug text        not null,
  stages      text[]      not null default '{}',
  updated_at  timestamptz not null default now(),
  primary key (user_id, module_slug)
);

create table if not exists public.notes (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  module_slug text        not null,
  body        text        not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, module_slug)
);

create table if not exists public.drill_attempts (
  id           uuid        primary key,
  user_id      uuid        not null references auth.users (id) on delete cascade,
  prompt_id    text        not null,
  started_at   timestamptz not null,
  submitted_at timestamptz not null,
  scores       jsonb       not null default '{}'::jsonb,
  notes        text        not null default ''
);

create index if not exists drill_attempts_user_idx
  on public.drill_attempts (user_id, submitted_at desc);

alter table public.module_progress enable row level security;
alter table public.notes           enable row level security;
alter table public.drill_attempts  enable row level security;

drop policy if exists "own module progress" on public.module_progress;
create policy "own module progress" on public.module_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own notes" on public.notes;
create policy "own notes" on public.notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own attempts" on public.drill_attempts;
create policy "own attempts" on public.drill_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
