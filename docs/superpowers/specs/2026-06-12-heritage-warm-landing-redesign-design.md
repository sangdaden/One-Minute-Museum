# Heritage Warm — Landing redesign

**Date:** 2026-06-12
**Status:** Approved (brainstorm) → ready for implementation plan

## Goal

Reshape the public web to match the "Concept 1: Heritage Warm" mockup: a polished,
marketing-style **landing home** with a top-nav web shell, a rich footer, and a
warm cultural visual language. Turn today's feed-as-homepage into a dedicated
**Khám phá** (explore) page, and add **Chủ đề** (topics) and **Giới thiệu**
(about) pages.

The Heritage Warm palette + tokens already ship (see `UI_GUIDELINES.md`,
`app/globals.css`). This work is layout, navigation, and decorative system — not
a palette change.

## Decisions (locked during brainstorm)

- **Navigation:** Top-nav web shell. **No bottom tab bar** (that was a mobile-app
  concept we rejected). Mobile collapses the nav into a hamburger drawer.
- **Home → landing; feed → `/kham-pha`.** Current `/` feed logic moves to a new
  Khám phá page, restyled. Home becomes the landing.
- **Scope this cycle:** global Header + Footer, Home landing, Khám phá page,
  Chủ đề page, Giới thiệu page.
- **Categories (Chủ đề):** keyword/hashtag **buckets — no DB migration.** A topic
  page is a keyword-filtered view of posts.
- **Imagery:** hand-drawn **SVG motifs** for decoration + **curated Wikimedia
  photos** (existing pipeline) for content cards. The lush hero collage is
  approximated, not pixel-matched.

### Out of scope (deferred)

- **Bộ sưu tập (Collections)** — nav item shows a "Sắp ra mắt" placeholder; the
  real feature (needs a Supabase migration) is a later cycle.
- A `category` column on `posts` (no migration this cycle).
- Custom/commissioned hero illustration art (using SVG + curated photos instead).
- Static `/ho-tro` pages footer links point to (FAQ, guide, terms, privacy) — links
  may render as placeholders/anchors this cycle; real pages later.

## Information architecture

| Route | Role | Notes |
|---|---|---|
| `/` | **Home landing** | Rewrite. Sections below. |
| `/kham-pha` | **Khám phá** — community feed | Move current `/` feed logic here, restyled. Supports `?mode=` (lens), `?chu-de=` (topic bucket), `?q=` (object search). |
| `/chu-de` | **Chủ đề** index | Lists the topic buckets; each links to `/kham-pha?chu-de=<slug>`. |
| `/gioi-thieu` | **Giới thiệu** (About) | Static brand/mission/how-it-works page. |
| `/create`, `/gallery`, `/me`, `/p/[id]`, `/u/[id]` | unchanged | Restyled only where they share the new chrome. |

**Top-nav:** Logo+tagline (left) · Khám phá · Bộ sưu tập · Chủ đề · Giới thiệu ·
🔍 search · auth control (right). "Bộ sưu tập" → "Sắp ra mắt" placeholder.
Thư viện (`/gallery`) and Của tôi (`/me`) live in the AccountMenu + footer.

## Components

### New

- **`SiteHeader`** (rewrite of existing) — top-nav bar: brand (logo + tagline),
  primary nav links, search trigger, auth control (`AccountMenu`, which already
  renders "Đăng nhập" when logged-out and the avatar menu when logged-in). Mobile:
  hamburger → slide-in drawer with the same links. Sticky, `bg-paper/85 backdrop-blur`.
- **`SiteFooter`** (new) — brand block (logo + tagline + short line + social
  icons), three link columns (Khám phá / Hỗ trợ / Về chúng tôi), faint
  pagoda/lotus watermark, red copyright band with slogan. Used on every page.
- **Home sections** (new, under `app/page.tsx` or `components/home/`):
  - `HomeHero` — headline, lead, functional upload dropzone, CTAs, privacy note,
    decorative collage.
  - `FeaturedStrip` — featured post card + Fun fact card.
  - `HowItWorks` — three static steps.
  - `CategoryGrid` — four topic cards.
  - `RecentPosts` — latest posts grid.
- **`lib/categories.ts`** — the topic taxonomy (buckets + keywords + label/desc/
  icon/accent), and a `matchCategory(post, slug)` / `filterByCategory(posts, slug)`
  helper.
- **Decorative primitives** (`components/decor/`):
  - `SectionTitle` — serif heading + gold gradient rule + optional "Xem tất cả →".
  - `DongSonWatermark`, `LotusMotif`, `PaperGrain` — inline SVG decoration
    components (no external assets, currentColor-driven, low opacity).

### Changed / moved

- The current `/` feed body (StoriesTray + FeedPost list + FeedLoadMore + lens
  Chips + Plate empty-state) **moves to `/kham-pha`** and adopts the new
  `SectionTitle`/card styling.
- `SiteFooter` is added to the global layout (or each page) so all routes share it.

## Section specs (Home landing)

1. **Hero**
   - Left: serif H1 with the 2nd/3rd lines in `--accent`; lead paragraph; an
     **upload dropzone** (drag-drop or click) that downscales the image (reuse the
     existing `ImageUpload` downscale logic) into `sessionStorage["omm-pending-image"]`
     then routes to `/create` (which reads and pre-loads it); CTAs **"Tạo bài viết"**
     (→ `/create`) and **"Xem ví dụ"** (→ `/kham-pha`); privacy note.
   - Right: decorative collage — `DongSonWatermark` behind, one or two curated
     photos in `polaroid`-style frames, a lotus motif. Approximated, decorative only.
2. **Bài viết nổi bật + Fun fact** (`FeaturedStrip`)
   - Featured = latest post that has an `image_url`, else latest post; fall back to a
     curated static feature when the DB is empty/unconfigured.
   - Featured card: image, category tag (derived via `matchCategory`), title
     (`object_name`/`title`), excerpt (`hook`), up to 3 chips (hashtags), meta
     ("1 phút đọc" + Lưu), links to `/p/[id]`.
   - Fun fact card: `three_fun_facts[0]` of the featured post (gold-bordered),
     static fallback text when empty.
3. **Cách hoạt động** (`HowItWorks`) — three static steps (Tải ảnh lên / AI phân
   tích / Nhận bài viết & fun fact), centered title. Pure presentational + i18n.
4. **Khám phá theo chủ đề** (`CategoryGrid`) — four cards from `lib/categories.ts`,
   each: optional curated image, red circular icon badge, label + short description,
   links to `/kham-pha?chu-de=<slug>`.
5. **Bài viết mới** (`RecentPosts`) — latest 4 posts (excluding the featured),
   card grid, "Xem tất cả →" → `/kham-pha`. Empty state → CTA to `/create`.

## Categories (`lib/categories.ts`)

Four buckets. `matchCategory` lowercases and substring-matches keywords against
`object_name` + `title` + `hashtags` (and optionally `what_it_is`). No accent
normalization required for MVP (keywords stored with diacritics).

| Slug | Label (vi) | Description (vi) | Keywords (seed) |
|---|---|---|---|
| `kien-truc` | Kiến trúc | Đình, chùa, thành quách | đình, chùa, đền, tháp, thành, cung, lăng, nhà cổ, cầu, kiến trúc |
| `di-san` | Di sản | Di sản vật thể & phi vật thể | di sản, cố đô, phố cổ, hoàng thành, unesco, thánh địa, vịnh |
| `trang-phuc` | Trang phục | Trang phục truyền thống | áo dài, nón lá, áo tứ thân, khăn, guốc, trang phục |
| `nghe-thuat-dan-gian` | Nghệ thuật dân gian | Tranh, múa, âm nhạc dân gian | tranh, đông hồ, hàng trống, múa rối, chèo, tuồng, cải lương, ca trù, quan họ, dân ca, gốm |

A post can match multiple buckets; the featured/recent tag shows the first match.

## Khám phá page (`/kham-pha`)

- Hosts the moved community feed: lens chips (MODES), StoriesTray, FeedPost list,
  FeedLoadMore. Restyled with `SectionTitle` + new card chrome.
- Filters via query params:
  - `?mode=<Mode>` — existing lens filter (Supabase `.eq("mode", …)`).
  - `?chu-de=<slug>` — fetch latest N (e.g. 60) posts, then `filterByCategory` in
    JS (no SQL keyword search); render as a non-paginated "matches" list with a
    header naming the topic. Infinite scroll disabled in this filtered mode.
  - `?q=<term>` — `ilike` on `object_name` (simple search from the header).
- Page header reflects the active filter (lens / topic / search term) with a
  "Xoá lọc" reset.

## Chủ đề page (`/chu-de`)

- Static index of the four buckets (same `CategoryGrid`, full-width), each linking
  to `/kham-pha?chu-de=<slug>`. Intro line + decorative divider.

## Giới thiệu page (`/gioi-thieu`)

- Static, server-rendered. Brand story ("Ôm trọn văn hoá Việt" — OMM ≈ "ôm"),
  mission, an expanded "Cách hoạt động", and a CTA to `/create`. Reuses
  `SectionTitle` + decor. i18n vi/en.

## Decorative system

- Inline SVG only (no binary assets); colors via `currentColor` / palette tokens
  so light/dark both work. Existing `public/images/patterns/dong-son-pattern.svg`
  and `paper-texture.svg` may be reused as background layers.
- Pieces: Đông Sơn drum medallion watermark (hero + section accents), lotus/cloud
  motif (footer + hero), gold gradient rule with a small center medallion
  (`SectionTitle`), red footer band.
- All decoration is `aria-hidden`, pointer-events-none, low opacity, and must not
  reduce text contrast below WCAG AA.

## Data sources & fallbacks

- Featured / recent posts: Supabase (same client as today). When
  `!isSupabaseConfigured()` or zero posts → curated static fallback content so the
  landing always looks complete (never a broken/empty hero).
- Category card images: optional — pull one curated Wikimedia thumbnail per bucket
  via the existing curation pipeline at build/request time, or ship a static SVG/
  gradient per bucket. MVP may use gradient + icon to avoid request latency on the
  landing; curated images are a nice-to-have.
- Upload handoff: downscaled JPEG data URI in `sessionStorage`, consumed once by
  `/create`.

## Auth states

- Header auth control = `AccountMenu` (already auth-aware): "Đăng nhập" when
  logged-out (matches mockup), avatar + menu (Của tôi, Thư viện, đăng xuất) when
  logged-in. The landing itself is identical for both; only the control swaps.

## i18n

- New namespaces/keys for: Header nav, Footer columns, Home (hero, featured, fun
  fact, how-it-works steps, categories, recent), Chủ đề, Giới thiệu, search.
- vi/en parity enforced (key-count diff must be empty), matching existing project
  convention.

## Error / empty states

- DB unconfigured or empty → static curated featured + a friendly empty
  `RecentPosts` CTA; the rest of the landing (hero, how-it-works, categories) is
  static and always renders.
- Khám phá empty (after filter) → "Chưa có bài nào cho chủ đề này" + reset link.
- Upload dropzone: reject non-image / oversized files with an inline message
  (reuse `ImageUpload` validation).

## Verification gates

- `npx tsc --noEmit` clean.
- `npm run build` → `✓ Compiled successfully`; new routes (`/kham-pha`, `/chu-de`,
  `/gioi-thieu`) registered.
- vi/en message-key parity diff empty.
- Manual: home renders all sections with and without DB posts; nav + mobile drawer
  work; `/kham-pha` lens/topic/search filters work; footer on every page; dark mode
  legible; decoration doesn't harm contrast.

## File touch-list (anticipated)

- `app/page.tsx` (rewrite → landing), `app/kham-pha/page.tsx` (new, from old home),
  `app/chu-de/page.tsx` (new), `app/gioi-thieu/page.tsx` (new).
- `components/SiteHeader.tsx` (rewrite), `components/SiteFooter.tsx` (new),
  `components/home/*` (new sections), `components/decor/*` (new).
- `lib/categories.ts` (new).
- `messages/vi.json`, `messages/en.json` (new keys, parity).
- Possibly `app/layout.tsx` (mount global footer).
