-- One-Minute Museum — per-post Vietnamese theme
-- Run this in the Supabase SQL editor after 0003_post_images.sql.

alter table public.posts add column if not exists theme text;
