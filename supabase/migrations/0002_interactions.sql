-- One-Minute Museum — interactions (reactions + comments)
-- Run this in the Supabase SQL editor after 0001_foundation.sql.

-- ── reactions (one per user per post) ────────────────────────────────────────
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('thich','batngo','suyngam','vui')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.reactions enable row level security;

create policy "reactions read all"
  on public.reactions for select using (true);
create policy "reactions insert own"
  on public.reactions for insert with check (auth.uid() = user_id);
create policy "reactions update own"
  on public.reactions for update using (auth.uid() = user_id);
create policy "reactions delete own"
  on public.reactions for delete using (auth.uid() = user_id);

create index if not exists reactions_post_idx on public.reactions(post_id);

-- ── comments (flat) ──────────────────────────────────────────────────────────
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments read all"
  on public.comments for select using (true);
create policy "comments insert own"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "comments delete own"
  on public.comments for delete using (auth.uid() = user_id);

create index if not exists comments_post_idx on public.comments(post_id, created_at);
