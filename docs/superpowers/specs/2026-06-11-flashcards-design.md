# Design — Flashcards (shareable image deck)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Turn an exhibition into a small deck of square share images (flashcards) the
user can share to social apps or save to their device. Distinct from the
existing single `ShareCard` (one 1080² image in /create): this is a multi-card
deck available everywhere a card shows.

## 2. Decisions (chosen)

- **Content:** highlights deck of 5 cards — cover (image + object_name + title)
  → fun fact 01 → 02 → 03 → share_quote + hashtags.
- **Export:** Web Share API (share all cards at once when `canShare({files})`,
  else share the current card) **and** Download (current card + all). Download is
  the always-available fallback.
- **Placement:** everywhere a card renders (create, feed, detail), via a button
  in `ExhibitionCard` next to the story button.

## 3. Cards (1080×1080, themed)

Built from the `Exhibition` + `getTheme(theme)`:
1. `cover` — themed; `imageUrl` featured if present; brand kicker, object_name,
   title.
2–4. `fact` — number 01/02/03 + fun fact text.
5. `quote` — share_quote + hashtags + brand footer.

Empty fields are skipped (deck shrinks gracefully).

## 4. Components

- `components/FlashcardArtwork.tsx` — fixed 1080×1080 node (all px sizing, like
  `ShareCard`'s artwork) rendering one card by `kind`. Colours from the theme.
  Forwards a `ref` for html-to-image capture.
- `components/Flashcards.tsx` (client, portal to body) — modal carousel:
  - Renders all N artwork nodes (refs) inside a responsive square frame scaled
    via ResizeObserver (the `ShareCard` trick), translated by index.
  - Prev/next + dots + "i / n" counter; close (✕); Esc / body scroll-lock.
  - Export via `html-to-image` `toBlob` → `File`:
    - **Share all** (`navigator.canShare({files})` with N files) → `navigator.share`.
      If multi-file share unsupported but single is, show **Share this card**.
      If Web Share unsupported entirely, hide share.
    - **Save this card** (download current PNG) and **Save all** (download N).
  - States: idle / working / error, reset after a short delay.
- `components/FlashcardsButton.tsx` (client island) — opens the modal; embedded
  in both bento and themed action rows in `ExhibitionCard`.

## 5. i18n

- New namespace `Flashcards` (vi/en): `view`, `title`, `shareAll`, `shareOne`,
  `download`, `downloadAll`, `working`, `close`, `prev`, `next`. AI content stays
  Vietnamese; brand text baked into the artwork stays fixed (matches
  `ShareCard`). Keep vi/en key parity.

## 6. Out of scope

- Stitching the deck into one tall image; flip-style Q&A flashcards; video.

## 7. Notes / risks

- Web Share with files is mobile-first (Chrome/Safari). Desktop falls back to
  downloads — both buttons always present.
- Rendering N full-size nodes scaled is the proven `ShareCard` approach; 5 nodes
  is light.

## 8. Verify

- `tsc` + `build`. Manual: open from a card → carousel through 5 cards →
  Save this / Save all download PNGs; on mobile, Share opens the share sheet with
  images. With and without a photo. Toggle vi/en for chrome.
