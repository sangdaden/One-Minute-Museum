import type { Post } from "./types";

/**
 * Topic taxonomy ("Chủ đề") as keyword buckets — NO database column. A post
 * "belongs" to a category when any keyword substring-matches its object name,
 * title, or hashtags. Labels/descriptions live in i18n (namespace `Categories`,
 * keyed by slug) for vi/en parity; this module is locale-free.
 */
export interface Category {
  slug: string;
  /** lucide icon name resolved by the UI (see CategoryGrid). */
  icon: "Building2" | "Landmark" | "Shirt" | "Drama";
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "kien-truc",
    icon: "Building2",
    keywords: [
      "đình", "chùa", "đền", "tháp", "thành", "cung", "lăng",
      "nhà cổ", "cầu", "kiến trúc", "miếu", "văn miếu",
    ],
  },
  {
    slug: "di-san",
    icon: "Landmark",
    keywords: [
      "di sản", "cố đô", "phố cổ", "hoàng thành", "unesco",
      "thánh địa", "vịnh", "kinh thành", "di tích",
      "trống đồng", "đông sơn", "đồ đồng",
    ],
  },
  {
    slug: "trang-phuc",
    icon: "Shirt",
    keywords: [
      "áo dài", "nón lá", "áo tứ thân", "khăn", "guốc",
      "trang phục", "yếm", "áo bà ba",
    ],
  },
  {
    slug: "nghe-thuat-dan-gian",
    icon: "Drama",
    keywords: [
      "tranh", "đông hồ", "hàng trống", "múa rối", "chèo", "tuồng",
      "cải lương", "ca trù", "quan họ", "dân ca", "gốm", "rối nước",
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Lower-cased haystack of the fields a category matches against. */
function haystack(post: Pick<Post, "object_name" | "content">): string {
  const title = post.content?.title ?? "";
  const tags = (post.content?.hashtags ?? []).join(" ");
  return `${post.object_name} ${title} ${tags}`.toLowerCase();
}

export function matchCategory(
  post: Pick<Post, "object_name" | "content">,
  slug: string,
): boolean {
  const cat = getCategory(slug);
  if (!cat) return false;
  const hay = haystack(post);
  return cat.keywords.some((k) => hay.includes(k));
}

/** The first category a post matches, or undefined. */
export function primaryCategory(
  post: Pick<Post, "object_name" | "content">,
): Category | undefined {
  const hay = haystack(post);
  return CATEGORIES.find((c) => c.keywords.some((k) => hay.includes(k)));
}

export function filterByCategory<T extends Pick<Post, "object_name" | "content">>(
  posts: T[],
  slug: string,
): T[] {
  return posts.filter((p) => matchCategory(p, slug));
}
