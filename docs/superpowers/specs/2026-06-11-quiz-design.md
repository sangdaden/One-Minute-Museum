# Design — Đố vui (quiz from an exhibition)

**Date:** 2026-06-11
**Status:** Approved

## 1. Goal

Turn any exhibition into a short, playable multiple-choice quiz generated from
its own content — a fun, "1-minute" way to test what you just read.

## 2. Decisions

- **Placement:** a "Đố vui" button in the exhibition card action row (next to
  Story / Flashcards) → available everywhere a card renders.
- **Count:** 4 questions, 4 options each.
- **Feedback:** immediate — after picking, reveal the correct answer + a short
  explanation, then "Tiếp"; final screen shows the score.
- **Daily challenge:** out of scope (v2 — needs an "object of the day" source).

## 3. Data

`QuizQuestion` (in `lib/types.ts`, no provider import):
`{ question: string; options: string[]; answer_index: number; explanation: string }`.

## 4. Backend

- `lib/openai-quiz.ts`: `generateQuiz(exhibition): Promise<QuizQuestion[]>`.
  gpt-4o-mini, Structured Outputs. Prompt feeds the exhibition's own text
  (object_name, what_it_is, origin, 3 facts, insight, why) and asks for exactly
  N questions grounded ONLY in that content. Validates shape + `answer_index`
  range; reuses the `GenerationError` mapping.
- `lib/mock-quiz.ts`: deterministic 4-question mock for keyless dev.
- `POST /api/exhibitions/quiz` (`runtime nodejs`): body `{ exhibition }`,
  validates the key fields, returns `{ questions }`. No key → dev mock / prod
  config error. Never leak provider details.

## 5. Frontend

- `components/QuizModal.tsx` (client, portal): fetches the quiz; one question at
  a time; option buttons lock on pick and reveal correct (green) / wrong (red) +
  explanation; "Tiếp" / "Xem kết quả"; final score + praise tier + "Chơi lại"
  (replays the same set, free). Neutral paper-card styling; Esc / scroll-lock.
- `components/QuizButton.tsx` (island): opens the modal with the exhibition.
- Wire into both bento + themed `ExhibitionCard` action rows.

## 6. i18n

- New `Quiz` namespace (vi/en): view, title, loading, error, next, seeResult,
  correct, wrong, result, score ({correct}/{total}), praise tiers, replay,
  close. AI content stays Vietnamese. Keep vi/en parity.

## 7. Verify

- `tsc` + `build`. Manual: open from a card → 4 questions → instant feedback +
  explanation → score + replay. Dev mock works without a key. Toggle vi/en.
