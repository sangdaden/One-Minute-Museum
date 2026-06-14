# Post Content-Topic Categories — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every post a real content topic ("chủ đề") chosen at creation (AI-suggested, user-overridable) and stored in a `posts.category` column, so "Khám phá theo chủ đề" reflects what objects are — including everyday objects.

**Architecture:** New 8-slug taxonomy in `lib/categories.ts` (7 browseable + `khac`). The AI generator returns a `category` enum; the create UI shows a `CategorySelector` prefilled with it; publish stores it on the post. Browsing filters by stored category OR keyword fallback for old posts (`matchesCategory`). One small Supabase migration (run by the user).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase (`@supabase/ssr`), OpenAI Structured Outputs, next-intl, lucide-react. **No test runner** — verify with `npx tsx` assertions, `npx tsc --noEmit`, `npm run build`, and vi/en parity checks.

**Reference:** Spec `docs/superpowers/specs/2026-06-12-post-category-taxonomy-design.md`.

**Conventions:** Branch `feat/post-category`. Commit per task. The 8 lucide icons used (Armchair, UtensilsCrossed, Bike, ToyBrick, Shirt, Landmark, Drama, Shapes) are confirmed to exist in the installed `lucide-react`.

⚠️ **Migration must be run by the user in the Supabase SQL editor before deploy** — the insert/selects reference `category`. (Local dev without Supabase configured still builds and type-checks.)

---

## Task 0: Branch

- [ ] `git checkout -b feat/post-category` → expect `Switched to a new branch 'feat/post-category'`.

---

## Task 1: Migration + types + post mappers

**Files:** create `supabase/migrations/0005_post_category.sql`; modify `lib/types.ts`, `lib/posts.ts`.

- [ ] **Step 1: Migration file** `supabase/migrations/0005_post_category.sql`:
```sql
-- One-Minute Museum — per-post content topic (category)
-- Run this in the Supabase SQL editor after 0004_post_theme.sql.

alter table public.posts add column if not exists category text;
create index if not exists posts_category_idx on public.posts(category);
```

- [ ] **Step 2: `lib/types.ts`** — add the category field to `Exhibition` and `Post`, and add `"category"` to the `ExhibitionContent` omit list (category is a post column, NOT in content jsonb).
  - In `Exhibition` (near `theme?`): add `  /** Content topic slug (see lib/categories). Stored as a post column. */\n  category?: string;`
  - In `Post` (near `theme?: string | null`): add `  /** Content topic slug. */\n  category?: string | null;`
  - Change `ExhibitionContent`:
    ```ts
    export type ExhibitionContent = Omit<
      Exhibition,
      "id" | "object_name" | "mode" | "voice" | "language" | "created_at" | "theme" | "category"
    >;
    ```

- [ ] **Step 3: `lib/posts.ts`** — wire the column through the mappers.
  - `exhibitionToPostInsert` return object: add `category: ex.category ?? null,` (right after `language: ex.language,`).
  - `PostRow` interface: add `category?: string | null;` (near `theme?: string | null;`).
  - `rowToPost` return: add `category: row.category ?? null,` (near `theme: row.theme ?? null,`).
  - `postToExhibition` return: add `category: post.category ?? undefined,` (near `theme: post.theme ?? undefined,`).

- [ ] **Step 4: Typecheck** — `npx tsc --noEmit` → exit 0.

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/0005_post_category.sql lib/types.ts lib/posts.ts
git commit -m "feat: posts.category column + type/mapper wiring + migration 0005"
```

---

## Task 2: Taxonomy module + i18n

**Files:** rewrite `lib/categories.ts`; modify `messages/vi.json`, `messages/en.json`.

- [ ] **Step 1: Replace `lib/categories.ts` entirely** with:
```ts
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
```
> Note: `filterByCategory` is intentionally removed; its only caller (`app/kham-pha/page.tsx`) switches to `matchesCategory` in Task 5.

- [ ] **Step 2: Replace the `Categories` namespace in `messages/vi.json`** with all 8 entries:
```json
"Categories": {
  "do-gia-dung": { "label": "Đồ gia dụng", "description": "Vật dụng trong nhà, bếp núc" },
  "am-thuc": { "label": "Ẩm thực & đồ uống", "description": "Món ăn, thức uống thường ngày" },
  "di-lai": { "label": "Xe cộ & đi lại", "description": "Phương tiện và đồ đi đường" },
  "tuoi-tho": { "label": "Tuổi thơ & hoài niệm", "description": "Đồ vật gắn với tuổi thơ" },
  "trang-phuc": { "label": "Thời trang & trang phục", "description": "Quần áo, giày dép, phụ kiện" },
  "di-san": { "label": "Di sản & kiến trúc", "description": "Công trình, di tích, cổ vật" },
  "nghe-thuat-dan-gian": { "label": "Nghệ thuật dân gian", "description": "Tranh, múa, âm nhạc dân gian" },
  "khac": { "label": "Khác", "description": "Chưa thuộc nhóm nào" }
}
```
And in `messages/en.json`:
```json
"Categories": {
  "do-gia-dung": { "label": "Household", "description": "Home & kitchen items" },
  "am-thuc": { "label": "Food & drink", "description": "Everyday food and drinks" },
  "di-lai": { "label": "Getting around", "description": "Vehicles & travel gear" },
  "tuoi-tho": { "label": "Childhood & nostalgia", "description": "Objects from childhood" },
  "trang-phuc": { "label": "Fashion & dress", "description": "Clothes, shoes, accessories" },
  "di-san": { "label": "Heritage & architecture", "description": "Monuments, relics, antiquities" },
  "nghe-thuat-dan-gian": { "label": "Folk art", "description": "Folk painting, dance, music" },
  "khac": { "label": "Other", "description": "Not in a topic yet" }
}
```

- [ ] **Step 3: Verify logic + parity**
```bash
npx tsx -e '
import { matchesCategory, categoryOf, coerceCategory } from "./lib/categories.ts";
import assert from "node:assert";
const stored = { object_name: "X", content: { title: "X", hashtags: [] }, category: "am-thuc" };
const oldPost = { object_name: "Phích nước", content: { title: "Phích nước", hashtags: [] }, category: null };
const khac = { object_name: "Zzz", content: { title: "Zzz", hashtags: [] }, category: "khac" };
assert.equal(matchesCategory(stored, "am-thuc"), true);
assert.equal(matchesCategory(stored, "di-san"), false);
assert.equal(matchesCategory(oldPost, "do-gia-dung"), true);   // keyword fallback
assert.equal(matchesCategory(khac, "do-gia-dung"), false);     // khac matches no browse slug
assert.equal(categoryOf(stored), "am-thuc");
assert.equal(categoryOf(oldPost), "do-gia-dung");
assert.equal(categoryOf(khac), undefined);                     // khac → keyword (none) → undefined
assert.equal(coerceCategory("am-thuc"), "am-thuc");
assert.equal(coerceCategory("nope"), "khac");
assert.equal(coerceCategory(undefined), "khac");
console.log("categories OK");
'
node -e 'const v=require("./messages/vi.json").Categories,e=require("./messages/en.json").Categories;const a=Object.keys(v).sort(),b=Object.keys(e).sort();console.log("parity",JSON.stringify(a)===JSON.stringify(b),a.length)'
```
Expected: `categories OK` and `parity true 8`. Then `npx tsc --noEmit` → exit 0.

- [ ] **Step 4: Commit**
```bash
git add lib/categories.ts messages/vi.json messages/en.json
git commit -m "feat: 8-topic taxonomy + matchesCategory/categoryOf + i18n"
```

---

## Task 3: AI classification (generator + mock)

**Files:** modify `lib/openai-exhibition.ts`, `lib/mock-exhibition.ts`.

- [ ] **Step 1: `lib/openai-exhibition.ts` imports** — add: `import { CATEGORY_SLUGS, coerceCategory } from "./categories";`

- [ ] **Step 2: Schema** — in `RESPONSE_SCHEMA`, add `"category"` to the `required` array (append after `"hashtags"`), and add to `properties`:
```ts
    category: { type: "string", enum: [...CATEGORY_SLUGS] },
```
If `as const` produces a readonly/type error on the dynamic enum, change that one line to `category: { type: "string", enum: CATEGORY_SLUGS as unknown as string[] }`. (`IMAGE_RESPONSE_SCHEMA` spreads `RESPONSE_SCHEMA`, so it inherits the field — no separate change.)

- [ ] **Step 3: Prompt** — append this block to BOTH `buildUserPrompt` and `buildImageUserPrompt` (inside the template string, before the closing backtick, after the existing constraints):
```
- category: phân loại VẬT vào ĐÚNG MỘT chủ đề sau (trả slug):
  do-gia-dung (đồ gia dụng: phích, nồi cơm, quạt, ghế…), am-thuc (ẩm thực & đồ uống),
  di-lai (xe cộ & đi lại: xe máy, mũ bảo hiểm…), tuoi-tho (tuổi thơ & hoài niệm: bút bi, đồ chơi…),
  trang-phuc (thời trang & trang phục: dép, áo dài, nón…), di-san (di sản & kiến trúc: chùa, đình, di tích…),
  nghe-thuat-dan-gian (nghệ thuật dân gian: tranh Đông Hồ, múa rối…). Dùng "khac" nếu không hợp nhóm nào.
```

- [ ] **Step 4: Extract + attach** — in `generateExhibitionWithLLM`, after `const content = validateContent(parsed);`, add:
```ts
  const category = coerceCategory((parsed as Record<string, unknown>).category);
```
and add `category,` to the returned object (e.g. right after `language,`).

- [ ] **Step 5: `lib/mock-exhibition.ts`** — `import { primaryCategory } from "./categories";` and in the object returned by `generateMockExhibition`, add (after `...template,`):
```ts
    category: primaryCategory({ object_name: name, content: template })?.slug ?? "khac",
```

- [ ] **Step 6: Build check** — `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"` → `✓ Compiled successfully`.

- [ ] **Step 7: Commit**
```bash
git add lib/openai-exhibition.ts lib/mock-exhibition.ts
git commit -m "feat: AI classifies posts into a content topic (category enum)"
```

---

## Task 4: CategorySelector + create flow

**Files:** create `components/CategorySelector.tsx`; modify `app/create/page.tsx`, `messages/vi.json`, `messages/en.json`.

- [ ] **Step 1: `components/CategorySelector.tsx`**
```tsx
"use client";

import { useTranslations } from "next-intl";
import {
  Armchair,
  UtensilsCrossed,
  Bike,
  ToyBrick,
  Shirt,
  Landmark,
  Drama,
  Shapes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/categories";

const ICONS: Record<Category["icon"], LucideIcon> = {
  Armchair,
  UtensilsCrossed,
  Bike,
  ToyBrick,
  Shirt,
  Landmark,
  Drama,
  Shapes,
};

interface Props {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

/** Chip selector for a post's content topic. Includes the "Khác" catch-all. */
export default function CategorySelector({ value, onChange, disabled }: Props) {
  const t = useTranslations("Categories");
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const Icon = ICONS[c.icon];
        const selected = c.slug === value;
        return (
          <button
            key={c.slug}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(c.slug)}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-60",
              selected
                ? "border-accent bg-accent/5 text-accent ring-1 ring-accent/30"
                : "border-border-strong text-ink-soft hover:border-accent/50 hover:text-ink",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {t(`${c.slug}.label`)}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create i18n** — add to the `Create` namespace in `messages/vi.json`: `"sectionCategory": "Chủ đề", "categoryHint": "AI đề xuất — bạn có thể đổi"`; and in `messages/en.json`: `"sectionCategory": "Topic", "categoryHint": "AI suggested — you can change it"`. (Confirm the create page's section labels use `useTranslations("Create")` — they do: `t("sectionStyle")`.)

- [ ] **Step 3: Wire into `app/create/page.tsx`** — import the component (`import CategorySelector from "@/components/CategorySelector";`) and render a Topic section as the FIRST block inside the result's non-editing `<div className="space-y-8">`, immediately BEFORE the existing Style section (`<div className="flex flex-col gap-2"><span className="eyebrow text-ink">{t("sectionStyle")}</span><ThemePicker ...>`):
```tsx
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="eyebrow text-ink">{t("sectionCategory")}</span>
                  <span className="text-xs text-ink-faint">{t("categoryHint")}</span>
                </div>
                <CategorySelector
                  value={exhibition.category ?? "khac"}
                  onChange={(cat) => {
                    const updated = { ...exhibition, category: cat };
                    setExhibition(updated);
                    updateExhibition(updated);
                  }}
                />
              </div>
```
This mirrors the ThemePicker pattern (`setExhibition` + `updateExhibition` to persist to the local gallery). Since `exhibition.category` flows into `exhibitionToPostInsert`, publishing stores it. The value is prefilled by the AI's suggestion (or `khac`).

- [ ] **Step 4: Build check + parity**
```bash
npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"
node -e 'const c=require("./messages/vi.json").Create,e=require("./messages/en.json").Create;const a=Object.keys(c).sort(),b=Object.keys(e).sort();console.log("Create parity",JSON.stringify(a)===JSON.stringify(b))'
```
Expected: `✓ Compiled successfully` and `Create parity true`.

- [ ] **Step 5: Commit**
```bash
git add components/CategorySelector.tsx app/create/page.tsx messages/vi.json messages/en.json
git commit -m "feat: topic selector in create flow (AI-suggested, overridable)"
```

---

## Task 5: Browse + filter wiring

**Files:** modify `components/home/CategoryGrid.tsx`, `app/kham-pha/page.tsx`, `app/page.tsx`.

- [ ] **Step 1: `components/home/CategoryGrid.tsx`** — show featured on home, all browse topics when `bare`.
  - Change the categories import to: `import { BROWSE_CATEGORIES, FEATURED_SLUGS } from "@/lib/categories";` (drop the old `CATEGORIES` import; keep the `Category` type import).
  - Expand the `ICONS` record to all 8 icons (import `Armchair, UtensilsCrossed, Bike, ToyBrick, Shirt, Landmark, Drama, Shapes` from lucide-react; map each `Category["icon"]` name to its component).
  - Replace `{CATEGORIES.map((c) => {` with a computed list:
    ```tsx
    const list = bare
      ? BROWSE_CATEGORIES
      : BROWSE_CATEGORIES.filter((c) => FEATURED_SLUGS.includes(c.slug));
    ```
    and iterate `{list.map((c) => {`. Everything else (links to `/kham-pha?chu-de=${c.slug}`, `landingImage(c.slug)`, labels via `tCat`) stays. New slugs without a landing image fall back to the existing teal gradient + icon automatically.

- [ ] **Step 2: `app/kham-pha/page.tsx`** — filter by stored category OR keyword.
  - Change the import `import { getCategory, filterByCategory } from "@/lib/categories";` → `import { getCategory, matchesCategory } from "@/lib/categories";`
  - Replace `if (topic) posts = filterByCategory(posts, topic);` with `if (topic) posts = posts.filter((p) => matchesCategory(p, topic));`
  - (The `select("*")` already returns `category`; `rowToPost` now maps it.)

- [ ] **Step 3: `app/page.tsx`** — tag the featured card via `categoryOf`.
  - Change the import `import { primaryCategory } from "@/lib/categories";` → `import { categoryOf } from "@/lib/categories";`
  - In the `featured` builder, replace:
    ```ts
    const cat = primaryCategory(featuredPost);
    ...
    categoryLabel: cat ? tCat(`${cat.slug}.label`) : null,
    ```
    with:
    ```ts
    const catSlug = categoryOf(featuredPost);
    ...
    categoryLabel: catSlug ? tCat(`${catSlug}.label`) : null,
    ```

- [ ] **Step 4: Build check** — `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error\|chu-de\|kham-pha"` → `✓ Compiled successfully`, routes present.

- [ ] **Step 5: Commit**
```bash
git add components/home/CategoryGrid.tsx app/kham-pha/page.tsx app/page.tsx
git commit -m "feat: browse by stored topic (home featured + /chu-de all + keyword fallback)"
```

---

## Task 6: Verify + merge

- [ ] **Step 1: Full gates**
```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
node -e 'const keys=o=>{const s=new Set();(function w(x,p=""){for(const k in x){const kk=p?p+"."+k:k;s.add(kk);if(x[k]&&typeof x[k]==="object")w(x[k],kk)}})(o);return s};const v=keys(require("./messages/vi.json")),e=keys(require("./messages/en.json"));const ov=[...v].filter(k=>!e.has(k)),oe=[...e].filter(k=>!v.has(k));console.log("parity",ov.length===0&&oe.length===0,"onlyVi",ov,"onlyEn",oe)'
```
Expected: `✓ Compiled successfully`; `parity true`.

- [ ] **Step 2: Manual QA** — requires running migration `0005` on a configured Supabase, then `npm run dev`:
  - Create a post (e.g. "Phích nước") → the Topic chips show with an AI-selected chip highlighted → change it → publish.
  - `/chu-de` shows 7 topic cards; the home grid shows 4 (Đồ gia dụng, Ẩm thực, Tuổi thơ, Di sản & kiến trúc).
  - `/kham-pha?chu-de=do-gia-dung` lists the new post; an OLD post matching a keyword still appears under its topic; a `khac` post does not appear in any topic grid but shows in the feed.
  - If Supabase isn't available locally, rely on the build + Task 2/3 assertions; note which path was used.

- [ ] **Step 3: Merge + push**
```bash
git checkout main
git merge --ff-only feat/post-category
git branch -d feat/post-category
git push origin main
```

---

## Self-review notes (addressed)

- **Spec coverage:** migration + column wiring (T1) ✓; 8-slug taxonomy + `matchesCategory`/`categoryOf`/`coerceCategory` + i18n (T2) ✓; AI enum + prompt + mock (T3) ✓; CategorySelector + create wiring, AI-suggested/overridable (T4) ✓; browse featured/all + keyword fallback filter + featured tag (T5) ✓; verification incl. assertions + parity + migration note (T6) ✓.
- **Type/name consistency:** `category` field added to `Exhibition`/`Post` (T1) and read by `exhibitionToPostInsert`/`rowToPost`/`postToExhibition` (T1), `coerceCategory` (T2→T3), `matchesCategory` (T2→T5 kham-pha), `categoryOf` (T2→T5 page), `CATEGORY_SLUGS` (T2→T3 enum), `BROWSE_CATEGORIES`/`FEATURED_SLUGS` (T2→T5 grid). `ExhibitionContent` omits `category` so it never lands in the content jsonb (T1).
- **No silent gaps:** `filterByCategory` removed in T2 and its sole caller updated in T5 (kham-pha). `khac` excluded from browse but included in the AI enum + selector.
- **Flagged for the implementer (concrete fallbacks, not placeholders):** the `as const` enum cast in T3 Step 2; confirm `Create` namespace usage in T4 Step 2 (verified: `t("sectionStyle")`).
- **Migration ordering:** T6 manual QA + the plan header both state `0005` must be run before deploy.
