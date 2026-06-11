# Design — Public Profile (#4)

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Sub-project:** #4 (cuối lộ trình cốt lõi). Phụ thuộc #1 (profiles/posts), #2 (feed),
#3 (permalink). Follow/notifications/moderation = #5 (sau).

## 1. Mục tiêu

Mỗi người dùng có một **trang cá nhân công khai** — "bảo tàng riêng": thông tin cơ
bản + lưới các bài đã đăng. Tên/avatar tác giả khắp app bấm được để vào profile.

## 2. Quyết định đã chốt

- **URL**: `/u/[id]` dùng `id` (uuid) của profile. Không thêm username (để sau).
- **Read-only**: tên/avatar lấy từ Google (qua `profiles`); chưa có form sửa.
- **Lưới bài**: tái dùng `GalleryItem`, mỗi item **bọc Link → `/p/[id]`**.
- **Không đổi schema** — `profiles`/`posts` + RLS đọc-công-khai (từ #1) là đủ.

## 3. Trang `/u/[id]`

`app/u/[id]/page.tsx` (server component, `params` là Promise → `await params`,
`export const dynamic = "force-dynamic"`):

- Nếu Supabase chưa cấu hình → `notFound()`.
- Query `profiles` theo `id` (`maybeSingle`) → `notFound()` nếu null.
- Query `posts`: `select("*", { count: "exact" }).eq("user_id", id)
  .order("created_at", { ascending: false }).limit(60)`; map `rowToPost`.
- **Header**: avatar lớn (80px) + `display_name` + dòng phụ "Tham gia
  {formatDate(profiles.created_at)} · {count} hiện vật".
- **Lưới**: `grid sm:2 lg:3`, mỗi bài `<Link href={/p/[id]}>` bọc `GalleryItem`
  (dùng `postToExhibition`). Empty state nếu chưa có bài.
- Masthead: ← Khám phá + `AuthButton`.

(Phân trang trên profile chưa cần — limit 60, "tải thêm" để sau nếu cần.)

## 4. Tác giả bấm được (wiring)

Nối tên/avatar tác giả tới `/u/[user_id]`:

| File | Đổi |
|---|---|
| `components/FeedPost.tsx` | header tác giả → `Link href={/u/[post.user_id]}` |
| `app/p/[id]/page.tsx` | header tác giả → `Link` |
| `components/CommentList.tsx` | tên/avatar mỗi comment → `Link href={/u/[c.user_id]}` |
| `app/me/page.tsx` | bài của mình → `Link href={/p/[id]}` (bonus, cho nhất quán) |

## 5. Phạm vi file

| File | |
|---|---|
| `app/u/[id]/page.tsx` | **mới** |
| `components/FeedPost.tsx`, `app/p/[id]/page.tsx`, `components/CommentList.tsx`, `app/me/page.tsx` | sửa nhẹ (link) |

Không migration, không đụng generate API.

## 6. Verify

- `tsc` + `build` (env-guarded).
- **Live (Supabase của bạn):** `/u/<id của bạn>` hiện header + lưới bài; bấm tên
  tác giả ở feed / bình luận → đúng profile; bài trên profile → `/p/[id]`; id lạ → 404.
- Không có Playwright — nhìn mắt qua trình duyệt.

## 7. Ngoài phạm vi (sau / #5)

- Sửa profile (tên/avatar/bio), username/handle, ảnh bìa.
- Follow + đếm follower/following + feed "đang theo dõi".
- Thông báo, kiểm duyệt/báo cáo, chống spam.
