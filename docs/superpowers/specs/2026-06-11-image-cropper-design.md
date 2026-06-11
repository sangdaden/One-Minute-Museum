# Design — Image cropper (user reframes to the app's frame)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Let the user zoom and reposition their photo to fit the app's canonical featured
frame, instead of the app auto-cropping (or letterboxing) it. Replaces guesswork
with an Instagram-style adjust step.

## 2. Decisions

- **Frame:** 1:1 square — the frame used by share card / flashcards; a square
  also displays cleanly in every `object-contain` surface (fills a square frame,
  centres elsewhere).
- **Controls:** drag to pan, slider + wheel to zoom (1×–3×). Square viewport.
- **Output:** a 1080×1080 JPEG data URI, reused by the existing photo pipeline
  (replaces `resultImage`; published to Storage as today).
- **Entry point:** a "Căn chỉnh ảnh" button in the /create result area, shown
  whenever a featured image exists (works for uploaded photos and AI images).

## 3. Component

- `components/ImageCropper.tsx` (client, portal):
  - Props: `src: string`, `onCancel()`, `onDone(dataUri)`.
  - Square viewport measured via ResizeObserver (`V` px). Natural image size
    loaded once. `base = max(V/iw, V/ih)` (cover-fit at 1×); `displayScale =
    base × zoom`. Pan offset clamped so the image always covers the viewport.
  - Export: map the viewport square to source pixels and `drawImage` into a
    1080² canvas → `toDataURL("image/jpeg", 0.88)`.
  - Pointer events for drag (mouse + touch), `touch-none`; body scroll-lock.

## 4. Wiring

- `app/create/page.tsx`: `cropping` state; button opens `ImageCropper` on
  `resultImage`. On done → `setResultImage(uri)`; if the source was an uploaded
  photo (`imageSource === "upload"`) also `setImage(uri)` so a later regenerate
  keeps the crop. AI images update `resultImage` only.

## 5. i18n

- New namespace `Cropper` (vi/en): `title`, `hint`, `zoom`, `done`, `cancel`,
  `adjust` (the button). Keep vi/en key parity.

## 6. Out of scope

- Non-square aspect ratios; rotation/flip; filters; cropping feed images
  (cropper is used in /create on in-session data URIs to avoid canvas CORS
  tainting from remote Storage URLs).

## 7. Verify

- `tsc` + `build`. Manual: upload a tall photo → Căn chỉnh → pan/zoom → Done →
  the framed square shows on the card/flashcard/share. AI image reframes too.
  Toggle vi/en.
