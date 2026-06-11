# Design — Palette refresh + teal accent

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Adopt a refined warm palette and introduce a new **teal** accent, used in a
restrained way for interactive/discovery elements.

## 2. Token mapping (light `:root`)

| New | Hex | Existing token |
|---|---|---|
| background | `#F7F1E3` | `--paper` |
| card | `#FFF9EF` | `--paper-card` |
| foreground | `#2F2621` | `--ink` |
| muted | `#7A6A5F` | `--ink-soft` |
| primary | `#A8322A` | `--accent` |
| secondary | `#C89B3C` | `--gold` |
| accent (teal) | `#2F7C74` | `--teal` (NEW) |
| border | `#E3D2B8` | `--border` |

Derived (not in the source palette): `--paper-sunk #EFE6D4`,
`--ink-faint #9F8E7E`, `--accent-deep #7E241D`, `--border-strong #D6C19D`,
`--teal-deep #245F58`.

Dark mode keeps the warm brown-black backgrounds; accent/gold/teal use
brightened variants. New `--color-teal` / `--color-teal-deep` added to
`@theme inline`.

## 3. Teal usage (restrained — interactive accent)

Oxblood stays the primary CTA; gold stays for fun facts. Teal is applied to:
- text selection (`::selection`)
- the active lens-filter chip on the feed
- the active reaction in `ReactionBar`

(`text-teal` / `bg-teal` are available for future use.)

## 4. Consistency

- `lib/themes.ts` default theme ("Mặc định") aligned to the new
  paper/ink/accent values.
- `app/icon.svg` favicon + the `OmmMark` nón use the new oxblood/gold.

## 5. Out of scope

- A teal-based card theme; recolouring every accent usage; restyling the other
  artistic themes.

## 6. Verify

- `tsc` + `build`. Manual: warmer paper everywhere; filter chip + active
  reaction read teal; light/dark both fine.
