# API Spec — Bảo Tàng 1 Phút

## 1. Overview

API phục vụ chức năng tạo mini exhibition từ tên vật thể và mode.

## 2. Endpoint: Generate Exhibition

### POST `/api/exhibitions/generate`

### Request Body

```json
{
  "object_name": "dép tổ ong",
  "mode": "Vietnamese Culture",
  "language": "vi"
}
```

### Validation

| Field | Type | Required | Rule |
|---|---|---|---|
| object_name | string | yes | 1-80 chars |
| mode | string | yes | Museum, Fun Fact, Design, Vietnamese Culture |
| language | string | no | default `vi` |

### Success Response

```json
{
  "id": "uuid",
  "object_name": "dép tổ ong",
  "mode": "Vietnamese Culture",
  "language": "vi",
  "title": "...",
  "hook": "...",
  "what_it_is": "...",
  "origin_or_context": "...",
  "three_fun_facts": ["...", "...", "..."],
  "design_or_cultural_insight": "...",
  "why_it_matters": "...",
  "reflection_question": "...",
  "share_quote": "...",
  "hashtags": ["BaoTang1Phut", "OneMinuteMuseum"],
  "created_at": "2026-06-06T10:00:00Z"
}
```

### Error Response

```json
{
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Không tạo được triển lãm lúc này. Thử lại nhé."
  }
}
```

## 3. Endpoint: List Suggested Objects

### GET `/api/objects/suggested`

### Response

```json
{
  "collections": [
    {
      "name": "Vietnam Everyday Collection",
      "items": [
        "Dép tổ ong",
        "Ghế nhựa đỏ",
        "Ly cà phê sữa đá",
        "Remote TV bọc nilon"
      ]
    }
  ]
}
```

## 4. Endpoint: Save Exhibition

Optional nếu dùng database.

### POST `/api/exhibitions`

### Request Body

```json
{
  "object_name": "dép tổ ong",
  "mode": "Vietnamese Culture",
  "content": {
    "title": "...",
    "hook": "..."
  }
}
```

## 5. Endpoint: List Exhibitions

### GET `/api/exhibitions`

Query params:
- `limit`
- `offset`
- `mode`
- `q`

## 6. Endpoint: Get Exhibition Detail

### GET `/api/exhibitions/{id}`

## 7. Endpoint: Create Share Card

Optional P1.

### POST `/api/share-card`

Request:
```json
{
  "exhibition_id": "uuid",
  "format": "square"
}
```

Response:
```json
{
  "image_url": "https://..."
}
```

## 8. Error Codes

| Code | Meaning |
|---|---|
| VALIDATION_ERROR | Input không hợp lệ |
| GENERATION_FAILED | LLM generation lỗi |
| INVALID_JSON | LLM trả JSON không hợp lệ |
| RATE_LIMITED | Người dùng gọi quá nhiều |
| INTERNAL_ERROR | Lỗi hệ thống |
