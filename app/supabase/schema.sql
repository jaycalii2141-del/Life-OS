-- ─────────────────────────────────────────────────────────
-- Life OS — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
--
-- Stores each saved "document" (daily log, captures, sessions, skills)
-- as a JSON value keyed per user. Row Level Security guarantees every
-- user can only read and write their own rows.
-- ─────────────────────────────────────────────────────────

create table if not exists public.app_state (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.app_state enable row level security;

-- A single policy: a user may do anything to rows that belong to them.
drop policy if exists "own rows" on public.app_state;
create policy "own rows" on public.app_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
