# Design — Edit content before publishing

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Context:** Trên `/create`, nội dung do AI sinh hiện được đăng nguyên trạng. Thêm
bước cho người dùng **sửa nội dung trước khi đăng** (và trước khi tải share card).

## 1. Quyết định đã chốt

- **Sửa tất cả trường nội dung text** (không sửa object_name/mode/voice — đó là
  tham số tạo).
- **Chế độ "Sửa"**: card → form đủ trường; **Lưu** áp lại, **Hủy** bỏ.
- hashtags sửa dạng **chuỗi phân tách bằng dấu phẩy**.
- Khi lưu, **cập nhật luôn bản trong Gallery (localStorage)** theo `id`.
- Không đụng API generate, không schema/DB. Publish + ShareCard dùng nội dung đã sửa.

## 2. Luồng trên `/create`

- Thêm state `editing: boolean`.
- Vùng kết quả:
  - `editing === false`: `ExhibitionCard` (xem trước) + hàng nút **Sửa nội dung**
    · `PublishButton` + `ShareCard` (như hiện tại, thêm nút Sửa).
  - `editing === true`: thay bằng `EditExhibitionForm`.
- `onSave(updated)`: `setExhibition(updated)` → `updateExhibition(updated)`
  (localStorage) → `setEditing(false)`. `onCancel`: `setEditing(false)`.
- `PublishButton` và `ShareCard` luôn nhận `exhibition` hiện tại → tự dùng bản đã sửa.

## 3. `components/EditExhibitionForm.tsx` (mới, client)

Props: `{ exhibition: Exhibition; onSave: (e: Exhibition) => void; onCancel: () => void }`.

- State khởi tạo từ `exhibition`. Trường:
  - Tiêu đề (`input`), Hook (`textarea`), Đây là gì? · Câu chuyện · Góc nhìn · Vì sao
    · Câu hỏi (`textarea`), share_quote (`input`).
  - **3 fun fact**: 3 `textarea` (pad nếu thiếu, cắt nếu thừa khi lưu → đúng 3).
  - **hashtags**: 1 `input`, giá trị ban đầu = `hashtags.join(", ")`; khi lưu →
    `split(",")`, mỗi tag `replace(/^#+/,"").trim()`, lọc rỗng.
- Nút **Lưu** / **Hủy**. Validate nhẹ: `title` và `hook` không để trống (nếu trống
  → disable Lưu).
- `onSave` dựng `updated = { ...exhibition, title, hook, what_it_is,
  origin_or_context, three_fun_facts, design_or_cultural_insight, why_it_matters,
  reflection_question, share_quote, hashtags }` (giữ `id/object_name/mode/voice/
  language/created_at`).
- Form theo phong cách input hiện có (border, focus accent), nhãn `eyebrow`.

## 4. `lib/gallery.ts` — `updateExhibition`

```ts
export function updateExhibition(ex: Exhibition): Exhibition[] {
  if (!isBrowser()) return [];
  const all = getExhibitions().map((e) => (e.id === ex.id ? ex : e));
  // nếu chưa có (vd chưa lưu) thì thêm vào đầu
  const next = all.some((e) => e.id === ex.id) ? all : [ex, ...all];
  try { window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(next)); } catch {}
  return next;
}
```

## 5. Phạm vi file

| File | |
|---|---|
| `components/EditExhibitionForm.tsx` | **mới** |
| `app/create/page.tsx` | state `editing` + nút "Sửa nội dung" + render form/card |
| `lib/gallery.ts` | + `updateExhibition` |

Không đụng: API generate, Supabase/feed/posts, ExhibitionCard/ShareCard (chỉ nhận
exhibition đã sửa).

## 6. Verify

- `tsc` + `build`.
- Live: `/create` tạo → **Sửa nội dung** → đổi tiêu đề/hook/fact/hashtags → **Lưu**
  → xem trước cập nhật → **Đăng** → feed/`/p/[id]` hiển thị nội dung đã sửa;
  `/gallery` cũng thấy bản đã sửa.

## 7. Ngoài phạm vi

- Sửa bài **đã đăng** (cần update `posts` + UI ở /p/[id] hoặc /me) — để sau.
- Sửa object_name/mode/voice; tạo lại từng phần bằng AI (regenerate per-field).
