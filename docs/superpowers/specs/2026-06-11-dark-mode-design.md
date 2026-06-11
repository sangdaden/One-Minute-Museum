# Design — Dark mode (light/dark toggle)

**Date:** 2026-06-11
**Status:** Approved (pending spec review)
**Context:** Thêm nút đổi sáng/tối ở góc phải. (Sub-project song hành: UI i18n — làm sau.)

## 1. Quyết định đã chốt

- Palette tối **nâu ấm** (hợp bản sắc), **giữ** accent đỏ sơn mài + gold (sáng hơn chút).
- Toggle nằm **trong masthead** (không phải nút nổi cố định).
- Lưu lựa chọn (localStorage); lần đầu theo `prefers-color-scheme`; chống nhấp nháy.

## 2. Bảng màu (`app/globals.css`)

Định nghĩa palette tối ghi đè token neutral dưới `[data-theme="dark"]` (light = `:root` hiện tại):

| token | dark |
|---|---|
| `--paper` | `#1a1411` |
| `--paper-card` | `#221b16` |
| `--paper-sunk` | `#14100c` |
| `--ink` | `#f1e8dd` |
| `--ink-soft` | `#b9aa9b` |
| `--ink-faint` | `#8a7c6e` |
| `--accent` | `#c0402f` (sáng hơn cho nền tối) |
| `--accent-deep` | `#7a2418` |
| `--gold` | `#c6a557` |
| `--border` | `#3a2e26` |
| `--border-strong` | `#4c3c31` |

Mọi component dùng token → tự đổi. `.grain` ở dark giảm `opacity` + đổi blend (vd `overlay`) cho hợp nền tối.

## 3. Toggle (`components/ThemeToggle.tsx`)

- Client. Đọc `data-theme` hiện tại từ `<html>` (mount). Nút icon ☀️/🌙 (lucide `Sun`/`Moon`).
- Bấm → đặt `document.documentElement.setAttribute("data-theme", next)` + lưu `localStorage["omm-theme"]`.
- Aria-label "Đổi sáng/tối".

## 4. Chống nhấp nháy (`app/layout.tsx`)

- Script inline đặt sớm (đầu `<body>`): đọc `localStorage["omm-theme"]`, nếu trống → `matchMedia('(prefers-color-scheme: dark)')`; set `data-theme` lên `<html>` trước khi render.
- `<html suppressHydrationWarning>` đã có (vì script đổi attribute khác SSR).

## 5. Đặt toggle vào masthead

Thêm `ThemeToggle` vào cụm bên phải masthead 6 trang:
`app/page.tsx` (feed), `app/create/page.tsx`, `app/gallery/page.tsx`, `app/me/page.tsx`,
`app/p/[id]/page.tsx`, `app/u/[id]/page.tsx`.

## 6. Phạm vi / không đụng

- **Mới**: `components/ThemeToggle.tsx`. **Sửa**: `globals.css`, `layout.tsx`, 6 masthead.
- **Giữ nguyên** (màu cố định, không theo sáng/tối): themed cards (Sơn mài/Men lam/…),
  ShareCard artwork. (Chúng có palette riêng theo từng theme.)
- Không đụng API/DB.

## 7. Verify

- `tsc` + `build`. Bật/tắt → toàn app đổi sáng↔tối; reload nhớ lựa chọn; mở lần đầu
  theo hệ thống; không nhấp nháy. Themed cards/share giữ màu.

## 8. Ngoài phạm vi

- UI i18n (dịch giao diện vi↔en) — sub-project kế tiếp.
- Dark variant cho từng themed card; theme tự đổi theo giờ.
