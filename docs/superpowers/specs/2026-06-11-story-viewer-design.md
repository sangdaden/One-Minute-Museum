# Design — Story viewer (Facebook/Instagram Stories style)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Let a user experience an exhibition as a full-screen Stories sequence: first the
image, then one piece of content per slide (hook → facts → reflection), advanced
by tap/swipe.

## 2. Decisions (chosen)

- **Placement:** everywhere an exhibition card shows (create, feed, detail) —
  via a shared button inside `ExhibitionCard`.
- **Advance:** manual only (tap zones / swipe / keyboard). No auto-advance.
- **Granularity:** fine — each fun fact is its own slide (~11 slides total).

## 3. Slide model & order

```
type Slide =
  | { kind: "cover" }
  | { kind: "section"; kicker: string; body: string; emphasis?: boolean }
  | { kind: "fact"; index: number; body: string }
  | { kind: "outro" }
```

Order built from the `Exhibition`:
1. **cover** — `imageUrl` full-bleed + gradient + `object_name` / `title`; if no
   image, a themed title cover.
2. hook (emphasis) · kicker `Card.hook`
3. what_it_is · `Card.what`
4. origin_or_context · `Card.story`
5–7. three_fun_facts[0..2] · kicker `Story.factKicker {n}`
8. design_or_cultural_insight · `Card.insight`
9. why_it_matters · `Card.why`
10. reflection_question (emphasis) · `Card.reflection`
11. **outro** — `share_quote` + `#hashtags`

Empty fields are skipped defensively.

## 4. Components

- `components/StoryViewer.tsx` (client, portal to `document.body`):
  - Props: `exhibition`, `imageUrl?`, `onClose`.
  - Builds `slides`, owns `index`.
  - Theme colours from `getTheme(exhibition.theme)` (bg/ink/accent). Each slide:
    segmented progress bar (one per slide), close (✕), small header
    (`object_name` · voice), kicker, large centred body.
  - Navigation: right half / swipe-left / ArrowRight / Space → next; left half /
    swipe-right / ArrowLeft → prev; Esc or next-past-last → `onClose()`.
    `body` scroll locked while open.
- `components/StoryButton.tsx` (client island):
  - Props: `exhibition`, `imageUrl?`. Renders a "View as story" button (Play
    icon); manages open state and renders `StoryViewer`.
  - Embedded in **both** the bento and themed action rows in `ExhibitionCard`
    (next to Copy / Regenerate), so it appears wherever a card renders —
    server-rendered feed/detail included (client island).

## 5. i18n

- New namespace `Story` (vi/en): `view`, `close`, `next`, `prev`, `factKicker`
  (`Fun fact {n}` / numbered), `outro` (share kicker). Section kickers reuse the
  existing `Card` namespace. Keep vi/en key parity. AI content stays Vietnamese.

## 6. Out of scope

- Timed auto-advance; editing slides; exporting a story video; per-slide share.

## 7. Verify

- `tsc` + `build`. Manual: open from a card in create / feed / detail → cover →
  swipe/tap through → Esc closes. With and without an image. Toggle vi/en for the
  chrome.
