# Coding Agent Instructions — Bảo Tàng 1 Phút

## 1. Mission

Build MVP for **Bảo Tàng 1 Phút**, a web app that turns everyday objects into one-minute mini museum exhibitions.

## 2. Recommended Stack

Prefer:
- Next.js App Router
- TypeScript
- Tailwind CSS
- API route `/api/exhibitions/generate`
- OpenAI/Gemini SDK
- localStorage for gallery in MVP

Avoid overengineering:
- No auth in MVP.
- No complex database unless requested.
- No payment.
- No community feed.

## 3. Required Pages

### `/`
Home page:
- Hero title
- Object input
- Mode selector
- Suggested objects
- Generate button
- Result card

### `/gallery`
Gallery page:
- Show saved exhibitions from localStorage
- Empty state

Optional:
### `/exhibitions/[id]`
Detail page if using persistent storage.

## 4. Components

Create components:

- `ObjectInput`
- `ModeSelector`
- `SuggestedObjects`
- `GenerateButton`
- `ExhibitionCard`
- `LoadingExhibition`
- `ErrorState`
- `CopyButton`
- `ShareCardPreview`
- `GalleryGrid`

## 5. API Route

Create:

`POST /api/exhibitions/generate`

Input:
```ts
type GenerateRequest = {
  object_name: string;
  mode: "Museum" | "Fun Fact" | "Design" | "Vietnamese Culture";
  language?: "vi" | "en";
}
```

Output:
```ts
type Exhibition = {
  id: string;
  object_name: string;
  mode: string;
  language: string;
  title: string;
  hook: string;
  what_it_is: string;
  origin_or_context: string;
  three_fun_facts: string[];
  design_or_cultural_insight: string;
  why_it_matters: string;
  reflection_question: string;
  share_quote: string;
  hashtags: string[];
  created_at: string;
}
```

## 6. Prompt Requirements

Use the prompt in `prompt_spec.md`.

Important:
- Force JSON output if the model supports response_format.
- Validate parsed JSON.
- If JSON parse fails, return `INVALID_JSON`.
- Do not expose raw model errors to users.

## 7. UI Requirements

The result must feel like a museum label.

Minimum visual structure:
- Badge: ONE-MINUTE MUSEUM
- Large title
- Hook block
- Sections
- 3 fun facts
- Reflection question
- Action buttons

## 8. Suggested Objects

Hardcode initial list:

```ts
const suggestedObjects = [
  "Dép tổ ong",
  "Ghế nhựa đỏ",
  "Ly cà phê sữa đá",
  "Remote TV bọc nilon",
  "Áo mưa",
  "Xe máy",
  "Mũ bảo hiểm",
  "Phích nước",
  "Nồi cơm điện",
  "Quạt máy",
  "Túi nilon đi chợ",
  "Bút bi Thiên Long",
  "Dây thun",
  "Lịch bloc",
  "Ổ khóa cửa",
  "Bàn chải đánh răng"
];
```

## 9. State Handling

Home page state:
- `objectName`
- `mode`
- `isLoading`
- `error`
- `currentExhibition`

localStorage:
- Save generated exhibitions under key `one_minute_museum_exhibitions`.

## 10. Copy Format

Implement copy text:

```text
{title}

{hook}

3 điều thú vị:
1. {fact1}
2. {fact2}
3. {fact3}

{why_it_matters}

Câu hỏi: {reflection_question}

#{hashtags}
```

## 11. Acceptance Criteria

MVP is complete when:
- User can generate an exhibition from text input.
- User can choose mode.
- Result renders beautifully.
- User can copy content.
- User can click suggested objects.
- Basic gallery is available or localStorage save exists.
- App handles loading/error states.
- Output is Vietnamese by default.

## 12. Development Order

1. Create Next.js project.
2. Build static UI.
3. Add mode selector and suggested objects.
4. Add API route with mock response.
5. Integrate LLM.
6. Render real response.
7. Add copy.
8. Add localStorage save/gallery.
9. Polish UI.
10. Deploy.
