# Design — Social Foundation (auth + database + đăng bài)

**Date:** 2026-06-10
**Status:** Approved (pending spec review)
**Sub-project:** #1 trong lộ trình mạng xã hội (Nền tảng). Tiếp theo: #2 Feed, #3
Tương tác (cảm xúc/bình luận), #4 Profile.

## 1. Mục tiêu

Đặt **móng** để biến One-Minute Museum thành mạng xã hội: tài khoản (auth),
lưu trữ bền (database), và hành động **Đăng bài** — biến một exhibition đã tạo
thành một **bài công khai** gắn với tác giả. Chưa làm feed/tương tác/profile ở
bản này (các sub-project sau).

## 2. Quyết định đã chốt

- **Backend:** Supabase (Postgres + Auth + RLS).
- **Auth:** Google OAuth.
- **Mô hình:** Tạo exhibition **tự do, không cần login** (giữ trải nghiệm hiện
  tại). Login chỉ cần khi **Đăng bài** / tương tác / có profile.
- **Tích hợp:** `@supabase/ssr` (session qua cookie, chuẩn App Router).
- **Lưu post:** cột metadata + **`content jsonb`** (gọn, dễ map `Exhibition`).
- **Đăng text-only** ở bản này (ảnh người dùng để sau — cần Storage + moderation).
- Trang **`/me`** tối giản để kiểm chứng round-trip (feed đầy đủ là #2).

## 3. Packages & cấu hình

- Thêm `@supabase/supabase-js`, `@supabase/ssr`.
- Env (`.env.local`, người dùng tự điền từ Supabase project):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Google OAuth: cấu hình provider trong Supabase dashboard + redirect URL
  `<origin>/auth/callback` (hướng dẫn trong README).
- Code đọc env lúc runtime → **build không cần key thật**. Nếu thiếu env, các nút
  cộng đồng (Đăng nhập/Đăng bài) **ẩn/disabled** với chú thích "chưa cấu hình",
  không crash.

## 4. Supabase clients

- `lib/supabase/client.ts` — `createBrowserClient` (dùng ở client components).
- `lib/supabase/server.ts` — `createServerClient` đọc/ghi cookie qua `next/headers`
  (server components + route handlers).
- `middleware.ts` — refresh session cookie mỗi request (mẫu chuẩn `@supabase/ssr`).
- Helper `isSupabaseConfigured()` kiểm tra env tồn tại.

## 5. Data model (SQL — chạy trong Supabase)

Lưu vào `supabase/migrations/0001_foundation.sql`:

```sql
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles read all" on public.profiles for select using (true);
create policy "profiles insert self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update self" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- posts (published exhibitions)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  object_name text not null,
  mode text not null,
  voice text,
  language text not null default 'vi',
  content jsonb not null,           -- full Exhibition content fields
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "posts read all" on public.posts for select using (true);
create policy "posts insert own" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts update own" on public.posts for update using (auth.uid() = user_id);
create policy "posts delete own" on public.posts for delete using (auth.uid() = user_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);
```

`content jsonb` chứa: `title, hook, what_it_is, origin_or_context, three_fun_facts,
design_or_cultural_insight, why_it_matters, reflection_question, share_quote, hashtags`.

## 6. Types

`lib/types.ts` thêm:
```ts
export interface Post {
  id: string;
  user_id: string;
  object_name: string;
  mode: string;
  voice: string | null;
  language: string;
  created_at: string;
  content: Omit<Exhibition, "id" | "object_name" | "mode" | "voice" | "language" | "created_at">;
  author?: { display_name: string | null; avatar_url: string | null };
}
```

## 7. Luồng auth (Google)

- `components/AuthButton.tsx` (client): nếu chưa đăng nhập → nút **"Đăng nhập với
  Google"** gọi `supabase.auth.signInWithOAuth({ provider: 'google', options:{
  redirectTo: \`${location.origin}/auth/callback\` }})`. Nếu đã đăng nhập → avatar
  + menu **Đăng xuất** (`supabase.auth.signOut()`).
- `app/auth/callback/route.ts`: lấy `code` từ query → `exchangeCodeForSession` →
  redirect về `/`. Trigger DB tự tạo `profiles` row.
- Masthead trang chủ + gallery nhúng `AuthButton`.

## 8. Luồng Đăng bài

- `lib/posts.ts`:
  - `publishExhibition(ex: Exhibition)` (client) → `supabase.from('posts').insert({
    user_id, object_name, mode, voice, language, content })`. Trả post id hoặc lỗi.
  - `getMyPosts()` (server) → posts của `auth.uid()`, mới nhất trước.
- `components/PublishButton.tsx` (client) đặt ở khu kết quả:
  - Chưa login → bấm sẽ mời đăng nhập Google.
  - Đã login → đăng; thành công → "Đã đăng ✓", nút chuyển trạng thái (chặn đăng trùng trong phiên).
  - Env chưa cấu hình → ẩn.
- **Không kèm ảnh** (text-only). `image` của exhibition không đưa vào post.

## 9. Trang `/me` (kiểm chứng)

- `app/me/page.tsx` (server component): nếu chưa login → mời đăng nhập; nếu rồi →
  liệt kê "Bài tôi đã đăng" (tái dùng style `GalleryItem`). Mục đích: xác minh
  round-trip publish→DB→đọc lại. Feed công khai đầy đủ là #2.

## 10. Phạm vi file

| File | |
|---|---|
| `lib/supabase/client.ts`, `server.ts` | **mới** |
| `middleware.ts` | **mới** |
| `app/auth/callback/route.ts` | **mới** |
| `lib/posts.ts` | **mới** — publish + getMyPosts |
| `components/AuthButton.tsx`, `PublishButton.tsx` | **mới** |
| `app/me/page.tsx` | **mới** |
| `supabase/migrations/0001_foundation.sql` | **mới** |
| `lib/types.ts` | + `Post` |
| `app/page.tsx`, `app/gallery/page.tsx` | nhúng AuthButton; nhúng PublishButton ở kết quả |
| `.env.local`, `README.md` | thêm biến + hướng dẫn setup |
| `package.json` | + 2 package supabase |

Không đổi luồng generate/API hiện tại. Generate vẫn chạy không cần login.

## 11. Verify

- `npx tsc --noEmit` = 0 lỗi; `npm run build` pass **không cần Supabase key**
  (env-guarded).
- Review SQL (schema + RLS + trigger) bằng mắt.
- **Live test cần người dùng**: tạo Supabase project, bật Google provider, chạy
  migration, điền env. Khi đó test: đăng nhập Google → profile tự tạo → Đăng bài →
  thấy ở `/me` → đăng xuất. Mình hỗ trợ test cùng khi có key.
- Lưu ý: không có Playwright; UI nhìn mắt qua trình duyệt.

## 12. Ngoài phạm vi (sub-project sau)

- Feed công khai + trang chi tiết bài (#2).
- Thả cảm xúc + bình luận (#3).
- Profile công khai + follow (#4).
- Đăng kèm ảnh (Supabase Storage), kiểm duyệt/báo cáo, chống spam, thông báo.
