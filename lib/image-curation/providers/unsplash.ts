import type { ImageCandidate, ImageProvider } from "../types";
import { mockCandidates, USE_MOCK } from "../mock-data";

/**
 * Unsplash — generic visual/demo imagery. Requires UNSPLASH_ACCESS_KEY; without
 * it (or on error) returns no results, so it never injects off-topic mock images
 * into a live search. Set IMAGE_CURATION_USE_MOCK=true to force mock data.
 */
export const unsplashProvider: ImageProvider = {
  source: "unsplash",
  async search(query, limit = 4) {
    if (USE_MOCK) return mockCandidates("unsplash", query, limit);
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return [];
    try {
      const params = new URLSearchParams({
        query,
        per_page: String(limit),
        content_filter: "high",
      });
      const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
        headers: { Authorization: `Client-ID ${key}` },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`unsplash http ${res.status}`);
      const data = await res.json();
      const results = (data?.results ?? []) as Array<Record<string, unknown>>;
      const out: ImageCandidate[] = [];
      for (const r of results) {
        const urls = (r.urls ?? {}) as Record<string, string>;
        if (!urls.regular) continue;
        const user = (r.user ?? {}) as Record<string, string>;
        const links = (r.links ?? {}) as Record<string, string>;
        out.push({
          id: `unsplash:${r.id}`,
          source: "unsplash",
          imageUrl: urls.regular,
          thumbnailUrl: urls.small ?? urls.thumb,
          title: String(r.description || r.alt_description || query),
          description: (r.alt_description as string) ?? undefined,
          tags: Array.isArray(r.tags)
            ? (r.tags as Array<{ title?: string }>)
                .map((t) => t.title)
                .filter((t): t is string => Boolean(t))
            : [],
          author: user.name,
          license: "Unsplash License",
          sourceUrl: links.html ?? `https://unsplash.com/photos/${r.id}`,
        });
      }
      return out;
    } catch {
      return [];
    }
  },
};
