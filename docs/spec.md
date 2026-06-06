# SPEC — Bảo Tàng 1 Phút

## 1. Tên sản phẩm

**Bảo Tàng 1 Phút**  
Tên tiếng Anh: **One-Minute Museum**

## 2. Tagline

> Biến những vật bình thường quanh bạn thành một triển lãm mini.

## 3. Product Vision

Bảo Tàng 1 Phút giúp người dùng nhìn lại những vật quen thuộc hằng ngày bằng một góc nhìn mới: lịch sử, thiết kế, văn hóa, công nghệ và đời sống.

Thay vì học kiến thức theo cách khô khan, người dùng bắt đầu từ một vật họ nhìn thấy ngay trước mắt.

## 4. Problem

Người dùng muốn học thêm kiến thức ngắn gọn, thú vị nhưng thường gặp các vấn đề:

- Nội dung giáo dục dài, khô và thiếu cảm xúc.
- Những thứ quen thuộc quanh mình bị xem là tầm thường.
- AI content thường chung chung, thiếu format để chia sẻ.
- Người dùng muốn có nội dung vừa học được, vừa vui, vừa có thể đăng lên mạng xã hội.

## 5. Product Insight

> Người dùng không thiếu kiến thức. Họ thiếu một lý do thú vị để tò mò.

Những vật bình thường nhất thường chứa rất nhiều câu chuyện về thiết kế, văn hóa và hành vi con người.

## 6. Target Users

### 6.1. Người dùng phổ thông thích nội dung ngắn
- Muốn đọc nội dung thú vị trong 1 phút.
- Thích fun facts, trivia, câu chuyện đời sống.

### 6.2. Người làm content
- Cần ý tưởng bài đăng hằng ngày.
- Muốn tạo nội dung về văn hóa, đời sống, thiết kế.

### 6.3. Designer / Product builder
- Muốn nhìn vật bình thường dưới góc nhìn thiết kế.
- Quan tâm đến vì sao sản phẩm có hình dạng, vật liệu và cách dùng như hiện tại.

### 6.4. Giáo viên / phụ huynh
- Muốn giải thích sự vật đơn giản cho học sinh/trẻ em.
- Có thể dùng Kid Mode trong các phiên bản sau.

## 7. MVP Positioning

MVP tập trung vào:

> Vietnamese Everyday Museum — Bảo tàng những vật bình thường rất Việt Nam.

Ví dụ:
- Dép tổ ong
- Ghế nhựa đỏ
- Ly cà phê sữa đá
- Xe máy
- Áo mưa
- Remote TV bọc nilon
- Phích nước
- Nồi cơm điện
- Mũ bảo hiểm
- Quạt máy
- Túi nilon đi chợ

## 8. Core User Flow

1. Người dùng vào trang chủ.
2. Người dùng nhập tên một vật.
3. Người dùng chọn mode:
   - Museum
   - Fun Fact
   - Design
   - Vietnamese Culture
4. Người dùng bấm **Tạo triển lãm**.
5. Hệ thống gọi AI để tạo nội dung theo JSON.
6. UI render nội dung như một bảng mô tả trong bảo tàng.
7. Người dùng có thể:
   - Copy nội dung
   - Regenerate
   - Tạo share card
   - Lưu vào gallery

## 9. MVP Success Criteria

MVP được xem là đạt nếu:

- Người dùng có thể tạo một mini exhibition trong dưới 20 giây.
- Output đọc được trong khoảng 1 phút.
- Nội dung có cấu trúc rõ ràng và không quá dài.
- Có ít nhất 20 vật mẫu trong Vietnamese Everyday Collection.
- Có thể tạo/copy một phiên bản nội dung để đăng social.
- UI đủ đẹp để screenshot chia sẻ.

## 10. Tone of Product

Sản phẩm nên có cảm giác:

- Tò mò
- Ấm áp
- Thông minh nhưng không học thuật quá mức
- Có chút hài hước nhẹ
- Đẹp như một bảo tàng hiện đại nhưng gần gũi đời sống Việt Nam

## 11. Key Differentiators

### 11.1. Không phải app hỏi đáp AI thông thường
App không trả lời kiểu encyclopedic. Nó biến một vật thành một trải nghiệm curated.

### 11.2. Tập trung vào vật bình thường
Giá trị nằm ở việc làm cho thứ quen thuộc trở nên đáng chú ý.

### 11.3. Output có format shareable
Mỗi triển lãm có thể trở thành một bài post hoặc card chia sẻ.

### 11.4. Có bản sắc Việt Nam
Vietnamese Everyday Collection tạo sự khác biệt so với các app AI generic.

## 12. Non-Goals trong MVP

MVP chưa cần:
- Auth bắt buộc.
- Community voting.
- Upload ảnh.
- Public profile.
- Payment.
- Mobile app native.
- Fact-check pipeline phức tạp.
- Multi-language đầy đủ.

## 13. Risks

### 13.1. AI bịa thông tin lịch sử
Giảm rủi ro bằng prompt:
- Không bịa năm tháng.
- Không khẳng định nguồn gốc nếu không chắc.
- Dùng ngôn ngữ mềm: “có thể”, “được xem là”, “thường gắn với”.

### 13.2. Output chung chung
Giảm rủi ro bằng framework:
- Vật này giải quyết pain point gì?
- Vì sao nó có thiết kế như vậy?
- Nó thay đổi hành vi con người thế nào?
- Nó có ý nghĩa văn hóa gì?
- Người thường ít để ý điều gì?

### 13.3. UI không đủ đẹp
Sản phẩm phụ thuộc nhiều vào cảm giác visual. Cần ưu tiên result card đẹp ngay từ MVP.

## 14. Suggested Tech Stack

### Option nhanh
- Streamlit
- OpenAI/Gemini
- SQLite
- PIL/HTML screenshot cho share card

### Option public nghiêm túc
- Next.js
- Supabase
- OpenAI/Gemini
- API Routes hoặc FastAPI
- html-to-image cho share card

Khuyến nghị:

> Next.js + Supabase + OpenAI/Gemini
