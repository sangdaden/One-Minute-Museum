# Design — Vietnamese identity themes

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Context:** Người dùng chọn một "phong cách" bản sắc Việt cho mỗi bài (đã brainstorm
qua visual companion). Theme = nền + trang trí (note/tem/hoa văn) áp lên thẻ hiển
thị + share card. (Sub-project nối tiếp "ảnh thật trên bài".)

## 1. Quyết định đã chốt

- **Mô hình**: người dùng chọn theme/bài; lưu theo bài; áp lên card + share.
- **Áp theme** = **kiểu thẻ riêng** (một bố cục chung, dữ-liệu-hóa). "Mặc định" = bento hiện tại.
- **Bộ v1**: Mặc định · Sơn mài · Men lam · Đông Hồ · Thổ cẩm · Giấy note · Tết.
- **Trang trí** chỉ ở góc/lề, **không đè nội dung** (note kiểu A: nhô góc trên-phải).
- Trang trí v1 = CSS + emoji/unicode (như mockup); SVG art thật để sau.

## 2. Theme registry (`lib/themes.ts`)

```ts
export interface Theme {
  id: string;          // 'macdinh' | 'sonmai' | 'menlam' | 'dongho' | 'thocam' | 'note' | 'tet'
  label: string;
  swatch: string;      // CSS background cho ô chọn (preview nhỏ)
  bg: string;          // nền thẻ
  panel: string | null;// nền panel nội dung (null = chữ đặt thẳng trên bg)
  ink: string;         // màu chữ chính
  inkSoft: string;     // màu chữ phụ
  accent: string;      // nhãn/điểm nhấn
  decoration: "none" | "seal" | "menlam" | "dongho" | "thocam" | "note" | "tet";
}
export const THEMES: Theme[] = [ /* 7 mục, 'macdinh' đầu tiên */ ];
export const DEFAULT_THEME = "macdinh";
export function getTheme(id?: string | null): Theme; // fallback macdinh
```

Màu gợi ý (tinh chỉnh khi code): sơn mài (nền lacquer đậm, chữ kem/vàng, tem sáp đỏ),
men lam (sứ trắng + viền cobalt), Đông Hồ (giấy điệp + gà + thanh màu), thổ cẩm
(viền dệt nhiều màu), giấy note (giấy dó + note vàng nhô góc), Tết (đỏ-vàng + hoa mai).

## 3. Hiển thị

`ExhibitionCard` thành **bộ điều phối**:
- tách phần bento hiện tại thành `BentoCard` (giữ nguyên).
- nếu `exhibition.theme` ∈ themes (≠ `macdinh`) → render **`ThemedCard`**; ngược lại → `BentoCard`.
- Mọi call site (feed, /p/[id], /create) **không đổi** (vẫn `<ExhibitionCard exhibition imageUrl onRegenerate>`).

**`components/ThemedCard.tsx`** — MỘT bố cục, tham số hóa bởi `Theme`:
- nền = `theme.bg`; nội dung trên `theme.panel` (nếu có) hoặc thẳng trên nền;
  màu chữ theo `theme.ink/inkSoft/accent`.
- Bố cục dọc gọn: kicker + No./ngày · tiêu đề · (ảnh nếu có) · hook · các mục
  (Đây là gì / Câu chuyện / Ba điều thú vị đánh số / Góc nhìn / Vì sao / Câu hỏi)
  · share_quote + hashtags · footer (Copy + Tạo lại — như bento).
- **Trang trí**: 1 phần tử `absolute` ở góc an toàn theo `theme.decoration` (switch),
  không phủ vùng chữ.

## 4. Chọn theme (`components/ThemePicker.tsx`)

- Hàng swatch (giống `VoiceSelector`): mỗi theme một ô màu nhỏ + nhãn; chọn = tô viền accent.
- Trên `/create`: thêm mục "Chọn phong cách" dưới giọng kể; đổi → `setExhibition({...ex, theme})`
  → preview cập nhật. (Trước khi có exhibition, lưu theme ở state riêng để áp khi tạo xong;
  hoặc đặt theme mặc định và cho đổi sau khi có kết quả — chọn cách **đổi sau khi có kết quả** cho đơn giản.)

## 5. Lưu theme

- Migration `0004`: `alter table public.posts add column if not exists theme text;`
- `Exhibition.theme?: string`; `ExhibitionContent` Omit thêm `theme` (không vào `content` jsonb).
- `exhibitionToPostInsert` thêm `theme: ex.theme ?? null`; `rowToPost` map `theme`;
  `postToExhibition` set `ex.theme = post.theme`.
- `PostRow` + `Post` thêm `theme?: string | null`.
- Gallery cục bộ (localStorage) tự mang theme (nằm trong Exhibition).

## 6. Share card

`ShareCard` đọc `exhibition.theme`:
- `macdinh` → artwork hiện tại.
- theme khác → áp `theme.bg` (nền), `theme.ink/accent` (màu chữ), và **một trang trí
  góc** tương ứng vào artwork 1080 (giữ bố cục hiện có: brand · tên vật · quote · 3 facts · hashtags).
- `toPng backgroundColor` theo `theme.bg` (màu nền chủ đạo).

## 7. Phạm vi file

| File | |
|---|---|
| `lib/themes.ts` | **mới** — registry + getTheme |
| `components/ThemedCard.tsx` | **mới** |
| `components/ThemePicker.tsx` | **mới** |
| `supabase/migrations/0004_post_theme.sql` | **mới** |
| `components/ExhibitionCard.tsx` | tách BentoCard + điều phối theo theme |
| `components/ShareCard.tsx` | áp theme |
| `lib/types.ts` | `Exhibition.theme`, `Post.theme`, Omit content |
| `lib/posts.ts` | map theme (insert/row/postToExhibition) |
| `components/PublishButton.tsx` | insert `theme` |
| `app/create/page.tsx` | ThemePicker + đổi theme exhibition |

Không đụng generate API.

## 8. Verify

- `tsc` + `build`.
- **Live (chạy `0004`):** `/create` tạo → chọn phong cách → preview đổi nền/trang trí
  (chữ vẫn đọc tốt, trang trí không đè chữ) → Đăng → feed/`/p/[id]` hiện thẻ themed;
  tải share card thấy nền theme. Bài "Mặc định" giữ bento như cũ.
- Không có Playwright — nhìn mắt qua trình duyệt.

## 9. Ngoài phạm vi (sau)

- SVG/PNG art thật cho trang trí (gà Đông Hồ, hoa văn men lam…) thay emoji.
- Theme cho GalleryItem (lưới profile/gallery) — hiện chỉ themed ở thẻ đầy đủ + share.
- Theo mùa/tự gợi ý theme; theme do người dùng tự tạo.
