import type { Post } from "./types";

/**
 * Content-topic taxonomy ("Chủ đề"). A post's topic is the stored `category`
 * column when present; for older posts with no stored value we fall back to
 * keyword matching (`matchCategory`). Labels/descriptions live in i18n
 * (namespace `Categories`, keyed by slug). `khac` is the catch-all default.
 */
export interface Category {
  slug: string;
  icon:
    | "Armchair"
    | "UtensilsCrossed"
    | "Bike"
    | "ToyBrick"
    | "Shirt"
    | "Landmark"
    | "Drama"
    | "Shapes";
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  { slug: "do-gia-dung", icon: "Armchair", keywords: ["phích nước", "nồi cơm", "quạt", "remote", "ghế nhựa", "bếp", "ấm", "nồi", "tủ lạnh", "bàn ủi", "đèn", "mâm", "rổ", "xô", "chậu"] },
  { slug: "am-thuc", icon: "UtensilsCrossed", keywords: ["cà phê", "sữa đá", "phở", "bánh mì", "bún", "cơm", "trà đá", "nước mắm", "kẹo", "bánh", "ly", "cốc", "chén", "đũa"] },
  { slug: "di-lai", icon: "Bike", keywords: ["xe máy", "xe đạp", "mũ bảo hiểm", "áo mưa", "xe buýt", "xích lô", "xe ôm", "xe"] },
  { slug: "tuoi-tho", icon: "ToyBrick", keywords: ["bút bi", "thiên long", "đồ chơi", "truyện tranh", "ô ăn quan", "kẹo kéo", "cặp sách", "bảng con", "phấn"] },
  { slug: "trang-phuc", icon: "Shirt", keywords: ["dép tổ ong", "dép", "áo dài", "nón lá", "nón", "áo", "quần", "guốc", "khăn", "yếm", "áo bà ba", "giày"] },
  { slug: "di-san", icon: "Landmark", keywords: ["chùa", "đình", "đền", "tháp", "thành", "lăng", "nhà cổ", "cầu cổ", "kiến trúc", "miếu", "văn miếu", "di sản", "cố đô", "phố cổ", "hoàng thành", "di tích", "trống đồng", "đông sơn", "đồ đồng"] },
  { slug: "nghe-thuat-dan-gian", icon: "Drama", keywords: ["tranh dân gian", "đông hồ", "hàng trống", "múa rối", "chèo", "tuồng", "cải lương", "ca trù", "quan họ", "dân ca", "gốm", "rối nước"] },
  { slug: "khac", icon: "Shapes", keywords: [] },
];

/** All slugs incl. `khac` — used by the AI enum + the create selector. */
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
/** Browseable topics (everything except the catch-all). */
export const BROWSE_CATEGORIES = CATEGORIES.filter((c) => c.slug !== "khac");
/** Slugs featured on the home "Khám phá theo chủ đề" grid (4). */
export const FEATURED_SLUGS = ["do-gia-dung", "am-thuc", "tuoi-tho", "di-san"];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Coerce any value to a valid slug, defaulting to "khac". */
export function coerceCategory(v: unknown): string {
  return typeof v === "string" && CATEGORY_SLUGS.includes(v) ? v : "khac";
}

/** Lower-cased haystack of the fields keyword-matching looks at. */
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

/** First browseable category a post matches by keyword, or undefined. */
export function primaryCategory(
  post: Pick<Post, "object_name" | "content">,
): Category | undefined {
  const hay = haystack(post);
  return BROWSE_CATEGORIES.find((c) => c.keywords.some((k) => hay.includes(k)));
}

/**
 * Topic-page filter predicate: the stored category, OR — for older posts with
 * no stored category — a keyword match. Keeps pre-taxonomy posts visible.
 */
export function matchesCategory(
  post: Pick<Post, "object_name" | "content" | "category">,
  slug: string,
): boolean {
  if (post.category) return post.category === slug;
  return matchCategory(post, slug);
}

/** Slug to tag a post with: stored topic (if a known non-"khac" slug), else keyword. */
export function categoryOf(
  post: Pick<Post, "object_name" | "content" | "category">,
): string | undefined {
  if (post.category && post.category !== "khac" && getCategory(post.category)) {
    return post.category;
  }
  return primaryCategory(post)?.slug;
}
