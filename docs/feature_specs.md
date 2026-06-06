# Feature Specs — Bảo Tàng 1 Phút

## F01 — Object Input

### Mục tiêu
Cho phép người dùng nhập một vật thể bất kỳ.

### UI
- Text input lớn ở hero section.
- Placeholder: “Nhập một vật bình thường... ví dụ: dép tổ ong”.
- Button: “Tạo triển lãm”.

### Validation
- Required.
- Tối đa 80 ký tự.
- Không chấp nhận input chỉ chứa khoảng trắng.
- Nếu quá dài, hiển thị: “Tên vật nên ngắn gọn hơn.”

### Edge Cases
- Input rỗng.
- Input quá dài.
- Input là câu hỏi thay vì tên vật.
- Input nhạy cảm hoặc không phù hợp.

### Suggested Handling
Nếu input là câu hỏi, vẫn cố gắng trích xuất object chính nếu có thể.

---

## F02 — Mode Selector

### Mục tiêu
Cho phép người dùng chọn góc nhìn tạo nội dung.

### MVP Modes

#### Vietnamese Culture
Tập trung vào đời sống Việt Nam, ký ức tập thể, văn hóa sử dụng.

#### Museum
Trang trọng, giàu hình ảnh, như bảng mô tả trong bảo tàng.

#### Fun Fact
Ngắn, vui, có chút hài hước, dễ share.

#### Design
Phân tích vật như một sản phẩm: vật liệu, hình dáng, use case, pain point.

### UI
- Button group hoặc card selector.
- Mỗi mode có mô tả ngắn.
- Mode active phải nổi bật.

---

## F03 — Generate Exhibition

### Mục tiêu
Tạo nội dung mini exhibition bằng AI.

### Request
```json
{
  "object_name": "dép tổ ong",
  "mode": "Vietnamese Culture",
  "language": "vi"
}
```

### Response
```json
{
  "title": "Bảo tàng một phút: Dép tổ ong",
  "hook": "...",
  "what_it_is": "...",
  "origin_or_context": "...",
  "three_fun_facts": ["...", "...", "..."],
  "design_or_cultural_insight": "...",
  "why_it_matters": "...",
  "reflection_question": "...",
  "share_quote": "..."
}
```

### Loading State
- Button disabled.
- Hiển thị text: “Đang dựng triển lãm...”
- Có skeleton card.

### Error State
- Message: “Không tạo được triển lãm lúc này. Thử lại nhé.”
- Có nút retry.

### Quality Rules
- Không quá dài.
- Không bịa số liệu/ngày tháng.
- Nếu không chắc lịch sử, dùng ngôn ngữ mềm.
- Ưu tiên insight và sự tò mò.

---

## F04 — Result Display

### Mục tiêu
Hiển thị kết quả đẹp, có cảm giác museum.

### Layout
- Badge: ONE-MINUTE MUSEUM
- Title
- Hook/quote block
- Section: Đây là gì?
- Section: Câu chuyện phía sau
- Section: 3 điều thú vị
- Section: Góc nhìn thiết kế/văn hóa
- Section: Vì sao đáng chú ý?
- Section: Câu hỏi suy ngẫm

### Visual Direction
- Nền sáng hoặc off-white.
- Card có border nhẹ.
- Typography rõ.
- Tạo cảm giác editorial/museum label.

---

## F05 — Copy Content

### Mục tiêu
Cho phép copy nội dung để đăng social.

### Copy Format
```text
Bảo tàng một phút: {object}

{hook}

1. {fact_1}
2. {fact_2}
3. {fact_3}

{why_it_matters}

Câu hỏi: {reflection_question}

#BaoTang1Phut #OneMinuteMuseum
```

### Acceptance Criteria
- Copy đúng nội dung.
- Toast “Đã copy”.
- Không copy JSON raw.

---

## F06 — Suggested Objects

### Mục tiêu
Giúp người dùng không bị bí ý tưởng.

### Suggested List
Vietnamese Everyday Collection:
- Dép tổ ong
- Ghế nhựa đỏ
- Ly cà phê sữa đá
- Remote TV bọc nilon
- Áo mưa
- Xe máy
- Mũ bảo hiểm
- Phích nước
- Nồi cơm điện
- Quạt máy
- Túi nilon đi chợ
- Ổ khóa cửa
- Bàn chải đánh răng
- Bút bi Thiên Long
- Dây thun
- Lịch bloc

### Behavior
- Click item fill input.
- Có thể auto-generate nếu người dùng bật option “generate on click” sau này.

---

## F07 — Share Card

### Mục tiêu
Tạo ảnh để chia sẻ.

### Card Content
- Brand: BẢO TÀNG 1 PHÚT
- Object name
- Share quote
- 3 facts ngắn
- Footer hashtag

### Size
- 1080x1080 cho Instagram/Facebook.
- Optional 1200x630 cho link preview.

### Implementation Options
- html-to-image ở frontend.
- Puppeteer screenshot ở backend.
- Canvas API.

---

## F08 — Gallery

### Mục tiêu
Lưu lại các triển lãm đã tạo.

### MVP Storage
- localStorage trước.
- Supabase sau.

### Gallery Item
- Title
- Object name
- Mode
- Created at
- Hook preview

### Detail
- Hiển thị lại full exhibition.
