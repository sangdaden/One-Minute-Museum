-- One-Minute Museum — social foundation schema
-- Run this in the Supabase SQL editor (or via the CLI) for your project.

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles read all"
  on public.profiles for select using (true);
create policy "profiles insert self"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update self"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row on signup, pulling name/avatar from the provider.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── posts (published exhibitions) ────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  object_name text not null,
  mode text not null,
  voice text,
  language text not null default 'vi',
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts read all"
  on public.posts for select using (true);
create policy "posts insert own"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "posts update own"
  on public.posts for update using (auth.uid() = user_id);
create policy "posts delete own"
  on public.posts for delete using (auth.uid() = user_id);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);
