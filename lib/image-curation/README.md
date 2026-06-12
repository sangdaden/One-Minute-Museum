# Image curation pipeline

Search culturally-relevant images, normalize their metadata (source / license /
author), score them, and keep the best few — with attribution preserved.

```
topic
  → providers (Wikimedia first, then Unsplash/Pexels)   providers/*.ts
  → ImageCandidate[]                                     types.ts
  → score each (relevance / cultural / visual / license) scoring.ts
  → keep finalScore ≥ 75, sourceUrl + license present
  → top N ScoredImage[]                                  curate.ts
```

## Usage

```ts
import { curateImages } from "@/lib/image-curation";

const picks = await curateImages("trống đồng Đông Sơn", { limit: 3 });
// picks: { candidate: ImageCandidate, score: ImageRelevanceScore }[]
```

Or via the API route: `POST /api/images/curate` with `{ "topic": "..." }`.

## Scoring

`finalScore = relevance*0.45 + cultural*0.30 + visual*0.15 + license*0.10`,
keep when `finalScore ≥ 75` **and** `sourceUrl` **and** license/author present.

`scoreImageMock` is a deterministic heuristic so everything works with no AI key.
**TODO:** replace it with an LLM/vision call using `buildScoringPrompt()` +
`IMAGE_SCORING_PROMPT` (`prompt.ts`), parsing the strict-JSON response.

## Environment variables (optional)

| Var | Used by | Notes |
|---|---|---|
| `WIKIMEDIA_API_URL` | Wikimedia provider | Defaults to `https://commons.wikimedia.org/w/api.php`; no key needed — the default live source |
| `UNSPLASH_ACCESS_KEY` | Unsplash provider | Without it → returns no results (not mock) |
| `PEXELS_API_KEY` | Pexels provider | Without it → returns no results (not mock) |
| `IMAGE_CURATION_USE_MOCK` | All providers | Set to `true` to force offline mock data (fixed cultural placeholders, unrelated to the query) |
| `OPENAI_API_KEY` / `AI_PROVIDER_API_KEY` | (future) LLM scoring | Not used yet — see TODO above |

Never hardcode keys. By default the pipeline runs on **live Wikimedia** (no key)
and returns real, attributed images; when a search has no matches it returns an
empty list (the picker shows an empty state) rather than swapping in off-topic
cultural placeholders that out-rank and hide genuine matches. Mock data is opt-in
via `IMAGE_CURATION_USE_MOCK=true` for fully offline development.

## Resilience

Mock image URLs (when `IMAGE_CURATION_USE_MOCK=true`) point at local placeholder
paths that may not exist — the UI (`SelectedImageCard`) falls back to a warm
gradient, never a broken image.
