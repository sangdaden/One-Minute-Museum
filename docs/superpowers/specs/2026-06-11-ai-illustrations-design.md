# Design — AI sample illustrations (no input photo)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

When a user generates an exhibition **without uploading a photo**, let them
generate a few AI sample images of the object and pick one to attach to the
post. The chosen image flows through the existing photo pipeline (in-session
`resultImage` → uploaded to Storage on publish).

## 2. Decisions (chosen)

- **Trigger:** manual button (cost-aware). Shown only when an exhibition exists
  and there is no image yet (`!resultImage`).
- **Count:** 3 candidates per generation.
- **Style:** clean studio / catalogue object photo — object centred, plain
  background, soft light, no text, no logos, no people.

## 3. Backend

- New `lib/openai-illustration.ts`:
  - `generateObjectImages(objectName: string): Promise<string[]>` — returns 3
    `data:image/png;base64,…` URIs.
  - OpenAI **Images API**: model from `OPENAI_IMAGE_MODEL` (default
    `gpt-image-1`), `n: 3`, `size: "1024x1024"`, `quality: "low"`, response as
    `b64_json`.
  - Fixed studio prompt incorporating the Vietnamese object name.
  - Reuses the `GenerationError` pattern (public-safe code/message; never leak
    keys or provider details). Maps RateLimit / Auth / APIError like
    `openai-exhibition.ts`.
- New route `POST /api/exhibitions/illustrate` (`runtime = "nodejs"`):
  - Body `{ object_name: string }`. Validates non-empty, ≤ `OBJECT_NAME_MAX`.
  - No `OPENAI_API_KEY`: dev → mock (3 deterministic placeholder data URIs);
    prod → clear config error.
  - Returns `{ images: string[] }`.
- New `lib/mock-illustration.ts`: 3 simple SVG-based placeholder data URIs so
  the flow works without a key in dev.

## 4. Frontend

- New `components/ImageSuggestions.tsx` (client):
  - Props: `objectName: string`, `onPick: (dataUri: string) => void`.
  - States: idle (button "Tạo ảnh minh hoạ bằng AI") → loading (3 shimmer
    tiles) → grid of 3 images (click to pick) / error (retry).
  - "Tạo lại" regenerates a fresh set.
- `app/create/page.tsx`:
  - In the result area, when `exhibition && !resultImage`, render
    `ImageSuggestions` with `onPick={(uri) => setResultImage(uri)}`.
  - When `resultImage` is set, the card already shows it; add a small "Đổi ảnh"
    / "Bỏ ảnh" control to clear `resultImage` and return to suggestions.
  - Regenerating the exhibition or changing object already resets
    `resultImage` → AI choice resets too (no extra work).
- Display + publish path unchanged: chosen image reuses `resultImage`, shown in
  `ExhibitionCard`, uploaded by `PublishButton` on publish. No DB schema change.

## 5. i18n

- New namespace `Illustrate` (vi/en): button, loading, pick hint, regenerate,
  remove/change, error. Keep vi/en key parity.

## 6. Out of scope

- Theme-styled or scene illustrations; image editing; saving multiple images
  per post; localising the *generated* image prompt to EN (object name drives
  it; UI-locale-independent).

## 7. Notes / risks

- `gpt-image-1` may require OpenAI org verification; if the key can't access it,
  the route surfaces a friendly error.
- 1024 PNGs are ~1–2 MB base64; they pass through Storage fine. Optional future
  optimisation: downscale before publish.

## 8. Verify

- `tsc` + `build` gate. Manual: generate an exhibition with no photo → button →
  3 images → pick → appears on card → publish attaches it. Dev mock path works
  without a key. Toggle vi/en for the new strings.
