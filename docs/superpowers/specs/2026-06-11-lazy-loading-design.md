# Design — Lazy loading (infinite scroll + lazy images)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Replace the manual "Tải thêm" feed button with scroll-triggered loading, and let
below-the-fold images load only as they approach the viewport.

## 2. Decisions

- **Feed:** auto-load the next page when the bottom approaches
  (IntersectionObserver), keeping a **fallback "Tải thêm" button** for errors /
  browsers without IntersectionObserver.
- **Images:** add `loading="lazy"` + `decoding="async"` to content images.

## 3. Feed — `components/FeedLoadMore.tsx`

- Keep the existing keyset pagination (`/api/feed?before=…`, `nextBefore`).
- Add a sentinel `<div>` after the loaded posts; observe it with
  `IntersectionObserver({ rootMargin: "600px 0px" })` so the next page prefetches
  before the user hits the very bottom.
- `loadingRef` guards against overlapping fetches. While fetching, show a small
  spinner (`Loader2`) + `LoadMore.loading`.
- On fetch error, stop observing and show the manual **`LoadMore.loadMore`**
  button (retry). The button is also the fallback when `IntersectionObserver` is
  unavailable. Reuses existing `LoadMore` i18n keys.
- Stops when `nextBefore` is `null`.

## 4. Images

Add `loading="lazy"` + `decoding="async"` to feed/grid/avatar images:
- `ExhibitionCard` object photo, `ThemedCard` photo, `GalleryItem` image,
  `FeedPost` avatar, `CommentList` avatars, profile (`u/[id]`) + post (`p/[id]`)
  header avatars.

Left eager on purpose:
- `ShareCard` / `FlashcardArtwork` artwork — captured by html-to-image; lazy
  could export a blank image.
- `StoryViewer` (only mounts when opened), `ImageCropper` / `ImageUpload` /
  `ImageSuggestions` (interactive current image).

## 5. Out of scope

- next/image migration; skeleton placeholders; virtualized list; lazy-loading the
  comments list.

## 6. Verify

- `tsc` + `build`. Manual: scroll the feed → next page loads automatically near
  the bottom; offline/error → fallback button appears; images below the fold load
  as they near the viewport (Network panel).
