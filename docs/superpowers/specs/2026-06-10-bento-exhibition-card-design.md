# Design — Bento ExhibitionCard

**Date:** 2026-06-10
**Status:** Approved (pending spec review)
**Topic:** (A) Bố cục & trang trí nội dung hiện đại — redesign ExhibitionCard.

## 1. Mục tiêu

Chuyển cách trình bày nội dung exhibition từ kiểu **"nhãn bảo tàng"** (khung lồng
catalogue, gạch hairline, quote serif căn giữa) sang bố cục **Bento** hiện đại:
mỗi phần nội dung là một **ô bo góc** trong lưới mô-đun, kích thước khác nhau tạo
nhịp, **nhiều khối màu** trong bảng màu ấm sẵn có. Mục tiêu: trẻ trung, năng động,
dễ screenshot — mà vẫn đọc tốt.

Đã validate qua visual companion: cách chia ô + mức "nhiều khối màu" được chốt.

## 2. Phạm vi

### Trong phạm vi
- Viết lại phần render của `components/ExhibitionCard.tsx` theo lưới Bento.
- Cập nhật `components/LoadingExhibition.tsx` thành skeleton dạng Bento cho khớp
  trạng thái loading ↔ kết quả.

### Ngoài phạm vi
- **Không đổi** props, business logic, hay API. `ExhibitionCard` vẫn nhận
  `{ exhibition, onRegenerate? }`.
- **Không đụng** `ShareCard` (ảnh 1080 giữ nguyên — bento hóa để sau),
  `GalleryItem`, trang home/gallery.
- Không thêm dependency. Dùng token màu sẵn có.

## 3. Bản đồ ô (grid 6 cột)

Lưới `6 cột`, gap ~10px, mỗi ô `rounded-2xl` (~14px), mỗi ô có `reveal` so le.

| Ô | Span | Nền | Chữ |
|---|---|---|---|
| **Title** (kicker + No./ngày · tiêu đề · `mode · lang · Kể bởi {voice}`) | 6 | giấy (`paper-card`) | mực |
| **Hook** (label "Mở đầu" + hook) | 6 | **accent** đặc | kem (`paper-card`) |
| **Đây là gì?** (`what_it_is`) | 3 | **ink** đặc | kem, label đồng |
| **Câu chuyện phía sau** (`origin_or_context`) | 3 | **gold/brass** đặc | kem |
| **Fun fact 01/02/03** (`three_fun_facts`) | 2 mỗi ô | **gold tint** | mực, số đồng lớn |
| **Góc nhìn thiết kế / văn hóa** (`design_or_cultural_insight`) | 4 | **paper-sunk** | mực |
| **Vì sao đáng chú ý?** (`why_it_matters`) | 2 | **accent-deep** đặc | kem |
| **Câu hỏi suy ngẫm** (`reflection_question`) | 6 | accent tint nhạt + **viền đứt đồng** | mực, căn giữa |
| **Footer** (`share_quote` nhỏ + hashtags + actions) | 6 | giấy | mực |

- **Footer** chứa: `share_quote` (dòng nhỏ, căn giữa), hàng hashtags, và action
  **Copy** (CopyButton) + **Tạo lại** (nếu có `onRegenerate`).
- Label mỗi ô: mono uppercase tracked (class `eyebrow` sẵn có), màu theo nền
  (accent/gold trên nền sáng; tone sáng trên nền tối).

## 4. Màu (token sẵn có)

Dùng token trong `globals.css`: `paper-card`, `ink`, `accent`, `accent-deep`,
`gold`, `paper-sunk`, `border`, `border-strong`. Các tint dùng utility opacity
của Tailwind (vd `bg-gold/15`, `bg-accent/[0.06]`). Chữ trên nền tối dùng
`text-paper-card`; trên nền brass/gold đặc dùng tone kem sáng.

Không cần thêm token mới. Nếu cần độ tương phản tốt hơn cho chữ trên nền `gold`
đặc, dùng `#fffdf8`/`text-paper-card` (chấp nhận, đã xem ở mock).

## 5. Trang trí — bỏ & thêm

- **Bỏ:** khung lồng `inset-[7px]`, các `.rule` hairline ngăn section, blockquote
  hook với dấu ngoặc serif căn giữa, các đoạn `font-light` serif italic.
- **Thêm:** ô bo góc đổ màu, nhịp span 6/3/2/4 tạo bố cục mô-đun, số fact lớn,
  reveal so le theo thứ tự ô.

## 6. Responsive

- **Desktop (≥640px):** lưới 6 cột như bảng trên.
- **Mobile (<640px):** gập gọn để dễ đọc:
  - Title / Hook / Insight / Reflection / Footer → full width.
  - "Đây là gì?" + "Câu chuyện" → mỗi ô full width (xếp dọc).
  - 3 fun facts → xếp **dọc** (mỗi ô full width) hoặc lưới 1 cột.
  - "Vì sao" → full width.

  Kỹ thuật: container `grid grid-cols-2 sm:grid-cols-6` (hoặc 1 cột ở mobile),
  mỗi ô đặt `col-span-*` kèm biến thể responsive.

## 7. Cấu trúc code

- Trong `ExhibitionCard.tsx`, thêm một helper nội bộ `Tile` (hoặc tập class
  dùng chung) nhận `variant` (paper | ink | brass | accent | accentDeep |
  goldTint | sunk | prompt), `label`, `span`, children — để các ô nhất quán và
  file dễ đọc. Thay `Section` cũ bằng `Tile`.
- Giữ import `CopyButton`, `formatExhibitionForSocial`, `formatDate`,
  `accession`. Byline `voice` vẫn ẩn khi thiếu (`ex.voice && …`).

## 8. Verify

- `npx tsc --noEmit` = 0 lỗi.
- `npm run build` pass.
- `npm run dev` → generate thật một vật, xem Bento render đúng; kiểm tra mobile
  (thu nhỏ cửa sổ) các ô gập gọn, đọc tốt.
- Back-compat: exhibition không có `voice` vẫn render (ẩn byline).
- Lưu ý: không có Playwright nên không chụp ảnh tự động — verify qua tsc/build +
  xem trực tiếp trên trình duyệt.
