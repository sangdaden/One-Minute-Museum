# Bảo Tàng 1 Phút — One-Minute Museum

> Biến những vật bình thường quanh bạn thành một triển lãm mini.
> *One-Minute Museum for everyday objects.*

Một web app biến một vật đời thường (dép tổ ong, ghế nhựa đỏ, ly cà phê sữa đá…)
thành một **mini exhibition** đọc trong khoảng một phút — với giọng kể của một
curator bảo tàng hiện đại. Nội dung được tạo bằng AI, format đẹp kiểu nhãn hiện
vật, và dễ chia sẻ lên mạng xã hội.

---

## Demo flow

1. Mở app tại `/`.
2. Nhập một vật bình thường — ví dụ **"dép tổ ong"** — hoặc chạm vào một gợi ý
   trong *Vietnam Everyday Collection*.
3. Chọn một **góc nhìn (mode)**: Vietnamese Culture · Museum · Fun Fact · Design.
4. Bấm **Tạo triển lãm**. Trong lúc chờ, app hiển thị skeleton *"Đang dựng triển lãm…"*.
5. Kết quả hiện ra dưới dạng **nhãn hiện vật**: tiêu đề, hook, 3 điều thú vị,
   góc nhìn, câu hỏi suy ngẫm, hashtags.
6. **Copy** nội dung đã format sẵn cho Facebook/LinkedIn, hoặc **tải ảnh chia sẻ**
   PNG 1080×1080.
7. Mỗi triển lãm tự được lưu vào **Bộ sưu tập** (`/gallery`) trên máy bạn.

---

## Features

- **Generate mini exhibition** — sinh nội dung theo schema cố định bằng OpenAI
  (Structured Outputs), parse + validate an toàn.
- **Multiple modes** — bốn góc nhìn: `Vietnamese Culture`, `Museum`, `Fun Fact`,
  `Design`.
- **Vietnam Everyday Collection** — danh sách vật gợi ý đậm chất Việt, chạm là tạo ngay.
- **Copy social post** — xuất text đã format đẹp (không phải JSON) kèm hashtags `#Tag`.
- **Local gallery** — lưu các triển lãm đã tạo bằng `localStorage` (không trùng theo `id`),
  có nút xóa kèm xác nhận.
- **Share card PNG export** — render nhãn hiện vật 1080×1080 và tải về dạng
  `one-minute-museum-{object}.png` (dùng `html-to-image`, hoàn toàn ở client).

---

## Tech stack

| Lớp | Công nghệ |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Ngôn ngữ | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| AI | **OpenAI** (mặc định `gpt-4o-mini`, JSON Structured Outputs) |
| Lưu trữ | **localStorage** (không cần database) |
| Ảnh chia sẻ | **html-to-image** |
| Typography | Fraunces · Be Vietnam Pro · JetBrains Mono (`next/font`) |

Không có backend riêng, không auth, không database.

---

## Chạy local

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env.local ở thư mục gốc (xem mục bên dưới)
#    OPENAI_API_KEY=sk-...

# 3. Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Các script khác:

```bash
npm run build   # build production
npm run start   # chạy bản đã build
npm run lint    # eslint
```

---

## Environment variables

Tạo file `.env.local`:

```bash
# Bắt buộc để gọi AI thật
OPENAI_API_KEY=sk-your-key-here

# Tùy chọn — đổi model (mặc định: gpt-4o-mini)
# OPENAI_MODEL=gpt-4o-mini
```

| Biến | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|
| `OPENAI_API_KEY` | Có¹ | — | Khóa OpenAI. Không bao giờ lộ ra frontend. |
| `OPENAI_MODEL` | Không | `gpt-4o-mini` | Model hỗ trợ JSON output tốt. |
| `NEXT_PUBLIC_SUPABASE_URL` | Không² | — | URL project Supabase (tính năng cộng đồng). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Không² | — | Anon key Supabase. |

> ¹ **Dev fallback:** Khi `NODE_ENV=development` và **không có** `OPENAI_API_KEY`,
> API `/api/exhibitions/generate` trả về **dữ liệu mẫu (mock)** đúng schema để bạn
> phát triển UI mà không tốn chi phí. Ở production, thiếu key sẽ trả lỗi rõ ràng.
>
> ² **Không có Supabase:** app vẫn chạy bình thường; nút **Đăng nhập / Đăng bài**
> tự ẩn. Có Supabase mới bật được tính năng cộng đồng.
>
> `.env.local` đã nằm trong `.gitignore` — đừng commit khóa.

---

## Cộng đồng (Supabase)

Tính năng đăng nhập + đăng bài lên feed dùng **Supabase** (Postgres + Auth). Để bật:

1. Tạo project tại [supabase.com](https://supabase.com).
2. **SQL Editor** → chạy `supabase/migrations/0001_foundation.sql` (tạo bảng
   `profiles`, `posts` + RLS + trigger).
3. **Authentication → Providers → Google**: bật, điền OAuth client ID/secret
   (tạo ở Google Cloud Console). Redirect URL trong Google trỏ tới
   `https://<project>.supabase.co/auth/v1/callback`.
4. **Authentication → URL Configuration**: thêm `http://localhost:3000/auth/callback`
   (và domain production) vào *Redirect URLs*.
5. Lấy **Project URL** + **anon key** (Settings → API) điền vào `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Tạo exhibition **không cần đăng nhập**; chỉ cần đăng nhập khi **Đăng lên cộng đồng**.
Bài đã đăng xem ở **`/me`**.

---

## Build in public

Dự án này được xây dựng công khai (build in public) như một MVP nhỏ, gọn, dễ kể
chuyện. Ảnh chia sẻ 1080×1080 và giao diện editorial/museum được thiết kế để
**dễ screenshot** cho mỗi cập nhật. Nếu bạn fork hoặc lấy cảm hứng, rất hoan
nghênh — hãy gắn thẻ **#BaoTang1Phut / #OneMinuteMuseum**.

---

## Roadmap

- [ ] **Upload image** — tải ảnh vật thể thật thay vì chỉ nhập tên.
- [ ] **Public gallery** — bộ sưu tập công khai, chia sẻ được giữa người dùng.
- [ ] **Daily object** — mỗi ngày gợi ý một vật mới để tạo.
- [ ] **Curator voice** — chọn giọng kể: serious curator, funny uncle,
  product designer, historian.

---

<p align="center"><sub>Bảo Tàng 1 Phút — One-Minute Museum · © 2026</sub></p>
