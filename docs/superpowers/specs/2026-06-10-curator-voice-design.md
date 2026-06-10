# Design — Curator Voice (Giọng kể)

**Date:** 2026-06-10
**Status:** Approved (pending spec review)
**Approach:** A — voice thuần prompt (lean), giữ schema ổn định.

## 1. Mục tiêu

Tăng **chiều sâu văn hóa** cho One-Minute Museum bằng cách thêm một trục mới:
**giọng kể (curator voice)**. Cùng một vật, qua bốn giọng Việt rất khác nhau, cho
ra bốn cảm giác kể chuyện khác nhau.

Nguyên tắc cốt lõi:

> **Mode = kể điều gì** (góc nhìn nội dung). **Voice = kể bằng giọng ai** (tone/persona).

Voice là **trục song song** với mode (không thay thế). Generation = `vật × mode × voice`.

## 2. Phạm vi

### Trong phạm vi (v1)
- 4 giọng kể, chọn được qua một selector mới, song song với 4 mode hiện có.
- Lưu `voice` vào exhibition; hiển thị byline "Kể bởi · {voice}".
- API mở rộng cộng thêm (additive), tương thích ngược.
- Mock fallback ghi nhận voice.

### Ngoài phạm vi (future)
- Giọng **Gen Z / mạng xã hội** (dễ thêm sau — chỉ là một voice nữa).
- **Approach C**: mỗi giọng thêm một trường nội dung riêng (Bà → một mẩu *ký ức*;
  Nhà thơ → một *câu thơ*). Đổi schema + layout → để bản sau.
- Lưu "giọng yêu thích" của người dùng.
- Thêm byline vào copy social format (giữ nguyên ở v1).

## 3. Dàn giọng (v1)

| Giọng | Mặc định | Tone |
|---|---|---|
| **Nhà nghiên cứu** | ✓ | Điềm đạm, chuẩn mực, có chiều sâu — tương đương giọng curator hiện tại. |
| **Bà kể chuyện** | | Ấm, hoài niệm; "hồi đó…", "ngày xưa…"; xưng hô thân mật (con/cháu); kể như ngồi kể cho cháu nghe. |
| **Chú bán hàng** | | Đời, dí dỏm, gần gũi kiểu quán xá vỉa hè; câu ngắn, ví von đời thường, tếu nhẹ — không thô tục. |
| **Nhà thơ** | | Văn chương, giàu hình ảnh, có nhịp điệu, ẩn dụ nhẹ; vẫn rõ nghĩa, không sáo rỗng. |

`DEFAULT_VOICE = "Nhà nghiên cứu"` ⇒ ai không đụng selector sẽ có trải nghiệm **y như hiện tại**.

## 4. Data model

```ts
// lib/types.ts
export const VOICES = [
  "Nhà nghiên cứu",
  "Bà kể chuyện",
  "Chú bán hàng",
  "Nhà thơ",
] as const;
export type Voice = (typeof VOICES)[number];

// GenerateRequest:  + voice?: Voice
// Exhibition:       + voice?: string   // optional — back-compat cho dữ liệu cũ
```

- `Exhibition.voice` để **optional** một cách có chủ đích: exhibition tạo mới luôn
  set voice, nhưng những cái đã lưu trong gallery trước feature này thì không có
  trường này. UI tự ẩn byline nếu thiếu.

```ts
// lib/constants.ts
export const DEFAULT_VOICE: Voice = "Nhà nghiên cứu";

export const VOICE_META: Record<Voice, { icon: string; description: string }> = {
  "Nhà nghiên cứu": { icon: "◷", description: "Điềm đạm, chuẩn mực, có chiều sâu." },
  "Bà kể chuyện":   { icon: "❀", description: "Ấm áp, hoài niệm, ‘hồi đó…’." },
  "Chú bán hàng":   { icon: "☕", description: "Đời, dí dỏm, gần gũi vỉa hè." },
  "Nhà thơ":        { icon: "✦", description: "Văn chương, giàu hình ảnh." },
};
```

## 5. Generation & guardrails

Trong `lib/openai-exhibition.ts`, thêm vào **user prompt**:
- Dòng `Giọng kể: {voice}`.
- Khối "Hướng dẫn giọng kể:" liệt kê tone của từng giọng (tương tự cách 4 mode
  đang được giải thích).

Thêm **một dòng guardrail cứng** (user prompt, gần các ràng buộc hiện có):

> *Giọng kể chỉ thay đổi cách diễn đạt và lựa chọn từ ngữ, KHÔNG thay đổi tính
> chính xác hay mức độ chắc chắn của thông tin. Vẫn dùng ngôn ngữ thận trọng khi
> không chắc; vẫn đúng JSON schema, đủ 3 fun facts, độ dài đọc ~1 phút; hashtags
> không dấu.*

**Rủi ro chính:** giọng Bà/Chú dễ "bịa cho vui". Mitigation = dòng guardrail trên
+ giữ nguyên system prompt gốc (vốn đã cấm bịa năm/người/số liệu). Không đổi
JSON schema, không đổi cơ chế parse/validate đang có.

`generateExhibitionWithLLM` và `generateMockExhibition` đều nhận `voice` và đưa
vào kết quả trả về. Mock biến đổi tone **nhẹ** (vài chữ ở hook/share_quote) để
dev fallback cảm nhận được giọng.

## 6. API

`POST /api/exhibitions/generate` — mở rộng additive:

- Request thêm `voice?` (cạnh `object_name`, `mode`, `language`).
- Validate: `voice ∈ VOICES`; nếu thiếu/không hợp lệ → `DEFAULT_VOICE` (KHÔNG trả lỗi).
- Response Exhibition có thêm `voice`.
- Mọi nhánh khác (validation object_name/mode, dev mock fallback khi thiếu
  `OPENAI_API_KEY`, error codes) **giữ nguyên**.

## 7. UI

- **`components/VoiceSelector.tsx` (mới):** đặt dưới ModeSelector. Dạng **hàng pill
  gọn** (icon + tên) để khác trọng lượng thị giác với mode cards và tránh "hai
  lưới nặng". Selected = nền/viền accent (design tokens hiện có). Responsive wrap
  trên mobile. Label section: "Chọn giọng kể".
- **`app/page.tsx`:** thêm state `voice` (mặc định `DEFAULT_VOICE`);
  `generate(name, mode, voice)` gửi kèm `voice`; "Tạo lại" giữ voice hiện tại.
- **`components/ExhibitionCard.tsx`:** byline "Kể bởi · {voice}" ở dòng medium
  (cạnh `{mode} · {language}`), chỉ hiện khi có voice.
- **`components/ShareCard.tsx`:** dòng "Kể bởi {voice}" nhỏ ở header (nhẹ), chỉ khi có voice.
- **`components/GalleryItem.tsx`:** voice như tag nhỏ cạnh mode (nếu có).

## 8. Back-compat

- API additive ⇒ client cũ không gửi `voice` vẫn chạy (server điền default).
- Exhibition cũ trong `localStorage` (không có `voice`) ⇒ ẩn byline/tag, không vỡ.
  `lib/gallery.ts` vốn đã lọc lenient theo `id`.
- `DEFAULT_VOICE` = giọng hiện tại ⇒ hành vi mặc định không đổi.

## 9. Files đụng tới

| File | Thay đổi |
|---|---|
| `lib/types.ts` | + `VOICES`, `Voice`; `voice?` trong GenerateRequest & Exhibition |
| `lib/constants.ts` | + `DEFAULT_VOICE`, `VOICE_META` |
| `lib/openai-exhibition.ts` | inject voice prompt + guardrail; trả `voice` |
| `lib/mock-exhibition.ts` | nhận + ghi `voice`; tweak tone nhẹ |
| `app/api/exhibitions/generate/route.ts` | validate + default voice; pass through |
| `app/page.tsx` | state `voice`; gửi kèm; render VoiceSelector |
| `components/VoiceSelector.tsx` | **mới** |
| `components/ExhibitionCard.tsx` | byline |
| `components/ShareCard.tsx` | byline nhẹ |
| `components/GalleryItem.tsx` | voice tag |

**Không thêm dependency.** Không đụng business logic của generate ngoài việc thêm trục voice.

## 10. Verify

- `npx tsc --noEmit` → 0 lỗi.
- `npm run build` pass.
- Generate thật cùng một vật ("dép tổ ong") qua **cả 4 giọng** → tone khác nhau
  rõ, vẫn đúng schema, vẫn đủ 3 fun facts.
- `voice` không hợp lệ → rơi về `DEFAULT_VOICE` (200, không lỗi).
- Exhibition cũ (không có `voice`) trong gallery vẫn render, không byline.
- Dev mock fallback (không có key) ghi đúng `voice`.
