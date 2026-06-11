-- One-Minute Museum — real object photos on posts
-- Run this in the Supabase SQL editor after 0002_interactions.sql.

-- column for the published photo's public URL
alter table public.posts add column if not exists image_url text;

-- public storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- storage.objects policies (folder = uploader's user id)
create policy "post images public read"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "post images user upload"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "post images user delete"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
