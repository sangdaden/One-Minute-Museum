# Design — Real object photos on posts

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Context:** Hiện ảnh chụp/upload chỉ hiển thị lúc tạo (in-session), **không lưu/đăng**.
Feature này lưu ảnh vật vào **Supabase Storage** khi đăng và hiển thị trên feed/
bài/profile để feed sinh động hơn. (Themes bản sắc Việt = sub-project sau, đã pause.)

## 1. Quyết định đã chốt

- **Storage**: bucket **công khai** `post-images` (public read), user chỉ upload
  vào thư mục của mình.
- Ảnh dùng để tạo (image-based generation) **tự đăng kèm**; không có ảnh → đăng text như cũ.
- Chỉ đăng kèm ảnh khi **tạo-từ-ảnh** (chưa thêm nút "đính ảnh" cho bài text — để sau).
- Ảnh đã đăng là **công khai** (đăng là hành động chủ động của người dùng).

## 2. Storage + schema (migration `0003_post_images.sql`)

```sql
-- column on posts
alter table public.posts add column if not exists image_url text;

-- public bucket
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- storage.objects policies
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
```

Đường dẫn ảnh: `post-images/{user_id}/{uuid}.jpg`.

## 3. Types

- `Post` thêm `image_url?: string | null`.
- `PostRow` + `rowToPost`: map `image_url = row.image_url ?? null`.
- Ảnh **không** nằm trong `Exhibition`/`content`; truyền riêng cho card qua prop
  `imageUrl` (đã có sẵn ở `ExhibitionCard`).

## 4. Luồng đăng (`PublishButton`)

- Nhận thêm prop `imageUrl?: string` (data URI đã nén ≤1024px JPEG; page truyền `resultImage`).
- `handlePublish` (sau khi có user):
  1. Nếu có `imageUrl`:
     - `dataUrlToBlob(imageUrl)` → upload `post-images/{user.id}/{crypto.randomUUID()}.jpg`
       (`contentType: image/jpeg`). Lỗi upload → trạng thái error (không đăng, cho thử lại).
     - `getPublicUrl(path)` → `publicUrl`.
  2. `insert posts { ...exhibitionToPostInsert(ex, user.id), image_url: publicUrl ?? null }`.
- `lib/image.ts` thêm `dataUrlToBlob(dataUrl): Blob` (atob → Uint8Array → Blob, chạy ở browser).

## 5. Hiển thị

- **Feed** (`FeedPost`) và **`/p/[id]`**: `<ExhibitionCard ... imageUrl={post.image_url ?? undefined} />`
  → ô ảnh trong bento (đã có).
- **`GalleryItem`** (dùng ở `/u/[id]` và `/me`): thêm prop optional `imageUrl` →
  ảnh bìa nhỏ (cover) ở đầu thẻ khi có; truyền `post.image_url`. Gallery cục bộ
  (localStorage, chưa đăng) không có image_url → không ảnh, không đổi.

## 6. Phạm vi file

| File | |
|---|---|
| `supabase/migrations/0003_post_images.sql` | **mới** (chạy trong Supabase) |
| `lib/image.ts` | + `dataUrlToBlob` |
| `lib/types.ts` | `Post.image_url` |
| `lib/posts.ts` | `rowToPost` map image_url |
| `components/PublishButton.tsx` | nhận `imageUrl`, upload Storage, insert image_url |
| `app/create/page.tsx` | truyền `resultImage` vào `PublishButton` |
| `components/FeedPost.tsx`, `app/p/[id]/page.tsx` | truyền `image_url` vào ExhibitionCard |
| `components/GalleryItem.tsx` | + cover ảnh optional |
| `app/u/[id]/page.tsx`, `app/me/page.tsx` | truyền `image_url` vào GalleryItem |

Feed/detail query đã `select *` → có `image_url` tự động. Không đụng generate API.

## 7. Verify

- `tsc` + `build` (env-guarded).
- **Live (Supabase của bạn):** chạy `0003`; `/create` tạo **từ ảnh** → **Đăng** →
  feed/`/p/[id]` hiện **ảnh thật**; reload vẫn còn (ảnh ở Storage, public URL);
  profile/`/me` thẻ có ảnh bìa. Bài text (không ảnh) vẫn đăng bình thường.
- Không có Playwright — nhìn mắt qua trình duyệt.

## 8. Ngoài phạm vi (sau)

- Nút "đính/đổi ảnh" cho bài text (và đổi ảnh khi sửa bài).
- Xóa ảnh ở Storage khi xóa bài (cleanup) — hiện chỉ xóa post row.
- Nhiều ảnh/album, crop, nén phía server.
- **Themes bản sắc Việt** (sub-project kế tiếp — mockup đã lưu).
