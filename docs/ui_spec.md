# UI Spec — Bảo Tàng 1 Phút

## 1. Design Direction

Cảm giác thiết kế:
- Modern museum
- Editorial
- Ấm, gần gũi
- Tối giản nhưng có cá tính
- Phù hợp screenshot/share

## 2. Suggested Visual Style

### Colors
Không bắt buộc, nhưng nên theo hướng:
- Background: off-white / warm paper
- Text: near-black
- Accent: deep red, indigo hoặc muted gold
- Card border: light gray

### Typography
- Title font: serif hoặc display font nhẹ nếu có.
- Body font: sans-serif dễ đọc.
- Không dùng quá nhiều font.

### Layout
- Desktop: centered max-width 900px.
- Mobile: single column.

## 3. Home Page

### Sections

#### Hero
Content:
```text
Bảo Tàng 1 Phút
Biến những vật bình thường quanh bạn thành một triển lãm mini.
```

Input:
```text
[Nhập một vật...]
```

Button:
```text
Tạo triển lãm
```

Suggested chips:
- Dép tổ ong
- Ghế nhựa đỏ
- Ly cà phê sữa đá
- Áo mưa
- Remote TV bọc nilon

#### Mode Selector
Cards:
- Vietnamese Culture
- Museum
- Fun Fact
- Design

Each card has:
- Icon
- Title
- Short description

## 4. Result Card

### Structure

```text
ONE-MINUTE MUSEUM

Bảo tàng một phút: Dép tổ ong

"Quote/hook nổi bật"

Đây là gì?
...

Câu chuyện phía sau
...

3 điều thú vị
1. ...
2. ...
3. ...

Góc nhìn thiết kế/văn hóa
...

Vì sao đáng chú ý?
...

Câu hỏi suy ngẫm
...
```

### Actions
- Copy
- Regenerate
- Create share card
- Save

## 5. Loading State

Text:
```text
Đang dựng triển lãm...
```

Skeleton:
- Title bar
- Quote block
- 3 fact cards

## 6. Empty State

Nếu chưa generate:
```text
Chọn một vật bình thường và biến nó thành một triển lãm nhỏ.
```

## 7. Error State

```text
Không tạo được triển lãm lúc này. Thử lại nhé.
```

Buttons:
- Retry
- Change object

## 8. Gallery Page

Card item:
- Object name
- Mode
- Hook preview
- Created date

Empty gallery:
```text
Bảo tàng của bạn chưa có hiện vật nào.
Thử bắt đầu với “dép tổ ong” hoặc “ghế nhựa đỏ”.
```

## 9. Share Card Design

Square 1080x1080.

Content:
```text
BẢO TÀNG 1 PHÚT

DÉP TỔ ONG

"Một thiết kế bình dân nhưng sống dai trong ký ức Việt Nam."

3 điều thú vị:
• ...
• ...
• ...

#BaoTang1Phut
```

Visual:
- Big object name.
- Quote centered.
- 3 facts below.
- Footer small.
