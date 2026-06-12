import type { ImageCandidate, ImageProvider } from "../types";
import { mockCandidates, USE_MOCK } from "../mock-data";

/**
 * Pexels — generic visual/demo imagery. Requires PEXELS_API_KEY; without it (or
 * on error) returns no results, so it never injects off-topic mock images into a
 * live search. Set IMAGE_CURATION_USE_MOCK=true to force mock data.
 */
export const pexelsProvider: ImageProvider = {
  source: "pexels",
  async search(query, limit = 4) {
    if (USE_MOCK) return mockCandidates("pexels", query, limit);
    const key = process.env.PEXELS_API_KEY;
    if (!key) return [];
    try {
      const params = new URLSearchParams({
        query,
        per_page: String(limit),
      });
      const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: { Authorization: key },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`pexels http ${res.status}`);
      const data = await res.json();
      const photos = (data?.photos ?? []) as Array<Record<string, unknown>>;
      const out: ImageCandidate[] = [];
      for (const ph of photos) {
        const src = (ph.src ?? {}) as Record<string, string>;
        if (!src.large) continue;
        out.push({
          id: `pexels:${ph.id}`,
          source: "pexels",
          imageUrl: src.large,
          thumbnailUrl: src.medium ?? src.small,
          title: String(ph.alt || query),
          description: (ph.alt as string) ?? undefined,
          tags: [],
          author: ph.photographer as string,
          license: "Pexels License",
          sourceUrl: (ph.url as string) ?? "https://www.pexels.com",
        });
      }
      return out;
    } catch {
      return [];
    }
  },
};
