# MVP Scope — Bảo Tàng 1 Phút

## 1. MVP Goal

Trong phiên bản đầu tiên, người dùng có thể nhập một vật bình thường, chọn một góc nhìn và nhận về một mini exhibition có format đẹp, dễ đọc, dễ chia sẻ.

## 2. MVP Features

### P0 — Bắt buộc

#### F01. Object Input
Người dùng nhập tên vật thể.

Acceptance Criteria:
- Có input text.
- Có placeholder gợi ý: “Ví dụ: dép tổ ong, ghế nhựa đỏ, ly cà phê sữa đá”.
- Không cho submit nếu input rỗng.
- Trim khoảng trắng trước/sau.

#### F02. Mode Selector
Người dùng chọn mode tạo nội dung.

MVP modes:
- Museum
- Fun Fact
- Design
- Vietnamese Culture

Acceptance Criteria:
- Có ít nhất 4 mode.
- Mode mặc định là Vietnamese Culture.
- Mode được gửi kèm request generate.

#### F03. Generate Exhibition
Hệ thống tạo mini exhibition bằng AI.

Acceptance Criteria:
- Gọi API generate.
- Nhận response JSON.
- Render ra UI.
- Có trạng thái loading.
- Có trạng thái error.

#### F04. Result Display
Hiển thị nội dung như một bảng triển lãm.

Acceptance Criteria:
- Hiển thị title, hook, what_it_is, origin_or_context, fun_facts, insight, why_it_matters, reflection_question, share_quote.
- Nội dung dễ đọc trên desktop và mobile.
- Có layout dạng card.

#### F05. Copy Content
Người dùng copy nội dung.

Acceptance Criteria:
- Có nút copy.
- Sau khi copy hiển thị trạng thái “Đã copy”.
- Nội dung copy có format dễ đăng social.

#### F06. Suggested Objects
Có danh sách vật gợi ý.

Acceptance Criteria:
- Hiển thị ít nhất 12 vật gợi ý.
- Click vào vật gợi ý sẽ fill input hoặc generate trực tiếp.
- Ưu tiên vật Việt Nam.

### P1 — Nên có

#### F07. Gallery
Lưu danh sách triển lãm đã tạo.

Acceptance Criteria:
- Lưu localStorage hoặc database.
- Có trang gallery.
- Click một item để xem lại detail.

#### F08. Share Card
Tạo card 1080x1080 hoặc PNG để share.

Acceptance Criteria:
- Card gồm title, quote, 3 facts.
- Có nút download/share.
- UI card đẹp, đơn giản.

#### F09. Regenerate
Người dùng tạo lại nội dung cho cùng object/mode.

Acceptance Criteria:
- Nút regenerate gọi lại API.
- Giữ nguyên object và mode.
- Không làm mất result cũ cho đến khi result mới sẵn sàng.

### P2 — Sau MVP

#### F10. Upload Image
Người dùng upload ảnh vật thể.

#### F11. Curator Voice
Chọn giọng kể: serious curator, funny uncle, product designer, historian.

#### F12. Daily Object
Mỗi ngày gợi ý một vật mới.

#### F13. Public Profile
Người dùng có trang museum riêng.

## 3. Out of Scope

Không làm trong MVP:
- Login bắt buộc.
- Thanh toán.
- Mobile app.
- Community feed.
- Hệ thống fact-check nhiều nguồn.
- Chỉnh sửa card kéo thả.
- Tạo video.

## 4. MVP Demo Script

1. Mở app.
2. Nhập “dép tổ ong”.
3. Chọn mode “Vietnamese Culture”.
4. Bấm generate.
5. Show result card.
6. Copy nội dung.
7. Click object gợi ý “ghế nhựa đỏ”.
8. Generate tiếp.
9. Show gallery hoặc share card nếu đã làm P1.
