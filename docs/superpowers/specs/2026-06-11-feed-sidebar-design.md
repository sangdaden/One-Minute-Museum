# Design — Feed sidebar additions (quick start · lens filter · stats)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Fill the sparse left sidebar of the Khám phá feed (under the create CTA) with
useful blocks: quick-start object suggestions, a lens (mode) filter, and a
community stat.

## 2. Blocks (in the sticky left column)

1. **Lọc theo góc nhìn** — chips: "Tất cả" + the 4 modes. Each links to
   `/?mode=<canonical>` (All → `/`). Active chip highlighted. Labels from the
   `Modes` i18n namespace; links use the canonical mode value.
2. **Gợi ý tạo nhanh** — chips from `SUGGESTED_OBJECTS` (first ~8) linking to
   `/create?object=<name>`; /create prefills the object input.
3. **Thống kê cộng đồng** — a muted line "{count} triển lãm từ cộng đồng".

## 3. Backend

- `app/page.tsx` (server): accept `searchParams` → read `mode` (validate against
  `MODES`). Filter the feed query with `.eq("mode", mode)` when set. Run a
  `head:true` count query for the total community exhibitions. Pass `mode` to
  `FeedLoadMore`.
- `app/api/feed/route.ts`: read + validate `mode`, add `.eq("mode", mode)`.
- `components/FeedLoadMore.tsx`: accept `mode?` prop, append `&mode=` to the
  fetch URL so paging keeps the filter.
- `mode` is a top-level `posts` column (confirmed) — plain `.eq` works.

## 4. /create prefill

- On mount, read `?object=` from `window.location.search` and set the object
  input (no auto-generate). Avoids a useSearchParams Suspense boundary.

## 5. i18n

- `Feed`: `lens`, `allLenses`, `quickStart`, `statsExhibitions` ({count}). Reuse
  `Modes` labels for the filter chips. vi/en parity.

## 6. Out of scope

- Filtering by voice/theme/hashtag; sort options; trending tags; auto-generate
  on quick-start.

## 7. Verify

- `tsc` + `build`. Manual: pick a lens → feed filters and load-more keeps it; a
  quick-start chip opens /create with the object filled; the stat shows the
  count. Toggle vi/en.
