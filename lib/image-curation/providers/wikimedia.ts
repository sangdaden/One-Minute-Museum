import type { ImageCandidate, ImageProvider } from "../types";
import { mockCandidates, USE_MOCK } from "../mock-data";

/**
 * Wikimedia Commons — preferred for cultural/historical/heritage assets. No API
 * key required and reachable without credentials, so it is the default source.
 *
 * Returns real results (possibly empty) — it does NOT silently swap in mock
 * cultural images, because those out-rank and hide the genuine matches a search
 * actually found. Set IMAGE_CURATION_USE_MOCK=true to force mock data offline.
 */
const API =
  process.env.WIKIMEDIA_API_URL ?? "https://commons.wikimedia.org/w/api.php";

function stripHtml(s?: string): string | undefined {
  return s ? s.replace(/<[^>]+>/g, "").trim() || undefined : undefined;
}

export const wikimediaProvider: ImageProvider = {
  source: "wikimedia",
  async search(query, limit = 8) {
    if (USE_MOCK) return mockCandidates("wikimedia", query, limit);
    try {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrsearch: query,
        gsrnamespace: "6", // File:
        gsrlimit: String(limit),
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "800",
        origin: "*",
      });
      const res = await fetch(`${API}?${params}`, {
        headers: { "User-Agent": "OneMinuteMuseum/1.0 (image curation)" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`wikimedia http ${res.status}`);
      const data = await res.json();
      const pages = data?.query?.pages ?? {};
      const out: ImageCandidate[] = [];
      for (const key of Object.keys(pages)) {
        const p = pages[key];
        const ii = p?.imageinfo?.[0];
        if (!ii?.url) continue;
        const meta = ii.extmetadata ?? {};
        out.push({
          id: `wikimedia:${p.pageid}`,
          source: "wikimedia",
          imageUrl: ii.url,
          thumbnailUrl: ii.thumburl ?? ii.url,
          title: String(p.title ?? "")
            .replace(/^File:/, "")
            .replace(/\.[a-z0-9]+$/i, ""),
          description: stripHtml(meta.ImageDescription?.value),
          author: stripHtml(meta.Artist?.value),
          license: stripHtml(meta.LicenseShortName?.value),
          sourceUrl: ii.descriptionurl ?? ii.url,
          tags: [],
        });
      }
      return out;
    } catch {
      return [];
    }
  },
};
