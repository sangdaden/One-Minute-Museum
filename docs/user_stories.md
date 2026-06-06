# User Stories — Bảo Tàng 1 Phút

## Sprint 1 — MVP Generate Flow

### US-001 — Nhập vật thể
**Với vai trò** người dùng,  
**Tôi muốn** nhập tên một vật bình thường,  
**Để** tạo một mini exhibition về vật đó.

Priority: P0  
Sprint: 1

Acceptance Criteria:
- Input không được rỗng.
- Có placeholder gợi ý.
- Có validate cơ bản.
- Người dùng có thể submit bằng button hoặc Enter.

---

### US-002 — Chọn góc nhìn
**Với vai trò** người dùng,  
**Tôi muốn** chọn góc nhìn tạo nội dung,  
**Để** cùng một vật có thể được kể theo nhiều phong cách khác nhau.

Priority: P0  
Sprint: 1

Acceptance Criteria:
- Có các mode: Museum, Fun Fact, Design, Vietnamese Culture.
- Mode mặc định là Vietnamese Culture.
- UI mode selector rõ ràng.

---

### US-003 — Tạo triển lãm mini
**Với vai trò** người dùng,  
**Tôi muốn** bấm nút tạo triển lãm,  
**Để** nhận về một bài ngắn có cấu trúc rõ ràng về vật đó.

Priority: P0  
Sprint: 1

Acceptance Criteria:
- Có loading state.
- Có error state nếu API lỗi.
- Response được render đúng các field.
- Nội dung không quá dài.

---

### US-004 — Xem kết quả dạng bảo tàng
**Với vai trò** người dùng,  
**Tôi muốn** kết quả được hiển thị đẹp như bảng mô tả trong bảo tàng,  
**Để** cảm thấy nội dung đặc biệt và muốn chia sẻ.

Priority: P0  
Sprint: 1

Acceptance Criteria:
- Có title lớn.
- Có quote/hook nổi bật.
- Có 3 fun facts dạng card/list.
- Có câu hỏi suy ngẫm cuối bài.

---

## Sprint 2 — Shareability

### US-005 — Copy nội dung
**Với vai trò** người dùng,  
**Tôi muốn** copy nội dung triển lãm,  
**Để** đăng lên Facebook/LinkedIn hoặc gửi cho bạn bè.

Priority: P0  
Sprint: 2

Acceptance Criteria:
- Có nút copy.
- Copy ra plain text đẹp.
- Có thông báo đã copy.

---

### US-006 — Chọn vật gợi ý
**Với vai trò** người dùng,  
**Tôi muốn** xem danh sách vật gợi ý,  
**Để** có cảm hứng thử app mà không cần tự nghĩ vật.

Priority: P0  
Sprint: 2

Acceptance Criteria:
- Có ít nhất 12 vật gợi ý.
- Click gợi ý sẽ fill input.
- Có nhóm “Vietnam Everyday Collection”.

---

### US-007 — Tạo share card
**Với vai trò** người dùng,  
**Tôi muốn** tạo card từ triển lãm,  
**Để** chia sẻ nội dung dưới dạng ảnh.

Priority: P1  
Sprint: 2

Acceptance Criteria:
- Card có title, share_quote, 3 fun facts.
- Có nút download.
- Kích thước phù hợp social.

---

## Sprint 3 — Retention

### US-008 — Lưu gallery
**Với vai trò** người dùng,  
**Tôi muốn** lưu lại các triển lãm đã tạo,  
**Để** xem lại bộ sưu tập của mình.

Priority: P1  
Sprint: 3

Acceptance Criteria:
- Lưu ở localStorage hoặc Supabase.
- Có trang gallery.
- Có detail page.

---

### US-009 — Regenerate
**Với vai trò** người dùng,  
**Tôi muốn** tạo lại nội dung cho cùng một vật,  
**Để** có phiên bản hay hơn.

Priority: P1  
Sprint: 3

Acceptance Criteria:
- Có nút regenerate.
- Giữ object/mode hiện tại.
- Có loading state riêng.

---

## Sprint 4 — Magic Moment

### US-010 — Upload ảnh
**Với vai trò** người dùng,  
**Tôi muốn** upload ảnh một vật,  
**Để** app tự nhận diện và tạo triển lãm.

Priority: P2  
Sprint: 4

Acceptance Criteria:
- Upload ảnh.
- AI nhận diện object_name.
- Người dùng có thể sửa tên vật trước khi generate.
