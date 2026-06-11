import type { ImageCandidate, ImageProvider } from "../types";
import { mockCandidates } from "../mock-data";

/**
 * Wikimedia Commons — preferred for cultural/historical/heritage assets. No API
 * key required. Falls back to mock data on any error/timeout so the UI is never
 * broken.
 */
const API =
  process.env.WIKIMEDIA_API_URL ?? "https://commons.wikimedia.org/w/api.php";

function stripHtml(s?: string): string | undefined {
  return s ? s.replace(/<[^>]+>/g, "").trim() || undefined : undefined;
}

export const wikimediaProvider: ImageProvider = {
  source: "wikimedia",
  async search(query, limit = 8) {
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
      return out.length ? out : mockCandidates("wikimedia", query, limit);
    } catch {
      return mockCandidates("wikimedia", query, limit);
    }
  },
};
