import type { ImageCandidate, ImageSource } from "./types";

/**
 * Mock candidates so the pipeline + UI work without external API keys/network.
 * Image URLs point at local placeholder paths (which may not exist yet) — the
 * UI falls back to a warm gradient instead of a broken image.
 */
const SEED = [
  {
    slug: "dong-son-drum",
    title: "Trống đồng Đông Sơn",
    desc: "Bronze Đông Sơn drum — an icon of ancient Vietnamese heritage.",
    tags: ["đông sơn", "trống đồng", "bronze", "vietnam", "heritage", "artifact"],
    dir: "culture",
  },
  {
    slug: "water-puppet",
    title: "Múa rối nước",
    desc: "Traditional Vietnamese water puppetry performance.",
    tags: ["múa rối nước", "water puppet", "vietnam", "culture", "folk"],
    dir: "culture",
  },
  {
    slug: "hue-imperial-city",
    title: "Hoàng thành Huế",
    desc: "The Imperial City of Huế, a UNESCO heritage site.",
    tags: ["huế", "imperial", "heritage", "vietnam", "unesco"],
    dir: "demo",
  },
  {
    slug: "hoi-an-lantern",
    title: "Đèn lồng Hội An",
    desc: "Silk lanterns lighting the old town of Hội An.",
    tags: ["hội an", "lantern", "vietnam", "old town"],
    dir: "demo",
  },
  {
    slug: "ao-dai",
    title: "Áo dài",
    desc: "The traditional Vietnamese áo dài.",
    tags: ["áo dài", "vietnam", "costume", "culture"],
    dir: "culture",
  },
] as const;

const AUTHOR: Record<ImageSource, string> = {
  wikimedia: "Wikimedia Commons contributor",
  unsplash: "Unsplash photographer",
  pexels: "Pexels photographer",
  user_upload: "You",
};

const LICENSE: Record<ImageSource, string> = {
  wikimedia: "CC BY-SA 4.0",
  unsplash: "Unsplash License",
  pexels: "Pexels License",
  user_upload: "—",
};

export function mockCandidates(
  source: ImageSource,
  query: string,
  limit = 4,
): ImageCandidate[] {
  const queryTags = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  return SEED.slice(0, limit).map((s) => ({
    id: `${source}:mock:${s.slug}`,
    source,
    imageUrl: `/images/${s.dir}/${s.slug}.jpg`,
    thumbnailUrl: `/images/${s.dir}/${s.slug}.jpg`,
    title: s.title,
    description: s.desc,
    tags: [...s.tags, ...queryTags],
    author: AUTHOR[source],
    license: LICENSE[source],
    sourceUrl:
      source === "wikimedia"
        ? `https://commons.wikimedia.org/wiki/File:${s.slug}.jpg`
        : `https://example.com/${source}/${s.slug}`,
  }));
}
