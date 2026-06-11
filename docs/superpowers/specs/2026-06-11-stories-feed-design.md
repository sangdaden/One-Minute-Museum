# Design — Stories feed (Facebook-style tray + multi-post player)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Add a Facebook/Instagram-style stories experience to the Khám phá feed: a row
of story bubbles at the top, opening a full-screen player that plays through one
post's story then auto-advances to the next post (swipe to switch posts).

## 2. Components

- **`components/StorySlides.tsx`** (extracted from StoryViewer): the `Slide`
  type, `buildStorySlides(exhibition)`, and the pure `StorySlideBody` presentational
  component. Shared by the single-exhibition viewer and the multi-post player.
- **`components/StoryViewer.tsx`** (existing, from a card button): refactored to
  use the shared module. Behaviour unchanged (single exhibition).
- **`components/StoriesPlayer.tsx`** (new, portal): takes `posts: Post[]` +
  `startIndex`. Tracks `(postIndex, slideIndex)`.
  - Next: advance the slide; at the post's last slide → next post (slide 0); at
    the last post → close. Prev mirrors (to the previous post's start).
  - Tap zones (left third = prev slide, right = next slide), keyboard
    (←/→/Space/Esc). **Horizontal swipe switches posts** (FB-style: swipe =
    next/prev person).
  - Progress segments for the current post's slides; header shows the post
    **author** (avatar + name) + close. Reuses `Story` i18n + `StorySlideBody`.
- **`components/StoriesTray.tsx`** (new, client): a horizontal scrollable row of
  ringed bubbles (post image or themed placeholder + object name). Tapping opens
  `StoriesPlayer` at that index over the full posts list.

## 3. Wiring

- `app/page.tsx`: render `<StoriesTray posts={posts} />` at the top of the feed
  column when there are posts (first page only — recent stories).

## 4. i18n

- Reuse the existing `Story` namespace (close/next/prev/factKicker/outro). No new
  keys needed; bubbles use the object name, the player header uses the author
  name. Parity unchanged.

## 5. Out of scope

- Seen/unseen rings; auto-advance timers; per-post story persistence; stories
  from non-feed sources.

## 6. Verify

- `tsc` + `build`. Manual: feed shows a story row; tap a bubble → full-screen
  player; tap/→ advances slides and rolls into the next post; swipe switches
  posts; Esc closes. Single-card "Xem story" still works.
