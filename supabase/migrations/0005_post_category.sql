-- One-Minute Museum — per-post content topic (category)
-- Run this in the Supabase SQL editor after 0004_post_theme.sql.

alter table public.posts add column if not exists category text;
create index if not exists posts_category_idx on public.posts(category);
