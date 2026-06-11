# Design — Public Feed (#2)

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Sub-project:** #2 trong lộ trình mạng xã hội. Phụ thuộc #1 (Nền tảng: posts +
RLS đọc-công-khai + auth). Tiếp theo: #3 cảm xúc/bình luận, #4 profile.

## 1. Mục tiêu

Biến trang chủ thành **feed cộng đồng**: ai cũng xem được các exhibition đã đăng
(của mình + người khác) dạng **dòng thời gian đầy đủ**, mới nhất trước, có "Tải
thêm". Khu **Tạo** dời sang route riêng.

## 2. Quyết định đã chốt

- **Feed = trang chủ `/`**; phần Tạo dời sang **`/create`** + CTA "Tạo triển lãm".
- **Xem feed công khai** (không cần login; RLS `posts` cho đọc).
- **Mỗi bài hiện full** `ExhibitionCard` (timeline) + header tác giả.
- **Mới nhất trước + "Tải thêm"** (keyset theo `created_at`).
- **Tải dữ liệu (Hướng 1):** server-render trang đầu + client "Tải thêm" gọi route handler.

## 3. Điều hướng (IA)

- `app/page.tsx` hiện tại (generator) → **chuyển thành `app/create/page.tsx`**
  (giữ nguyên toàn bộ logic tạo/đăng). Đổi tên default export `Home` → `CreatePage`.
- `app/page.tsx` **mới** = feed (server component).
- Masthead:
  - **Feed (`/`)**: brand · CTA **"Tạo triển lãm" → /create** · "Bộ sưu tập" → /gallery · `AuthButton`.
  - **`/create`**: link **"← Khám phá" → /** · `AuthButton`. (Giữ generator như cũ.)
- Sau khi **Đăng bài** thành công ở `/create`, giữ nguyên hành vi hiện tại (nút
  "Đã đăng ✓"); người dùng tự về `/` để thấy bài trong feed. (Không auto-redirect ở bản này.)

## 4. Feed (dữ liệu)

- Query (server): `posts` **join `profiles`** → `select("*, profiles(display_name, avatar_url)")`,
  `order("created_at", { ascending: false })`, `limit(PAGE = 20)`.
- `rowToPost` đã hỗ trợ `row.profiles` → `author`. Dùng lại.
- **Keyset pagination:** trang sau dùng `created_at` của bài cuối: `.lt("created_at", before)`.
- **Route handler `app/api/feed/route.ts`** (GET): tham số `before?` (ISO), trả
  `{ posts: Post[], nextBefore: string | null }`. `nextBefore` = `created_at` bài
  cuối nếu còn đủ `PAGE` bài, ngược lại `null` (hết). Env chưa cấu hình → `{ posts: [], nextBefore: null }`.

## 5. UI

- **`components/FeedPost.tsx`** (presentational, không `use client` — render được cả
  server lẫn client): header tác giả (avatar tròn + `display_name` + ngày
  `formatDate(created_at)`) + `ExhibitionCard exhibition={postToExhibition(post)}`
  (không `onRegenerate`, không `imageUrl`).
  - *Lưu ý:* dùng `formatDate` (tuyệt đối, locale-free) thay vì "x phút trước" để
    tránh lệch SSR/hydration.
- **`components/FeedLoadMore.tsx`** (`use client`): nhận `initialNextBefore`; state
  danh sách bài đã tải thêm + `before`. Nút **"Tải thêm"** gọi `/api/feed?before=...`,
  nối kết quả (render `FeedPost`), cập nhật `before`; ẩn nút khi `nextBefore === null`.
- **`app/page.tsx` (feed)**: server-render trang đầu (list `FeedPost`) + `FeedLoadMore`.
  - **Empty state**: chưa có bài → mời "Tạo triển lãm đầu tiên" (link `/create`).
  - **Chưa cấu hình Supabase**: hiện thông báo nhẹ "tính năng cộng đồng chưa bật"
    + vẫn cho vào `/create`.

## 6. Phạm vi file

| File | |
|---|---|
| `app/create/page.tsx` | **mới** (chuyển từ `app/page.tsx` hiện tại) |
| `app/page.tsx` | **viết lại** thành feed |
| `app/api/feed/route.ts` | **mới** — pagination |
| `components/FeedPost.tsx`, `FeedLoadMore.tsx` | **mới** |
| `lib/posts.ts` | (đã đủ; dùng `rowToPost`, `postToExhibition`) |

Không đổi: generate API, schema/RLS (đã có), `/me`, `/gallery`, ShareCard…
ExhibitionCard tái dùng nguyên trạng.

## 7. Verify

- `npx tsc --noEmit` = 0 lỗi; `npm run build` pass (không cần Supabase key — feed
  rỗng khi chưa cấu hình).
- **Live (cần Supabase của bạn + vài bài đã đăng):** `/` hiện feed đầy đủ mới→cũ;
  "Tải thêm" nối bài; `/create` tạo + đăng được; bài mới xuất hiện khi reload `/`.
- Không có Playwright — UI nhìn mắt qua trình duyệt.

## 8. Ngoài phạm vi (sau)

- Permalink/trang chi tiết từng bài (`/p/[id]`) — gắn khi làm #3 (cần URL cho
  comment).
- Thả cảm xúc + bình luận (#3); profile công khai + follow (#4).
- "Nổi bật"/trending (cần reaction của #3).
- Header dùng chung (SiteHeader) — refactor gọn các masthead, để sau.
