# Design — Reactions + Comments + Permalink (#3)

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Sub-project:** #3. Phụ thuộc #1 (auth + posts) và #2 (feed). Tiếp theo: #4 profile.

## 1. Mục tiêu

Cho người dùng **thả cảm xúc** (ở feed) và **bình luận** (ở trang chi tiết) trên
mỗi bài. Thêm **permalink `/p/[id]`** — URL chia sẻ + nơi đặt bình luận.

## 2. Quyết định đã chốt

- **Cảm xúc**: bộ 4 — `thich` ❤️ Thích · `batngo` 😮 Bất ngờ · `suyngam` 🤔 Suy ngẫm ·
  `vui` 😄 Vui. Mỗi người **1 cảm xúc/bài**, đổi/bỏ được.
- **Hiển thị**: cảm xúc **inline ở feed** (và ở chi tiết); bình luận ở **`/p/[id]`**.
  Feed có thanh cảm xúc + "N bình luận" → link chi tiết.
- **Bình luận**: phẳng (không reply lồng), sắp **cũ→mới**.
- **Quyền**: xem công khai; **login** mới thả cảm xúc/bình luận (Google OAuth như #1).
- **Mutation**: gọi Supabase **browser client** trực tiếp (RLS bảo vệ), như `PublishButton`.

## 3. Data model (migration `0002_interactions.sql`)

```sql
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('thich','batngo','suyngam','vui')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
alter table public.reactions enable row level security;
create policy "reactions read all"   on public.reactions for select using (true);
create policy "reactions insert own" on public.reactions for insert with check (auth.uid() = user_id);
create policy "reactions update own" on public.reactions for update using (auth.uid() = user_id);
create policy "reactions delete own" on public.reactions for delete using (auth.uid() = user_id);
create index reactions_post_idx on public.reactions(post_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create policy "comments read all"   on public.comments for select using (true);
create policy "comments insert own" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments delete own" on public.comments for delete using (auth.uid() = user_id);
create index comments_post_idx on public.comments(post_id, created_at);
```

## 4. Types

`Post` thêm (optional, để feed/chi tiết nạp kèm):
```ts
reactions?: { type: string; user_id: string }[];
comment_count?: number;
```
Thêm:
```ts
export interface Comment {
  id: string; post_id: string; user_id: string;
  body: string; created_at: string;
  author?: { display_name: string | null; avatar_url: string | null };
}
export const REACTIONS = [
  { type: "thich",   emoji: "❤️", label: "Thích" },
  { type: "batngo",  emoji: "😮", label: "Bất ngờ" },
  { type: "suyngam", emoji: "🤔", label: "Suy ngẫm" },
  { type: "vui",     emoji: "😄", label: "Vui" },
] as const;
```
`rowToPost` map thêm `reactions = row.reactions ?? []` và
`comment_count = row.comments?.[0]?.count ?? 0` (dạng `comments(count)`).

## 5. Feed (cảm xúc)

- Query feed + `/api/feed` đổi select → `*, profiles(display_name, avatar_url),
  reactions(type, user_id), comments(count)`.
- **`components/ReactionBar.tsx`** (client): nhận `postId` + `reactions` ban đầu.
  Tự lấy user hiện tại (browser client, như `AuthButton`). Hiện 4 nút emoji + số
  đếm; tô đậm cảm xúc của mình. Bấm:
  - chưa login → mời đăng nhập Google;
  - cùng loại đang chọn → **bỏ** (`delete`);
  - khác → **upsert** (`onConflict: "post_id,user_id"`).
  Optimistic local state.
- `FeedPost` thêm dưới card: `<ReactionBar>` + link **"N bình luận" → `/p/[id]`**.

## 6. Trang chi tiết `/p/[id]`

- `app/p/[id]/page.tsx` (server, **`params` là Promise** theo Next 16 → `await params`):
  - Nạp post (join profiles, reactions, comments count) → 404 nếu không có.
  - Nạp comments: `comments` `select("*, profiles(display_name, avatar_url)")`
    `eq post_id` `order created_at asc`.
  - Render: masthead (← Khám phá + AuthButton) · header tác giả · full
    `ExhibitionCard` · `ReactionBar` · `CommentList` · `CommentForm`.
  - `export const dynamic = "force-dynamic"`.

## 7. Bình luận (UI)

- **`components/CommentForm.tsx`** (client): ô nhập + gửi → `insert comments`
  (cần login; chưa login → mời đăng nhập). Sau khi gửi → `router.refresh()` +
  clear ô. Giới hạn 1–2000 ký tự.
- **`components/CommentList.tsx`** (client hoặc server): danh sách phẳng cũ→mới,
  mỗi item: avatar + tên + thời gian (`formatDate`) + nội dung; nút **xóa** chỉ
  hiện ở comment của mình (so `user_id` với user hiện tại) → `delete` + refresh.

## 8. Phạm vi file

| File | |
|---|---|
| `supabase/migrations/0002_interactions.sql` | **mới** |
| `components/ReactionBar.tsx`, `CommentForm.tsx`, `CommentList.tsx` | **mới** |
| `app/p/[id]/page.tsx` | **mới** (permalink) |
| `lib/types.ts` | + `Comment`, `REACTIONS`, mở rộng `Post` |
| `lib/posts.ts` | `rowToPost` map reactions + comment_count |
| `app/page.tsx`, `app/api/feed/route.ts` | select kèm reactions + comments(count) |
| `components/FeedPost.tsx` | + ReactionBar + link bình luận |

Không đổi: generate API, auth/#1, /create, /gallery, /me.

## 9. Verify

- `tsc` + `build` (env-guarded; chưa cấu hình Supabase → không có nút tương tác).
- **Live (Supabase của bạn):** chạy `0002_interactions.sql`; ở feed thả/đổi/bỏ
  cảm xúc (số đếm đổi); mở `/p/[id]` viết bình luận, thấy hiện ra, xóa được
  comment của mình; người chưa login bị mời đăng nhập khi tương tác.
- Không có Playwright — nhìn mắt qua trình duyệt.

## 10. Ngoài phạm vi (sau)

- Reply lồng nhau, mention, thông báo.
- "Nổi bật"/trending theo lượt cảm xúc (#2 mở rộng).
- Profile công khai + follow (#4). Kiểm duyệt/báo cáo, chống spam.
