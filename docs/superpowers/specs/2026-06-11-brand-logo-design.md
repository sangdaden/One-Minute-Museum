# Design — OMM brand logo + slogan

**Date:** 2026-06-11
**Status:** Approved

## 1. Insight

The abbreviation **OMM** (One-Minute Museum) reads aloud like **"Ôm"** (to hug).
The logo leans into that pun; the slogan is the read-aloud:

> **Ôm trộm văn hóa Việt.** — *steal a hug of Vietnamese culture.*

## 2. Decisions

- **Logo:** wordmark **OMM** in the display font (Bricolage Grotesque), heavy,
  tight tracking. A small **nón lá** (conical-hat / circumflex) sits over the
  first **O**, so it reads **Ôm**. Letters in oxblood (`--color-accent`), the nón
  in gold (`--color-gold`). Theme-token colours so it adapts to light/dark.
- **Slogan:** "Ôm trộm văn hóa Việt." (EN gloss: "Steal a hug of Vietnamese
  culture.")

## 3. Components / files

- `components/Logo.tsx` — presentational (no hooks, server-safe). Renders the
  OMM mark; the nón is an inline SVG absolutely positioned over the first O
  (sized in `em` so it scales with font-size). Optional `tagline?: string` shows
  the slogan next to the mark (hidden on mobile). `className` controls size.
- `app/icon.svg` — favicon: a rounded paper tile with an oxblood **O** ring and a
  gold nón above it (reads "Ô") — recognisable at tab size.
- `messages/*.json` `Brand` namespace: `name`, `tagline`, `abbr`. Keep vi/en
  parity.

## 4. Wiring

- Feed masthead (`app/page.tsx`): replace the "Bảo Tàng 1 Phút" eyebrow with
  `<Logo tagline={t("tagline")} />` (tagline from `getTranslations("Brand")`).
- `app/layout.tsx` metadata: lead the description / OG with the slogan; keep the
  existing title.

## 5. Out of scope

- Animated logo; full brand guidelines; PNG/apple touch icons; replacing the
  baked "Bảo Tàng 1 Phút" brand inside ShareCard/Flashcard artwork (left as-is).

## 6. Verify

- `tsc` + `build`. Manual: favicon shows in the tab; the masthead shows the OMM
  mark with the nón over the O and the slogan; both light/dark; toggle vi/en.
