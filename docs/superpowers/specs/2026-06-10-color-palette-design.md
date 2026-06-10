# Design — Bảng màu "Sơn mài × nền hồng phấn"

**Date:** 2026-06-10
**Status:** Approved (pending spec review)
**Topic:** Đổi bảng màu chủ đạo cho hiện đại + bản sắc Việt Nam.

## 1. Quyết định (đã validate qua visual companion)

- **Hệ accent giữ nguyên:** đỏ sơn mài (`#9E3322`), đỏ đậm (`#6F2417`), đồng/brass
  (`#B0894A`), đen mực. Đây là phần "bản sắc Việt".
- **Đổi nền cho hiện đại & tươi:** nền **hồng phấn rất nhạt** (ăn tông với đỏ sơn
  mài), **thẻ trắng** có bóng nhẹ → cảm giác app đương đại, làm các ô bento nhiều
  màu nổi bật.
- **Light theme duy nhất.** Dark mode (đen sơn mài) để **future**, không làm bây giờ.

## 2. Token mapping (`app/globals.css` `:root`)

| Token | Cũ | Mới |
|---|---|---|
| `--paper` (nền trang) | `#f1eadb` | **`#FCF5F2`** |
| `--paper-card` (thẻ) | `#fbf7ee` | **`#FFFFFF`** |
| `--paper-sunk` | `#ece3d1` | **`#F6EDE9`** |
| `--ink` | `#1b1611` | **`#211712`** |
| `--ink-soft` | `#6a6154` | **`#6B5A54`** |
| `--ink-faint` | `#9b9279` | **`#9C8B85`** |
| `--accent` | `#9e3322` | `#9E3322` (giữ) |
| `--accent-deep` | `#6f2417` | `#6F2417` (giữ) |
| `--gold` | `#b0894a` | `#B0894A` (giữ) |
| `--border` | `#e1d6c1` | **`#F0E2DD`** |
| `--border-strong` | `#cabfa4` | **`#E3D0C9`** |

Vì mọi component dùng token (`bg-paper`, `bg-paper-card`, `text-ink`, `border-border`…),
**đổi `:root` là cả app reskin** — không cần sửa từng component.

Grain overlay (`.grain`, multiply) và shimmer (dùng `--paper-sunk`) vẫn hoạt động;
giữ nguyên.

## 3. ShareCard (hex hardcoded)

`components/ShareCard.tsx` dùng hex cố định (cần cho html-to-image). Đổi để khớp:

| Vai trò | Cũ | Mới |
|---|---|---|
| Nền artwork + `toPng` backgroundColor | `#f4eee1` | `#FCF5F2` |
| Viền khung trong | `#cabfa4` | `#E3D0C9` |
| Mực (tên/chữ chính) | `#1b1611` | `#211712` |
| Quote | `#322a22` | `#3A2A24` |
| Body fact | `#3a322a` | `#4A3A34` |
| Faint (label phụ) | `#6a6154` / `#9b9279` | `#6B5A54` / `#9C8B85` |
| accent `#9e3322`, gold `#b0894a` | — | giữ |

## 4. Bóng đổ thẻ trắng (polish nhỏ)

Để khớp preview đã duyệt: thêm **bóng mềm** cho các ô **nền trắng** (`paper-card`)
trong `ExhibitionCard` (ô Title, Footer, ô Ảnh) — `shadow-[0_8px_24px_-18px_rgba(120,40,30,0.45)]`.
Các ô màu (accent/ink/brass/sunk/tint) để phẳng. Tạo cảm giác thẻ "nổi" hiện đại.

## 5. Phạm vi

| File | Thay đổi |
|---|---|
| `app/globals.css` | đổi 8 giá trị token trong `:root` |
| `components/ShareCard.tsx` | đổi ~7 hex hardcoded |
| `components/ExhibitionCard.tsx` | thêm shadow cho ô trắng (title/footer/ảnh) |

**Không** đổi logic/API, không đổi accent/gold, không thêm dependency, không dark mode.

## 6. Verify

- `npx tsc --noEmit` = 0 lỗi; `npm run build` pass.
- `npm run dev`: xem trang chủ + một exhibition (text & ảnh) — nền hồng phấn, thẻ
  trắng nổi, đỏ/đồng/đen ăn khớp; share card PNG nền mới.
- Lưu ý: nhìn mắt cần trình duyệt (không có Playwright).
