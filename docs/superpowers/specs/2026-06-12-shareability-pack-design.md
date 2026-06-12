# Shareability pack — rich link previews + baked credits

**Date:** 2026-06-12
**Status:** Approved (brainstorm) → ready for implementation plan

## Goal

Make shared One-Minute Museum content look good and travel correctly:
1. **Rich link previews** — pasting a post link into Facebook/Zalo/Twitter shows a
   proper title, description, and image (currently shows the generic site title
   and no image).
2. **Baked attribution** — exported share cards / flashcards built on a curated
   (Wikimedia) image carry a small source + license line, so the credit travels
   with the image when shared.

No database migration. Two independent parts (A: server metadata; B: client
image render).

## Decisions (locked in brainstorm)

- **OG image strategy:** the post's own photo when it has one, else a **static
  branded fallback** image. No dynamic Satori/ImageResponse cards (deferred —
  avoids Vietnamese-font rasterization work).
- **Scope:** post link previews (`/p/[id]`) + site-wide default OG image +
  bake-credit on the exported card. Bundled this cycle.
- **Site URL:** `metadataBase` reads `process.env.NEXT_PUBLIC_SITE_URL`, falling
  back to `http://localhost:3000`. The deployer sets the env in production.

### Out of scope (later)

- Dynamic per-post OG cards (Satori/ImageResponse).
- Per-page OG for `/u/[id]`, `/chu-de`, `/gioi-thieu` (the site default applies).
- Author/profile rich previews.

## Current state

- `app/layout.tsx` exports a base `metadata` with `openGraph`/`twitter` blocks but
  **no `metadataBase`** and **no image** → previews have no picture and relative
  image URLs can't resolve.
- `app/p/[id]/page.tsx` is a server component with **no `generateMetadata`** → a
  shared post link inherits the generic site title/description.
- `post` (via `rowToPost`) exposes `object_name`, `content` (`title`, `hook`,
  `hashtags`, …), `image_url` (public Supabase Storage URL when published with a
  photo, else null), `language`, and `image_credit?` (curated attribution).
- `components/ShareCard.tsx` (themed card + `PosterArtwork`) and
  `components/FlashcardArtwork.tsx` both render an exhibition (`ex`) that already
  carries `ex.image_credit`; both use `cardLabels(ex)` (lib/format) for
  language-correct chrome labels and `OmmMark` branding.
- `ImageCredit` = `{ source: "wikimedia"|"unsplash"|"pexels"|"user_upload",
  author?, license?, sourceUrl, title? }`.

## Part A — Rich link previews (OG/Twitter)

### A1. `metadataBase` + default OG image (`app/layout.tsx` + asset)

- Add to the root `metadata`: `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")`.
- Add a **static default OG image** so every route (and text-only posts) has a
  preview picture. Use Next's file convention: `app/opengraph-image.png`
  (1200×630). Next auto-emits the `og:image`/`twitter:image` tags for it on routes
  that don't override `images`, and also wires `twitter:card`.
  - The asset: a heritage image (a Public-Domain photo we already ship, e.g.
    `public/images/landing/hero-1.jpg` — Huế — or the Đông Sơn drum) cropped to
    1200×630, optionally with a translucent brand band + the "One-Minute Museum"
    wordmark. ASCII wordmark avoids any Vietnamese-font rasterization concern; if
    Vietnamese text is baked in, the generation step must use a Vietnamese-capable
    font. Generation method (sharp/resvg/canvas/manual) is an implementation
    detail decided in the plan; the committed artifact is a real 1200×630 PNG.
  - Add a matching `app/opengraph-image.alt.txt` (or `alt` export) for accessibility.

### A2. Per-post `generateMetadata` (`app/p/[id]/page.tsx`)

Add `export async function generateMetadata({ params })`:
- Resolve `id`; if Supabase unconfigured or post missing → `return {}` (base/site
  metadata applies; do not throw).
- Fetch a lightweight row: `object_name, content, image_url, language` for the id.
- Compute:
  - `title = (post.content.title || post.object_name) + " · OMM"`
  - `description = truncate(post.content.hook, 160)` (whitespace-trimmed, ellipsis
    if cut; fallback to the site description when hook is empty)
  - `images = post.image_url ? [post.image_url] : undefined` (undefined → the
    file-based default OG image applies)
  - `locale = post.language === "en" ? "en_US" : "vi_VN"`
- Return:
  ```
  {
    title, description,
    openGraph: { title, description, type: "article", url: `/p/${id}`, locale,
                 images },
    twitter: { card: "summary_large_image", title, description, images },
  }
  ```
  (Relative `url`/`images` resolve against `metadataBase`. Supabase `image_url` is
  already absolute.)
- Keep the page's existing `export const dynamic = "force-dynamic"`.
- A `truncate(text, n)` helper lives in `lib/format.ts` (reusable, tested by a
  node assertion).

## Part B — Bake curated-image credit into the exported card

Render a small attribution line, baked into the exported pixels, **only when**
`ex.image_credit` exists AND `ex.image_credit.source !== "user_upload"` AND a
featured image is actually shown.

- **Credit text:** `${label}: ${author} · ${license} · ${sourceName}` where
  `label` is the localized "Ảnh"/"Photo" (content language), `author` truncated
  (~28 chars), `license` from `image_credit.license`, `sourceName` a friendly map
  (`wikimedia → "Wikimedia Commons"`, `unsplash → "Unsplash"`, `pexels →
  "Pexels"`). Missing author/license parts are omitted gracefully.
- **Placement:** subtle, low-opacity, small (≈18–20px), single line, ellipsised:
  - `PosterArtwork` (photo fills the card) → just above/with the footer brand row,
    over the dark gradient so it's legible.
  - Themed `ShareCard` (image in a frame) → a thin caption directly under the
    image frame.
  - `FlashcardArtwork` (square cover image) → bottom-left corner over a faint
    scrim.
- **Helper:** `creditLine(ex, label)` in `lib/format.ts` returns the formatted
  string or `null` (null → render nothing). Source-name map + truncation live
  there. The localized label comes from `cardLabels(ex)` — add a `photo` field to
  the `cardLabels` return (vi "Ảnh" / en "Photo").
- Styling uses inline styles (these components already use inline styles for
  html-to-image export fidelity); colors chosen per surface for contrast.

## i18n

- Add the `photo` label to `cardLabels` (lib/format.ts) — vi "Ảnh", en "Photo".
  `cardLabels` is data-driven by `ex.language`, not the message catalog, so no
  `messages/*.json` change is required for the baked label. If any new
  UI-catalog string is introduced, keep vi/en parity.

## Error / edge cases

- Post without an image → no `og:image` override → site default OG image applies.
- Post without a hook → description falls back to the site description.
- `generateMetadata` must never throw (missing post / unconfigured Supabase →
  return base metadata).
- Baked credit only renders when there is both a credit and a shown image;
  user-uploaded photos get no credit line.
- Very long author/license strings are truncated/ellipsised so the line stays one
  row and never overflows the 1080² canvas.

## Verification gates

- `npx tsc --noEmit` clean; `npm run build` → `✓ Compiled successfully`.
- `truncate`/`creditLine` covered by a `node`/`tsx` assertion (no test runner in
  repo).
- Metadata: build + view the rendered `<head>` of a post route (or
  `curl`/inspect) — confirm `og:title`, `og:description`, `og:image`,
  `twitter:card=summary_large_image` reflect the post; confirm a text-only post
  falls back to the default OG image; validate with a link-preview debugger if a
  deploy URL exists.
- Baked credit: export a share card + flashcard from a post that used a curated
  Wikimedia image — confirm the credit line is present and legible; export from a
  user-uploaded-photo post — confirm no credit line.
- vi/en parity unchanged (no new catalog keys expected).

## File touch-list (anticipated)

- `app/layout.tsx` (metadataBase).
- `app/opengraph-image.png` (+ alt) — new asset.
- `app/p/[id]/page.tsx` (generateMetadata).
- `lib/format.ts` (`truncate`, `creditLine`, `cardLabels.photo`).
- `components/ShareCard.tsx`, `components/FlashcardArtwork.tsx` (baked credit line).
