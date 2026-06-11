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
| `WIKIMEDIA_API_URL` | Wikimedia provider | Defaults to `https://commons.wikimedia.org/w/api.php`; no key needed |
| `UNSPLASH_ACCESS_KEY` | Unsplash provider | Without it → mock data |
| `PEXELS_API_KEY` | Pexels provider | Without it → mock data |
| `OPENAI_API_KEY` / `AI_PROVIDER_API_KEY` | (future) LLM scoring | Not used yet — see TODO above |

Never hardcode keys. With no keys / no network, every provider falls back to
mock candidates (`mock-data.ts`) so the UI keeps working; the demo at
`/images-demo` and the API route both run offline.

## Resilience

Mock image URLs point at local placeholder paths that may not exist yet — the
UI (`SelectedImageCard`) falls back to a warm gradient, never a broken image.
