# Design — Photo → Exhibition (chụp/upload ảnh → tạo fact)

**Date:** 2026-06-10
**Status:** Approved (pending spec review)
**Topic:** (B) Cho người dùng đưa ảnh vật thể, dùng vision sinh exhibition.
**Approach:** 1 — mở rộng pipeline `/api/exhibitions/generate` hiện có.

## 1. Mục tiêu & quyết định cốt lõi

Người dùng đưa một tấm ảnh vật thể (chụp bằng điện thoại hoặc chọn từ máy) và nhận
về một mini exhibition **sinh từ chính bức ảnh đó** (multimodal). Quyết định đã chốt:

- **Vai trò ảnh:** sinh nội dung trực tiếp từ ảnh (model "nhìn" ảnh), không chỉ
  nhận diện tên. Model cũng trả về `object_name` đã nhận diện để đặt title/byline/tên file.
- **Nhập ảnh:** `<input type="file" accept="image/*" capture="environment">` —
  mobile mở camera, desktop chọn file. Không xây camera live.
- **Hiển thị ảnh:** hiện trên result card + share card của phiên hiện tại; **không
  lưu vào gallery** (tránh đầy localStorage, riêng tư hơn). Gallery vẫn text-only.

## 2. Phạm vi

### Trong phạm vi
- API + generator nhận ảnh optional (multimodal), trả exhibition + `object_name` nhận diện.
- Nén ảnh phía client, component upload, hiển thị ảnh trên ExhibitionCard + ShareCard.
- Dev mock fallback cho image path.

### Ngoài phạm vi
- Lưu ảnh vào gallery / database / server.
- Camera live (getUserMedia).
- Gõ text làm "gợi ý" kèm ảnh — v1 ảnh được ưu tiên, text gõ tay bỏ qua khi có ảnh.
- Nhiều ảnh / chỉnh sửa ảnh.

## 3. Luồng dữ liệu

1. Client: người dùng chọn ảnh → `fileToDownscaledDataUrl` nén thành JPEG data URI
   (cạnh dài tối đa 1024px, quality ~0.8).
2. Page giữ `imageDataUrl` ở state; gửi kèm request `{ image, mode, voice, language }`
   (object_name optional khi có ảnh).
3. Route validate ảnh → gọi `generateExhibitionWithLLM` với ảnh.
4. Model trả JSON (gồm `object_name` nhận diện) → Exhibition.
5. Page truyền `imageDataUrl` (state) cho ExhibitionCard + ShareCard để hiển thị.
   **Ảnh không nằm trong Exhibition** → gallery (localStorage) vẫn text-only.

## 4. API

`POST /api/exhibitions/generate` — mở rộng additive:

- `GenerateRequest` thêm `image?: string` (data URI).
- Có `image`:
  - Validate: phải khớp `^data:image/(png|jpeg|jpg|webp);base64,`; chặn kích thước
    (độ dài chuỗi base64 > ~1.5MB → `VALIDATION_ERROR` "Ảnh không hợp lệ hoặc quá lớn").
  - `object_name` **không bắt buộc** (model nhận diện).
- Không có `image`: text path như hiện tại (object_name bắt buộc 1–80 ký tự).
- mode/voice/language validate như hiện tại (voice thiếu/sai → default).
- Thiếu `OPENAI_API_KEY`: dev → mock fallback (image path trả object_name "Vật trong ảnh");
  production → `INTERNAL_ERROR` như cũ.

## 5. Generation (vision)

Trong `lib/openai-exhibition.ts`:

- Khi có ảnh, message `user` là mảng nội dung:
  `[{type:"text", text: <prompt>}, {type:"image_url", image_url:{url: image, detail:"low"}}]`.
  `detail:"low"` để giảm chi phí token ảnh. Model giữ nguyên `gpt-4o-mini`.
- Prompt (image): "Dựa vào ẢNH, nhận diện vật chính và viết mini exhibition về nó."
  Vẫn kèm mode + giọng kể + ràng buộc schema/độ dài hiện có.
- **Schema (image path)** = schema hiện tại **+ `object_name`** (string). Sau parse:
  `exhibition.object_name = parsed.object_name`. Text path giữ schema cũ và dùng
  `object_name` người dùng nhập.
- **Guardrail thêm (image):**
  - Tả vật chính trong ảnh; **không nhận diện hay mô tả người cụ thể**.
  - Không suy đoán thương hiệu/năm/thông số chỉ từ ảnh nếu không chắc — dùng ngôn
    ngữ thận trọng.
  - Giữ luật không bịa + giọng kể chỉ đổi tone + JSON hợp lệ.
- Lỗi provider map như cũ (RateLimit/Auth/APIError → code tương ứng); JSON hỏng → `INVALID_JSON`.

## 6. Client: nén ảnh + upload

- `lib/image.ts` (mới): `fileToDownscaledDataUrl(file, maxDim=1024, quality=0.8): Promise<string>`
  — vẽ lên `<canvas>` thu nhỏ theo cạnh dài, export `toDataURL("image/jpeg", quality)`.
  Chặn file không phải `image/*`; throw lỗi rõ ràng để UI bắt.
- `components/ImageUpload.tsx` (mới, client): nút "Thêm ảnh" + input file ẩn; sau khi
  chọn → gọi helper, hiện **thumbnail preview** + nút "Xóa ảnh"; báo lỗi nếu nén thất bại.
  Props: `value: string | null`, `onChange(dataUrl | null)`, `disabled?`.

## 7. UI: page wiring

`app/page.tsx`:
- State `imageDataUrl: string | null`.
- Đặt `ImageUpload` cạnh/dưới ObjectInput. Khi có ảnh: ô nhập tên thành optional,
  placeholder đổi "Đã có ảnh — tên sẽ tự nhận diện".
- `generate()` gửi `image` khi có; ảnh được ưu tiên (bỏ qua text gõ tay ở v1).
- Khi thành công: lưu exhibition (như cũ) + giữ `imageDataUrl` để truyền cho
  `ExhibitionCard`/`ShareCard`. "Tạo lại" với cùng ảnh dùng lại `imageDataUrl`.
- Dòng chú thích nhỏ: "Ảnh chỉ dùng để tạo, không được lưu."

## 8. UI: hiển thị ảnh

- `ExhibitionCard` thêm prop optional `imageUrl?: string`. Có ảnh → thêm **ô ảnh**
  trong bento: desktop Title `span-4` + Ảnh `span-2` cạnh nhau; mobile xếp dọc.
  Ảnh `object-fit:cover`, bo góc, nhãn "Ảnh của bạn". Không ảnh → bố cục bento hiện tại.
- `ShareCard` thêm prop optional `imageUrl?: string` → chèn **dải ảnh** phía trên trong
  artwork 1080 (dùng `<img>` data URI — chạy với html-to-image). Không ảnh → layout hiện tại.

## 9. Mock / lỗi / privacy

- **Dev mock + ảnh:** `generateMockExhibition` nhận `image?`; có ảnh → object_name
  "Vật trong ảnh", vẫn áp mode/voice + flavor.
- **Lỗi ảnh:** sai định dạng/quá lớn → `VALIDATION_ERROR`. Model lỗi → `GENERATION_FAILED`/`INVALID_JSON`.
- **Privacy:** ảnh chỉ gửi OpenAI để tạo; không lưu server, không vào gallery; chú thích ở UI.

## 10. Phạm vi file

| File | Thay đổi |
|---|---|
| `lib/types.ts` | + `image?: string` trong GenerateRequest |
| `lib/image.ts` | **mới** — nén ảnh client |
| `lib/openai-exhibition.ts` | nhánh ảnh: multimodal message, schema + object_name, guardrail |
| `lib/mock-exhibition.ts` | nhánh ảnh: object_name "Vật trong ảnh" |
| `app/api/exhibitions/generate/route.ts` | validate ảnh; object_name optional khi có ảnh |
| `components/ImageUpload.tsx` | **mới** |
| `app/page.tsx` | state ảnh + wiring + truyền imageUrl |
| `components/ExhibitionCard.tsx` | ô ảnh optional |
| `components/ShareCard.tsx` | dải ảnh optional trong artwork |

**Không thêm dependency** (canvas + OpenAI SDK vision sẵn có).

## 11. Verify

- `npx tsc --noEmit` = 0 lỗi; `npm run build` pass.
- Mock path (không key) + ảnh → 200, object_name "Vật trong ảnh".
- Một ảnh thật + key → exhibition bám nội dung ảnh, có object_name nhận diện (tốn ít token).
- Ảnh sai định dạng/quá lớn → `VALIDATION_ERROR`.
- Text path cũ vẫn chạy nguyên (không hồi quy).
- Lưu ý: UI nhìn mắt (upload, ô ảnh, share) cần trình duyệt — không có Playwright để chụp tự động.
