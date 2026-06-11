import type { ImageCandidate, ScoredImage } from "./types";
import { wikimediaProvider } from "./providers/wikimedia";
import { unsplashProvider } from "./providers/unsplash";
import { pexelsProvider } from "./providers/pexels";
import { scoreImageMock } from "./scoring";

export interface CurateOptions {
  /** How many images to keep. */
  limit?: number;
  /** Also search Unsplash/Pexels (generic mood imagery). */
  includeGeneric?: boolean;
}

/**
 * MVP curation pipeline:
 *   topic → search Wikimedia first → (optionally) supplement with Unsplash/Pexels
 *        → normalize → score → keep top N relevant, attributed images.
 */
export async function curateImages(
  topic: string,
  opts: CurateOptions = {},
): Promise<ScoredImage[]> {
  const limit = opts.limit ?? 3;
  const candidates: ImageCandidate[] = [];

  // Wikimedia first — preferred for cultural/historical assets.
  candidates.push(...(await wikimediaProvider.search(topic, 8).catch(() => [])));

  // Supplement with generic providers when results are thin (or requested).
  if (opts.includeGeneric || candidates.length < 6) {
    const [u, p] = await Promise.all([
      unsplashProvider.search(topic, 4).catch(() => []),
      pexelsProvider.search(topic, 4).catch(() => []),
    ]);
    candidates.push(...u, ...p);
  }

  // De-dup by image URL.
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    if (!c.imageUrl || seen.has(c.imageUrl)) return false;
    seen.add(c.imageUrl);
    return true;
  });

  return unique
    .map((candidate) => ({ candidate, score: scoreImageMock(topic, candidate) }))
    .filter((s) => s.score.shouldUse && Boolean(s.candidate.sourceUrl))
    .sort((a, b) => b.score.finalScore - a.score.finalScore)
    .slice(0, limit);
}
