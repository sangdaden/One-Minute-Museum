# Post content-topic categories (taxonomy)

**Date:** 2026-06-12
**Status:** Approved (brainstorm) → ready for implementation plan

## Goal

Give every post a real **content topic** ("chủ đề") chosen at creation time and
stored on the post, so "Khám phá theo chủ đề" reflects what the object *is* —
and so the app's core everyday objects (phích nước, dép tổ ong, xe máy…) finally
have topics to belong to. Today the home topics are heritage-only keyword buckets
on a different axis from the create-time MODE/lens, which confuses users and
leaves everyday-object posts uncategorized.

## Decisions (locked in brainstorm)

- **How category is set:** the AI **suggests** a category as part of generation
  (a new enum field in the structured output); the user can **override** it with
  a chip selector before publishing. Always has a value, never blocks publish.
- **Existing posts (no `category`):** **keyword fallback** — posts with a null
  `category` are still matched by keyword (today's logic); new posts use the
  stored value. No backfill.
- **Category is a post-level column** (like `mode`/`theme`), NOT inside the
  `content` jsonb. Requires a small migration (run by the user).
- Topic ≠ lens: MODE (Văn hóa Việt / Bảo tàng / Sự thật thú vị / Thiết kế) stays
  the *storytelling lens*; `category` is the *content topic*. They are different
  axes by design.

## Taxonomy (approved)

Eight slugs (7 browseable + `khac` catch-all). `keywords` drive (a) the
keyword-fallback for old posts and (b) hints in the AI prompt. Labels/descriptions
live in the `Categories` i18n namespace (vi/en parity).

| Slug | vi label | en label | lucide icon | Keywords (seed) |
|---|---|---|---|---|
| `do-gia-dung` | Đồ gia dụng | Household | `Armchair` | phích nước, nồi cơm, quạt, remote, ghế nhựa, bếp, ấm, nồi, tủ lạnh, bàn ủi, đèn, mâm, rổ, xô, chậu |
| `am-thuc` | Ẩm thực & đồ uống | Food & drink | `UtensilsCrossed` | cà phê, sữa đá, phở, bánh mì, bún, cơm, trà đá, nước mắm, kẹo, bánh, ly, cốc, chén, đũa |
| `di-lai` | Xe cộ & đi lại | Getting around | `Bike` | xe máy, xe đạp, mũ bảo hiểm, áo mưa, xe buýt, xích lô, xe ôm, xe |
| `tuoi-tho` | Tuổi thơ & hoài niệm | Childhood & nostalgia | `ToyBrick` | bút bi, thiên long, đồ chơi, truyện tranh, ô ăn quan, kẹo kéo, cặp sách, bảng con, phấn |
| `trang-phuc` | Thời trang & trang phục | Fashion & dress | `Shirt` | dép, dép tổ ong, áo dài, nón lá, nón, áo, quần, guốc, khăn, yếm, áo bà ba, giày |
| `di-san` | Di sản & kiến trúc | Heritage & architecture | `Landmark` | chùa, đình, đền, tháp, thành, lăng, nhà cổ, cầu cổ, kiến trúc, miếu, văn miếu, di sản, cố đô, phố cổ, hoàng thành, di tích, trống đồng, đông sơn, đồ đồng |
| `nghe-thuat-dan-gian` | Nghệ thuật dân gian | Folk art | `Drama` | tranh dân gian, đông hồ, hàng trống, múa rối, chèo, tuồng, cải lương, ca trù, quan họ, dân ca, gốm, rối nước |
| `khac` | Khác | Other | `Shapes` | *(none — AI default when unsure)* |

- en descriptions mirror the vi ones (one short line each).
- **Featured on home** (`FEATURED_SLUGS`, 4): `do-gia-dung`, `am-thuc`,
  `tuoi-tho`, `di-san`.
- **Browse grids** (CategoryGrid home + `/chu-de`) exclude `khac`. The create
  selector and the AI enum INCLUDE `khac`.
- Implementer must confirm each lucide icon name exists in the installed
  `lucide-react` (all listed are common; substitute the closest if any is absent
  and note it).

## Data model + migration

- `supabase/migrations/0005_post_category.sql` (run by the user in the Supabase
  SQL editor, after 0004):
  ```sql
  alter table public.posts add column if not exists category text;
  create index if not exists posts_category_idx on public.posts(category);
  ```
  No CHECK constraint — the taxonomy is validated in app code so the column stays
  decoupled from the slug list.
- `lib/types.ts`: add `category?: string` to `Exhibition` and
  `category?: string | null` to `Post`.
- `lib/posts.ts`:
  - `exhibitionToPostInsert` → add `category: ex.category ?? null` to the insert
    payload (top-level, beside `mode`).
  - `PostRow` interface → add `category?: string | null`; `rowToPost` maps it.
  - `postToExhibition` → add `category: post.category ?? undefined`.

## Taxonomy module (`lib/categories.ts`)

Replace the current 4 buckets with the 8-slug taxonomy above. Keep `Category`
shape `{ slug, icon, keywords }`; `khac` has empty keywords. Add:

- `CATEGORIES` — all 8, ordered. `BROWSE_CATEGORIES` — `CATEGORIES` minus `khac`.
  `FEATURED_SLUGS` — the 4 home slugs. `CATEGORY_SLUGS` — all slugs incl. `khac`
  (for the AI enum + validation).
- `matchCategory(post, slug)` / `primaryCategory(post)` — keep (keyword logic,
  used for the fallback).
- **New** `matchesCategory(post, slug)` — `post.category === slug || (!post.category
  && matchCategory(post, slug))`. This is the filter predicate everywhere a topic
  page lists posts (stored category, else keyword fallback for old posts).
- **New** `categoryOf(post)` — returns `post.category` when it is a known slug,
  else `primaryCategory(post)?.slug`, else `undefined`. Used to tag a post (e.g.
  the featured card's category label).

## AI classification (`lib/openai-exhibition.ts` + mock)

- Add `category` to the strict Structured-Outputs schema (`RESPONSE_SCHEMA`, which
  `IMAGE_RESPONSE_SCHEMA` spreads): `category: { type: "string", enum:
  CATEGORY_SLUGS }`, and add `"category"` to the `required` array (strict mode
  requires every property in `required`).
- Prompt: instruct the model to classify the object into exactly one of the
  topic slugs (give the vi labels + a couple keyword hints per slug), and to use
  `khac` when none clearly fit.
- `validateExhibition` (the parser): read `o.category`; coerce to `"khac"` when
  missing or not in `CATEGORY_SLUGS`. Include `category` on the returned
  `Exhibition`.
- `lib/mock-exhibition.ts`: set `category` on the mock result — derive via
  `primaryCategory(...)?.slug ?? "khac"` so the offline path also produces a
  sensible topic.

## Create UI (`components/CategorySelector.tsx` + `app/create/page.tsx`)

- New `CategorySelector` — a row of chips for `BROWSE_CATEGORIES` + `Khác`,
  labelled from the `Categories` namespace, with the current value highlighted
  (mirrors `ModeSelector`/`VoiceSelector` styling). Props `{ value, onChange,
  disabled? }`.
- In `app/create/page.tsx`: add a `category` state, initialised from the
  generated `exhibition.category` (the AI suggestion) when a result arrives;
  render `CategorySelector` in the result/publish area near `ThemePicker`; pass
  the chosen `category` into the exhibition object that `PublishButton` /
  `exhibitionToPostInsert` persists. Never blocks publish (defaults to the AI
  value, else `khac`).
- A small heading + hint string ("Chủ đề · AI đề xuất" / "Topic · AI suggested").

## Browse / filter

- `components/home/CategoryGrid.tsx`: render `FEATURED_SLUGS` on the home variant
  (still 4 cards), and ALL `BROWSE_CATEGORIES` when `bare` (used by `/chu-de`).
  Keep linking to `/kham-pha?chu-de=<slug>`. Existing landing images map by slug
  where present (`di-san`, `trang-phuc`, `nghe-thuat-dan-gian`); new slugs fall
  back to the teal gradient + icon (real images are a later nice-to-have).
- `app/chu-de/page.tsx`: unchanged structurally (it renders `CategoryGrid bare`),
  now shows all 7.
- `app/kham-pha/page.tsx`: in the `?chu-de=` branch, filter the fetched window
  with `matchesCategory(p, slug)` instead of the keyword-only `filterByCategory`.
  (Fetch window stays ~60 recent; topic view remains non-paginated.)
- `app/page.tsx` featured card: derive the category label via `categoryOf(post)`
  rather than `primaryCategory(post)`.

## i18n

- `Categories` namespace (vi/en): replace the 4 entries with the 8 (`label` +
  `description` each, incl. `khac`). Keep vi/en key parity.
- Create-flow strings for the selector heading + AI-suggested hint (vi/en).
- Any other new UI string gets both locales (parity enforced).

## Edge cases

- Old post, `category` null → keyword fallback via `matchesCategory` keeps it
  visible under matching topics; `categoryOf` falls back to keyword tag.
- Stored `category` not in the taxonomy (shouldn't happen — AI enum + validation
  constrain it) → treated as uncategorized by `categoryOf` (returns keyword or
  undefined); `matchesCategory` only exact-matches known slugs.
- `khac` posts: appear in neither browse grid nor any topic filter (by design),
  but still show in the unfiltered feed.
- Migration not yet run (column missing) → selecting `category` in a query
  errors; since the insert/selects add `category`, the user MUST run 0005 before
  deploying. Document this clearly in the plan + migration header.

## Verification gates

- `npx tsc --noEmit` clean; `npm run build` → `✓ Compiled successfully`.
- `node`/`tsx` assertions for `matchesCategory` (stored match, keyword fallback
  for null category, no match for `khac`) and `categoryOf` (stored vs keyword).
- vi/en `Categories` + new strings parity (key-diff empty).
- Manual (after running 0005): create a post → AI pre-selects a topic → change it
  → publish → it appears under that topic on `/chu-de` → `/kham-pha?chu-de=`; an
  old post still appears under a keyword-matching topic; `khac` post hidden from
  topic grids but present in the feed.

## File touch-list (anticipated)

- `supabase/migrations/0005_post_category.sql` (new).
- `lib/categories.ts` (taxonomy + `matchesCategory`/`categoryOf`).
- `lib/types.ts`, `lib/posts.ts` (category column wiring).
- `lib/openai-exhibition.ts`, `lib/mock-exhibition.ts` (AI classification).
- `components/CategorySelector.tsx` (new), `app/create/page.tsx` (selector).
- `components/home/CategoryGrid.tsx`, `app/kham-pha/page.tsx`, `app/page.tsx`
  (browse/filter/label).
- `messages/vi.json`, `messages/en.json` (Categories + create strings).

## Out of scope (later)

- Real curated images for the new slugs (gradient + icon for now).
- Editing a published post's category.
- A dedicated `/chu-de/khac` page.
- Backfilling old posts' `category`.
