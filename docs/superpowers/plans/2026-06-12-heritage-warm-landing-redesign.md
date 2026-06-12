# Heritage Warm Landing Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the public web into a Heritage-Warm marketing landing with a top-nav shell and rich footer; move the community feed to `/kham-pha`; add `/chu-de` (topic buckets) and `/gioi-thieu` (about) pages.

**Architecture:** Next.js App Router (Next 16, Turbopack). `app/page.tsx` becomes a server component that fetches featured + recent posts from Supabase and composes presentational section components (client components using `useTranslations`). The old feed body moves verbatim-but-restyled to `app/kham-pha/page.tsx`. Topic categories are keyword buckets in `lib/categories.ts` (no DB migration); labels live in i18n for vi/en parity. Decoration is inline SVG. A shared `SiteFooter` mounts on every page.

**Tech Stack:** Next.js 16, React 19 (ref-as-prop, no forwardRef), TypeScript, Tailwind v4 (`--color-*` tokens), next-intl v4 (cookie locale, `useTranslations`/`getTranslations`), Supabase (`@supabase/ssr`), lucide-react. **No test runner** — verify with `node` assertions for pure logic, `npx tsc --noEmit`, `npm run build`, and a vi/en key-parity `node` check.

**Reference:** Spec at `docs/superpowers/specs/2026-06-12-heritage-warm-landing-redesign-design.md`. Palette/tokens already shipped (`app/globals.css`, `UI_GUIDELINES.md`).

**Conventions to follow:**
- Reference files as real paths. Palette tokens: `bg-paper`, `bg-paper-card`, `bg-paper-sunk`, `text-ink`, `text-ink-soft`, `text-ink-faint`, `text-accent`/`bg-accent`, `accent-deep`, `text-gold`, `text-teal`, `border-border`, `border-border-strong`. Serif via `font-serif`. The `.eyebrow` utility = small uppercase label (already in globals).
- Every new user-facing string goes through next-intl with BOTH `messages/vi.json` and `messages/en.json` updated (parity required).
- Commit after each task. Work on a branch `feat/heritage-warm-landing`.

---

## Task 0: Branch

- [ ] **Step 1: Create the feature branch**

Run:
```bash
git checkout -b feat/heritage-warm-landing
```
Expected: `Switched to a new branch 'feat/heritage-warm-landing'`

---

## Task 1: Topic categories (`lib/categories.ts`) + i18n labels

**Files:**
- Create: `lib/categories.ts`
- Modify: `messages/vi.json`, `messages/en.json` (add `Categories` namespace)

The bucket taxonomy is pure data + matching logic — no DB. Labels/descriptions live in i18n (keyed by slug) so categories.ts stays locale-free.

- [ ] **Step 1: Write `lib/categories.ts`**

```ts
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
```

- [ ] **Step 2: Add the `Categories` i18n namespace**

In `messages/vi.json`, add a top-level `"Categories"` object (place it alphabetically near other namespaces):
```json
"Categories": {
  "kien-truc": { "label": "Kiến trúc", "desc": "Đình, chùa, thành quách" },
  "di-san": { "label": "Di sản", "desc": "Di sản vật thể & phi vật thể" },
  "trang-phuc": { "label": "Trang phục", "desc": "Trang phục truyền thống" },
  "nghe-thuat-dan-gian": { "label": "Nghệ thuật dân gian", "desc": "Tranh, múa, âm nhạc dân gian" }
}
```
In `messages/en.json`, add the matching keys:
```json
"Categories": {
  "kien-truc": { "label": "Architecture", "desc": "Communal houses, temples, citadels" },
  "di-san": { "label": "Heritage", "desc": "Tangible & intangible heritage" },
  "trang-phuc": { "label": "Costume", "desc": "Traditional attire" },
  "nghe-thuat-dan-gian": { "label": "Folk art", "desc": "Painting, dance, folk music" }
}
```

- [ ] **Step 3: Verify the matching logic with a node assertion**

Run:
```bash
node --input-type=module -e '
import { primaryCategory, filterByCategory, matchCategory } from "./lib/categories.ts";
const mk = (object_name, hashtags=[]) => ({ object_name, content: { title: object_name, hashtags } });
const drum = mk("Trống đồng Đông Sơn", ["#disan"]);
const aodai = mk("Áo dài Việt Nam");
const chua = mk("Chùa Một Cột");
import assert from "node:assert";
assert.equal(primaryCategory(aodai)?.slug, "trang-phuc");
assert.equal(primaryCategory(chua)?.slug, "kien-truc");
assert.equal(matchCategory(drum, "nghe-thuat-dan-gian") || matchCategory(drum, "di-san"), true);
assert.equal(filterByCategory([aodai, chua], "trang-phuc").length, 1);
console.log("categories OK");
'
```
Expected: `categories OK` (Next 16 ships a TS-capable node loader; if `.ts` import fails in your node, temporarily compile with `npx tsx` — `npx tsx -e "...same body..."`). 

> Note: if neither works in the environment, skip this step and rely on the build + a unit check inside `/chu-de` rendering. Do NOT leave a broken command in history.

- [ ] **Step 4: Commit**

```bash
git add lib/categories.ts messages/vi.json messages/en.json
git commit -m "feat: topic category buckets (no migration) + i18n labels"
```

---

## Task 2: Decorative primitives (`components/decor/`)

**Files:**
- Create: `components/decor/SectionTitle.tsx`
- Create: `components/decor/DongSonWatermark.tsx`
- Create: `components/decor/LotusMotif.tsx`

Presentational, server-safe (no hooks). Inline SVG via `currentColor`, `aria-hidden`, `pointer-events-none`.

- [ ] **Step 1: `components/decor/SectionTitle.tsx`**

```tsx
import Link from "next/link";

/**
 * Serif section heading with a gold gradient rule and an optional "see all"
 * link. `center` renders the rule on both sides (used by "Cách hoạt động").
 */
export default function SectionTitle({
  children,
  allHref,
  allLabel,
  center = false,
}: {
  children: React.ReactNode;
  allHref?: string;
  allLabel?: string;
  center?: boolean;
}) {
  const rule = (
    <span
      aria-hidden
      className="h-px flex-1 bg-gradient-to-r from-gold/45 to-transparent"
    />
  );
  return (
    <div className="mb-6 flex items-center gap-4">
      {center && <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-gold/45 to-transparent" />}
      <h2 className="font-serif text-2xl font-medium text-ink sm:text-[1.7rem]">
        {children}
      </h2>
      {rule}
      {allHref && (
        <Link href={allHref} className="shrink-0 text-sm text-accent transition-colors hover:text-accent-deep">
          {allLabel} →
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `components/decor/DongSonWatermark.tsx`**

```tsx
/**
 * Faint Đông Sơn drum medallion — concentric rings + a central star — used as a
 * background watermark. Decorative only. Colour via currentColor (set text-gold
 * + an opacity on the wrapper).
 */
export default function DongSonWatermark({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={`pointer-events-none ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="58" />
      <circle cx="100" cy="100" r="34" />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 34;
        const y = 100 + Math.sin(a) * 34;
        return <line key={i} x1="100" y1="100" x2={x} y2={y} />;
      })}
      {/* central 14-point star */}
      <circle cx="100" cy="100" r="10" />
    </svg>
  );
}
```

- [ ] **Step 3: `components/decor/LotusMotif.tsx`**

```tsx
/**
 * Simple lotus silhouette for hero/footer decoration. Decorative only.
 */
export default function LotusMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 48"
      className={`pointer-events-none ${className ?? ""}`}
      fill="currentColor"
    >
      <path d="M32 44c-10 0-20-6-20-16 6 0 11 3 14 7-2-7 1-15 6-23 5 8 8 16 6 23 3-4 8-7 14-7 0 10-10 16-20 16z" opacity="0.5" />
      <path d="M32 44c-5 0-10-5-10-14 5 1 9 6 10 13 1-7 5-12 10-13 0 9-5 14-10 14z" />
    </svg>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: exit 0 (no output).

- [ ] **Step 5: Commit**

```bash
git add components/decor
git commit -m "feat: decorative primitives (section title, drum watermark, lotus)"
```

---

## Task 3: Global footer (`SiteFooter`) + mount + i18n

**Files:**
- Create: `components/SiteFooter.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (add `Footer` namespace)
- Modify: `app/page.tsx` and every page that should show it — but to DRY, mount once via `app/layout.tsx` if it wraps a single body slot. Check `app/layout.tsx` first; if pages render their own `<main>` without a shared wrapper, mounting in `layout.tsx` after `{children}` is correct.

- [ ] **Step 1: Inspect the layout to decide mount point**

Run: `sed -n '1,80p' app/layout.tsx`
Expected: find where `{children}` is rendered. The footer mounts immediately after `{children}` inside the same body wrapper so it appears on all routes.

- [ ] **Step 2: Add the `Footer` i18n namespace**

`messages/vi.json`:
```json
"Footer": {
  "blurb": "Giữ gìn và lan toả giá trị văn hoá Việt.",
  "explore": "Khám phá",
  "explorePosts": "Bài viết",
  "exploreTopics": "Chủ đề",
  "exploreCollections": "Bộ sưu tập",
  "support": "Hỗ trợ",
  "supportFaq": "Câu hỏi thường gặp",
  "supportGuide": "Hướng dẫn sử dụng",
  "supportContact": "Liên hệ",
  "about": "Về chúng tôi",
  "aboutIntro": "Giới thiệu",
  "aboutTerms": "Điều khoản sử dụng",
  "aboutPrivacy": "Chính sách bảo mật",
  "rights": "© 2026 One-Minute Museum.",
  "slogan": "Nhanh gọn • Văn hoá • Truyền cảm hứng"
}
```
`messages/en.json`:
```json
"Footer": {
  "blurb": "Preserving and sharing Vietnamese culture.",
  "explore": "Explore",
  "explorePosts": "Posts",
  "exploreTopics": "Topics",
  "exploreCollections": "Collections",
  "support": "Support",
  "supportFaq": "FAQ",
  "supportGuide": "User guide",
  "supportContact": "Contact",
  "about": "About",
  "aboutIntro": "About us",
  "aboutTerms": "Terms of use",
  "aboutPrivacy": "Privacy policy",
  "rights": "© 2026 One-Minute Museum.",
  "slogan": "Quick • Cultural • Inspiring"
}
```

- [ ] **Step 3: `components/SiteFooter.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Youtube } from "lucide-react";
import Logo from "./Logo";
import LotusMotif from "./decor/LotusMotif";

/**
 * Global footer: brand block + three link columns over a faint lotus watermark,
 * closed by a red copyright band with the slogan. Links to not-yet-built pages
 * point at the nearest existing route or "#" placeholders (FAQ/guide/terms).
 */
export default function SiteFooter() {
  const t = useTranslations("Footer");
  const col = (heading: string, links: { label: string; href: string }[]) => (
    <div>
      <h3 className="eyebrow mb-3 text-ink">{heading}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-ink-soft transition-colors hover:text-accent">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border bg-paper-card">
      <LotusMotif className="absolute -right-6 bottom-6 w-40 text-gold/10" />
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-[1.2rem]" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-faint">{t("blurb")}</p>
          <div className="mt-4 flex gap-2.5 text-ink-soft">
            <Facebook className="h-5 w-5" strokeWidth={1.6} />
            <Instagram className="h-5 w-5" strokeWidth={1.6} />
            <Youtube className="h-5 w-5" strokeWidth={1.6} />
          </div>
        </div>
        {col(t("explore"), [
          { label: t("explorePosts"), href: "/kham-pha" },
          { label: t("exploreTopics"), href: "/chu-de" },
          { label: t("exploreCollections"), href: "/chu-de" },
        ])}
        {col(t("support"), [
          { label: t("supportFaq"), href: "/gioi-thieu" },
          { label: t("supportGuide"), href: "/gioi-thieu" },
          { label: t("supportContact"), href: "/gioi-thieu" },
        ])}
        {col(t("about"), [
          { label: t("aboutIntro"), href: "/gioi-thieu" },
          { label: t("aboutTerms"), href: "/gioi-thieu" },
          { label: t("aboutPrivacy"), href: "/gioi-thieu" },
        ])}
      </div>
      <div className="bg-accent py-2.5 text-center text-xs text-paper-card/90">
        {t("rights")} {t("slogan")}
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Mount `SiteFooter` in `app/layout.tsx`** immediately after `{children}` (exact edit depends on Step 1; add the import `import SiteFooter from "@/components/SiteFooter";` and render `<SiteFooter />` after `{children}`).

- [ ] **Step 5: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
git add components/SiteFooter.tsx app/layout.tsx messages/vi.json messages/en.json
git commit -m "feat: global Heritage Warm footer"
```

---

## Task 4: Top-nav header rewrite (`SiteHeader`) + i18n

**Files:**
- Modify (rewrite): `components/SiteHeader.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (add `Nav` keys; `Menu`/`Brand` already exist)

Adds primary nav links, a search box, a "Bộ sưu tập → Sắp ra mắt" placeholder, and a mobile hamburger drawer. The auth control stays as the existing `AccountMenu` (already shows sign-in when logged-out, avatar menu when logged-in).

- [ ] **Step 1: Add `Nav` i18n keys**

`messages/vi.json`:
```json
"Nav": {
  "explore": "Khám phá",
  "collections": "Bộ sưu tập",
  "topics": "Chủ đề",
  "about": "Giới thiệu",
  "comingSoon": "Sắp ra mắt",
  "search": "Tìm kiếm",
  "searchPlaceholder": "Tìm hiện vật, di sản…",
  "openMenu": "Mở menu",
  "closeMenu": "Đóng menu"
}
```
> If `messages/vi.json` already has a `Nav` namespace (it has `createCta`), MERGE these keys into it rather than creating a duplicate. Do the same merge in `en.json` with English values: "Explore", "Collections", "Topics", "About", "Coming soon", "Search", "Search objects, heritage…", "Open menu", "Close menu".

- [ ] **Step 2: Rewrite `components/SiteHeader.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Menu as MenuIcon, X } from "lucide-react";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";

/**
 * Top-nav app shell: brand (left), primary nav + search + account control
 * (right). Mobile collapses the nav into a slide-down drawer. Sticky, blurred.
 */
export default function SiteHeader() {
  const t = useTranslations("Nav");
  const tBrand = useTranslations("Brand");
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");

  const links = [
    { href: "/kham-pha", label: t("explore") },
    { href: "/chu-de", label: t("topics") },
    { href: "/gioi-thieu", label: t("about") },
  ];

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/kham-pha?q=${encodeURIComponent(term)}`);
    setDrawer(false);
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`text-sm transition-colors ${active ? "font-semibold text-accent" : "text-ink hover:text-accent"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label={tBrand("name")} className="shrink-0 transition-opacity hover:opacity-80">
          <Logo tagline={tBrand("tagline")} className="text-[1.3rem]" />
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-5 lg:flex">
          {navLink("/kham-pha", t("explore"))}
          {/* Collections: deferred → non-link placeholder */}
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-faint" title={t("comingSoon")}>
            {t("collections")}
            <span className="rounded-full bg-paper-sunk px-1.5 py-0.5 text-[10px] text-ink-faint">{t("comingSoon")}</span>
          </span>
          {navLink("/chu-de", t("topics"))}
          {navLink("/gioi-thieu", t("about"))}
        </nav>

        <div className="flex-1" />

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="hidden items-center md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border-strong bg-paper-card/60 px-3 py-1.5">
            <Search className="h-4 w-4 text-ink-faint" strokeWidth={2} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("search")}
              className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </form>

        <AccountMenu />

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setDrawer((v) => !v)}
          aria-label={drawer ? t("closeMenu") : t("openMenu")}
          className="text-ink lg:hidden"
        >
          {drawer ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="border-t border-border bg-paper-card px-5 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-full border border-border-strong bg-paper px-3 py-2">
            <Search className="h-4 w-4 text-ink-faint" strokeWidth={2} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("search")}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </form>
          <nav className="flex flex-col gap-3" onClick={() => setDrawer(false)}>
            {links.map((l) => navLink(l.href, l.label))}
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-faint">
              {t("collections")}
              <span className="rounded-full bg-paper-sunk px-1.5 py-0.5 text-[10px]">{t("comingSoon")}</span>
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add components/SiteHeader.tsx messages/vi.json messages/en.json
git commit -m "feat: top-nav header with search + mobile drawer"
```

---

## Task 5: Move the feed to `/kham-pha` (with mode / chu-de / q filters)

**Files:**
- Create: `app/kham-pha/page.tsx` (the relocated + restyled feed, extended with `chu-de` and `q` filters)
- Keep: `components/StoriesTray.tsx`, `FeedPost.tsx`, `FeedLoadMore.tsx` (reused as-is)
- Modify: `messages/vi.json`, `messages/en.json` (add `Explore` keys for the filter header)

The current `app/page.tsx` body is the source of truth — copy its data-fetching + feed rendering here, then add `?chu-de=` (JS keyword filter over latest posts, no pagination) and `?q=` (ilike on `object_name`). `app/page.tsx` itself is rewritten in Task 9.

- [ ] **Step 1: Add `Explore` i18n keys**

`messages/vi.json`:
```json
"Explore": {
  "title": "Khám phá",
  "subtitle": "Những câu chuyện văn hoá từ cộng đồng.",
  "topicHeading": "Chủ đề: {name}",
  "searchHeading": "Kết quả cho “{q}”",
  "clear": "Xoá lọc",
  "emptyTopic": "Chưa có bài nào cho chủ đề này.",
  "emptySearch": "Không tìm thấy bài nào khớp."
}
```
`messages/en.json`:
```json
"Explore": {
  "title": "Explore",
  "subtitle": "Cultural stories from the community.",
  "topicHeading": "Topic: {name}",
  "searchHeading": "Results for “{q}”",
  "clear": "Clear filter",
  "emptyTopic": "No posts in this topic yet.",
  "emptySearch": "No posts match your search."
}
```

- [ ] **Step 2: Create `app/kham-pha/page.tsx`**

```tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { MODES } from "@/lib/types";
import type { Mode, Post } from "@/lib/types";
import { CATEGORIES, getCategory, filterByCategory } from "@/lib/categories";
import SiteHeader from "@/components/SiteHeader";
import StoriesTray from "@/components/StoriesTray";
import FeedPost from "@/components/FeedPost";
import FeedLoadMore from "@/components/FeedLoadMore";
import SectionTitle from "@/components/decor/SectionTitle";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; "chu-de"?: string; q?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const t = await getTranslations("Explore");
  const tModes = await getTranslations("Modes");
  const tCat = await getTranslations("Categories");

  const sp = await searchParams;
  const mode = MODES.includes(sp.mode as Mode) ? (sp.mode as Mode) : null;
  const topic = sp["chu-de"] && getCategory(sp["chu-de"]) ? sp["chu-de"]! : null;
  const q = (sp.q ?? "").trim();
  const filtered = Boolean(topic || q); // topic/search disable pagination

  let posts: Post[] = [];
  let nextBefore: string | null = null;

  if (configured) {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)")
      .order("created_at", { ascending: false });

    if (q) query = query.ilike("object_name", `%${q}%`).limit(FEED_PAGE_SIZE);
    else if (topic) query = query.limit(60); // fetch a window, filter in JS
    else if (mode) query = query.eq("mode", mode).limit(FEED_PAGE_SIZE);
    else query = query.limit(FEED_PAGE_SIZE);

    const { data } = await query;
    posts = (data ?? []).map(rowToPost);
    if (topic) posts = filterByCategory(posts, topic);
    if (!filtered) {
      nextBefore = posts.length === FEED_PAGE_SIZE ? posts[posts.length - 1].created_at : null;
    }
  }

  const heading = topic
    ? t("topicHeading", { name: tCat(`${topic}.label`) })
    : q
      ? t("searchHeading", { q })
      : t("title");

  const emptyMsg = topic ? t("emptyTopic") : q ? t("emptySearch") : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-10 sm:px-8">
        <SectionTitle>{heading}</SectionTitle>

        {/* Lens chips only on the unfiltered/mode view */}
        {!filtered && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Chip href="/kham-pha" active={!mode}>{tModes("all") /* see note */}</Chip>
            {MODES.map((m) => (
              <Chip key={m} href={`/kham-pha?mode=${encodeURIComponent(m)}`} active={mode === m}>
                {tModes(`${m}.label`)}
              </Chip>
            ))}
          </div>
        )}

        {filtered && (
          <Link href="/kham-pha" className="mb-6 inline-block text-sm text-accent hover:text-accent-deep">
            ← {t("clear")}
          </Link>
        )}

        {posts.length === 0 ? (
          <p className="border border-dashed border-border-strong bg-paper-card/40 px-6 py-16 text-center font-serif text-lg text-ink-soft">
            {emptyMsg ?? t("subtitle")}
          </p>
        ) : (
          <div className="space-y-5">
            {!filtered && <StoriesTray posts={posts} />}
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
            {!filtered && <FeedLoadMore initialNextBefore={nextBefore} mode={mode ?? undefined} />}
          </div>
        )}
      </main>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-teal bg-teal/5 text-teal ring-1 ring-teal/30"
          : "border-border-strong text-ink-soft hover:border-teal/50 hover:text-ink",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
```

> **Note on `tModes("all")`:** the current home uses `t("allLenses")` from the `Feed` namespace for the "all" chip. Reuse that: import `getTranslations("Feed")` and use `tFeed("allLenses")` instead of `tModes("all")` to avoid inventing a key. Verify the existing key name in `messages/vi.json` (`Feed.allLenses`) before wiring.

- [ ] **Step 3: Verify `FeedLoadMore` targets the right route.** `FeedLoadMore` fetches more posts via an API (`/api/feed`) and renders them client-side; it does not navigate, so it works unchanged under `/kham-pha`. Confirm by reading `components/FeedLoadMore.tsx` — if it hardcodes a path, leave it (it calls the API, not the page).

- [ ] **Step 4: Build check + manual**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error\|/kham-pha"`
Expected: `✓ Compiled successfully` and `/kham-pha` listed in the route table.

- [ ] **Step 5: Commit**

```bash
git add app/kham-pha/page.tsx messages/vi.json messages/en.json
git commit -m "feat: /kham-pha explore feed with topic + search filters"
```

---

## Task 6: Home hero (`HomeHero`) + create-page image handoff + i18n

**Files:**
- Create: `components/home/HomeHero.tsx`
- Modify: `app/create/page.tsx:58-62` (read the handoff image)
- Modify: `messages/vi.json`, `messages/en.json` (add `Home` namespace, hero keys)

- [ ] **Step 1: Add `Home` hero i18n keys**

`messages/vi.json` (create the `Home` namespace; later tasks append to it):
```json
"Home": {
  "heroTitle1": "Biến mọi bức ảnh",
  "heroTitle2": "thành một câu chuyện",
  "heroTitle3": "văn hoá Việt.",
  "heroLead": "Tải ảnh lên, nhận ngay bài viết ngắn gọn và những điều thú vị về văn hoá Việt Nam chỉ trong khoảng 1 phút.",
  "heroDrop": "Kéo thả ảnh vào đây hoặc bấm để tải lên",
  "heroDropHint": "Hỗ trợ JPG, PNG · tối đa 10MB",
  "heroCreate": "Tạo bài viết",
  "heroExample": "Xem ví dụ",
  "heroPrivacy": "Ảnh của bạn được bảo mật và chỉ dùng để tạo nội dung."
}
```
`messages/en.json`:
```json
"Home": {
  "heroTitle1": "Turn any photo",
  "heroTitle2": "into a story of",
  "heroTitle3": "Vietnamese culture.",
  "heroLead": "Upload a photo and get a concise write-up plus fun facts about Vietnamese culture in about a minute.",
  "heroDrop": "Drag a photo here or click to upload",
  "heroDropHint": "JPG, PNG · up to 10MB",
  "heroCreate": "Create a post",
  "heroExample": "See an example",
  "heroPrivacy": "Your photo stays private and is only used to generate content."
}
```

- [ ] **Step 2: `components/home/HomeHero.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Upload, ImagePlus, BookOpen, ShieldCheck } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/image";
import DongSonWatermark from "@/components/decor/DongSonWatermark";
import LotusMotif from "@/components/decor/LotusMotif";

/** Session key the create page reads once to pre-load a dropped photo. */
export const PENDING_IMAGE_KEY = "omm-pending-image";

export default function HomeHero() {
  const t = useTranslations("Home");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      sessionStorage.setItem(PENDING_IMAGE_KEY, dataUrl);
      router.push("/create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_90%_at_85%_10%,var(--color-paper-sunk),var(--color-paper))] px-6 py-12 sm:px-10 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-[1.12] text-ink sm:text-5xl">
            {t("heroTitle1")}<br />
            <span className="text-accent">{t("heroTitle2")}</span><br />
            <span className="text-accent">{t("heroTitle3")}</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">{t("heroLead")}</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`mt-6 cursor-pointer rounded-2xl border border-dashed px-6 py-7 text-center transition-colors ${drag ? "border-accent bg-paper-card" : "border-border-strong bg-paper-card/60"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; handleFile(f); }}
            />
            <ImagePlus className="mx-auto mb-2 h-8 w-8 text-gold" strokeWidth={1.6} />
            <p className="text-sm text-ink-soft">{busy ? "…" : t("heroDrop")}</p>
            <p className="mt-1 text-xs text-ink-faint">{t("heroDropHint")}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper-card shadow-[0_1px_0_var(--color-accent-deep)] transition-colors hover:bg-accent-deep">
              <Upload className="h-4 w-4" strokeWidth={2} /> {t("heroCreate")}
            </Link>
            <Link href="/kham-pha" className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent">
              <BookOpen className="h-4 w-4" strokeWidth={2} /> {t("heroExample")}
            </Link>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-faint">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} /> {t("heroPrivacy")}
          </p>
        </div>

        {/* Decorative collage */}
        <div className="relative hidden min-h-[260px] lg:block" aria-hidden>
          <DongSonWatermark className="absolute right-4 top-2 w-64 text-gold/15" />
          <div className="absolute left-6 top-6 h-40 w-56 -rotate-6 rounded-xl border-4 border-paper-card bg-gradient-to-br from-[#b9763a] to-[#8a4f28] shadow-xl" />
          <div className="absolute bottom-6 right-10 h-32 w-32 rounded-full border-4 border-paper-card bg-[radial-gradient(circle,#caa24a,#7e5b23)] shadow-xl" />
          <LotusMotif className="absolute bottom-2 left-16 w-16 text-accent/70" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Read the handoff in the create page.** Modify the prefill effect at `app/create/page.tsx:58-62` to also consume the pending image:

```tsx
  // Prefill the object from a quick-start link (e.g. /create?object=Áo mưa),
  // and pick up a photo handed off from the home hero dropzone.
  useEffect(() => {
    const obj = new URLSearchParams(window.location.search).get("object");
    if (obj) setObjectName(obj);
    const pending = sessionStorage.getItem("omm-pending-image");
    if (pending) {
      setImage(pending);
      sessionStorage.removeItem("omm-pending-image");
    }
  }, []);
```

- [ ] **Step 4: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/home/HomeHero.tsx app/create/page.tsx messages/vi.json messages/en.json
git commit -m "feat: home hero with drag-drop handoff to /create"
```

---

## Task 7: `FeaturedStrip` + `HowItWorks` + i18n

**Files:**
- Create: `components/home/FeaturedStrip.tsx`
- Create: `components/home/HowItWorks.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (append to `Home`)

- [ ] **Step 1: Append `Home` i18n keys**

`messages/vi.json` (merge into `Home`):
```json
"featuredTitle": "Bài viết nổi bật",
"seeAll": "Xem tất cả",
"readTime": "1 phút đọc",
"save": "Lưu",
"funFact": "Fun fact",
"funFactFallback": "Trống đồng Đông Sơn được xem là biểu tượng của nền văn minh lúa nước hơn 2.000 năm trước.",
"howTitle": "Cách hoạt động",
"how1Title": "Tải ảnh lên",
"how1Desc": "Chọn hoặc kéo thả ảnh về một hiện vật, công trình hay di sản văn hoá Việt.",
"how2Title": "AI phân tích",
"how2Desc": "AI nhận diện và phân tích để hiểu rõ giá trị văn hoá của bức ảnh.",
"how3Title": "Nhận bài viết & fun fact",
"how3Desc": "Nhận ngay bài viết ngắn gọn kèm những điều thú vị, chỉ trong khoảng 1 phút.",
"featuredFallbackTitle": "Trống đồng Đông Sơn",
"featuredFallbackExcerpt": "Biểu tượng của nền văn minh lúa nước, với hoạ tiết tinh xảo kể chuyện về con người, thiên nhiên và tín ngưỡng cổ xưa."
```
`messages/en.json` (merge into `Home`):
```json
"featuredTitle": "Featured post",
"seeAll": "See all",
"readTime": "1 min read",
"save": "Save",
"funFact": "Fun fact",
"funFactFallback": "The Đông Sơn bronze drum is seen as a symbol of a wet-rice civilization over 2,000 years old.",
"howTitle": "How it works",
"how1Title": "Upload a photo",
"how1Desc": "Pick or drop a photo of a Vietnamese artifact, building, or heritage site.",
"how2Title": "AI analyzes it",
"how2Desc": "Our AI recognizes and analyzes the photo to surface its cultural value.",
"how3Title": "Get a post & fun fact",
"how3Desc": "Receive a concise write-up plus fun facts in about a minute.",
"featuredFallbackTitle": "Đông Sơn bronze drum",
"featuredFallbackExcerpt": "A symbol of wet-rice civilization, its fine motifs tell of people, nature, and ancient beliefs."
```

- [ ] **Step 2: `components/home/FeaturedStrip.tsx`** — receives a serializable `featured` prop (or null) prepared by the page.

```tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, Bookmark, Lightbulb } from "lucide-react";
import SectionTitle from "@/components/decor/SectionTitle";

export interface FeaturedData {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  categoryLabel: string | null;
  hashtags: string[];
  funFact: string | null;
}

export default function FeaturedStrip({ featured }: { featured: FeaturedData | null }) {
  const t = useTranslations("Home");

  const title = featured?.title ?? t("featuredFallbackTitle");
  const excerpt = featured?.excerpt ?? t("featuredFallbackExcerpt");
  const funFact = featured?.funFact ?? t("funFactFallback");
  const href = featured ? `/p/${featured.id}` : "/kham-pha";

  return (
    <section className="mt-14">
      <SectionTitle allHref="/kham-pha" allLabel={t("seeAll")}>{t("featuredTitle")}</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Link href={href} className="group grid overflow-hidden rounded-2xl border border-border bg-paper-card sm:grid-cols-[200px_1fr]">
          <div className="min-h-[150px] bg-gradient-to-br from-[#caa24a] to-[#7e5b23]">
            {featured?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-5">
            {featured?.categoryLabel && (
              <span className="mb-2 inline-block rounded-full border border-accent px-2.5 py-1 text-[10px] uppercase tracking-wide text-accent">
                {featured.categoryLabel}
              </span>
            )}
            <h3 className="font-serif text-xl text-ink transition-colors group-hover:text-accent">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{excerpt}</p>
            {featured && featured.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {featured.hashtags.slice(0, 3).map((h) => (
                  <span key={h} className="rounded-md bg-paper-sunk px-2 py-1 text-[11px] text-ink-soft">{h}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-ink-faint">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("readTime")}</span>
              <span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> {t("save")}</span>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-gold/40 bg-[#fbf3df] p-6">
          <div className="mb-3 inline-flex items-center gap-2 font-medium text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-paper-card">
              <Lightbulb className="h-4 w-4" />
            </span>
            {t("funFact")}
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">{funFact}</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `components/home/HowItWorks.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Upload, BrainCircuit, FileText } from "lucide-react";
import SectionTitle from "@/components/decor/SectionTitle";

export default function HowItWorks() {
  const t = useTranslations("Home");
  const steps = [
    { n: 1, Icon: Upload, title: t("how1Title"), desc: t("how1Desc") },
    { n: 2, Icon: BrainCircuit, title: t("how2Title"), desc: t("how2Desc") },
    { n: 3, Icon: FileText, title: t("how3Title"), desc: t("how3Desc") },
  ];
  return (
    <section className="mt-14">
      <SectionTitle center>{t("howTitle")}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map(({ n, Icon, title, desc }) => (
          <div key={n} className="flex gap-3 rounded-2xl border border-border bg-paper-card p-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-paper-card">{n}</span>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal" strokeWidth={2} />
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/home/FeaturedStrip.tsx components/home/HowItWorks.tsx messages/vi.json messages/en.json
git commit -m "feat: home featured strip + how-it-works"
```

---

## Task 8: `CategoryGrid` + `RecentPosts` + i18n

**Files:**
- Create: `components/home/CategoryGrid.tsx`
- Create: `components/home/RecentPosts.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (append to `Home`)

- [ ] **Step 1: Append `Home` i18n keys**

`messages/vi.json` (merge into `Home`):
```json
"categoriesTitle": "Khám phá theo chủ đề",
"recentTitle": "Bài viết mới",
"recentEmpty": "Chưa có bài viết nào — hãy là người đầu tiên!",
"recentEmptyCta": "Tạo bài viết"
```
`messages/en.json` (merge into `Home`):
```json
"categoriesTitle": "Explore by topic",
"recentTitle": "Latest posts",
"recentEmpty": "No posts yet — be the first!",
"recentEmptyCta": "Create a post"
```

- [ ] **Step 2: `components/home/CategoryGrid.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, Landmark, Shirt, Drama } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import SectionTitle from "@/components/decor/SectionTitle";

const ICONS: Record<string, LucideIcon> = { Building2, Landmark, Shirt, Drama };

export default function CategoryGrid() {
  const t = useTranslations("Home");
  const tCat = useTranslations("Categories");
  return (
    <section className="mt-14">
      <SectionTitle allHref="/chu-de" allLabel={t("seeAll")}>{t("categoriesTitle")}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon];
          return (
            <Link
              key={c.slug}
              href={`/kham-pha?chu-de=${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-paper-card transition-shadow hover:shadow-md"
            >
              <div className="relative flex h-28 items-end bg-gradient-to-br from-teal to-teal-deep">
                <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-paper-card">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-semibold text-ink transition-colors group-hover:text-accent">{tCat(`${c.slug}.label`)}</h3>
                <p className="mt-0.5 text-xs text-ink-faint">{tCat(`${c.slug}.desc`)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `components/home/RecentPosts.tsx`** — receives serializable `posts` prepared by the page.

```tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import SectionTitle from "@/components/decor/SectionTitle";

export interface RecentItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
}

export default function RecentPosts({ posts }: { posts: RecentItem[] }) {
  const t = useTranslations("Home");
  return (
    <section className="mt-14">
      <SectionTitle allHref="/kham-pha" allLabel={t("seeAll")}>{t("recentTitle")}</SectionTitle>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-paper-card/40 px-6 py-16 text-center">
          <p className="font-serif text-lg text-ink-soft">{t("recentEmpty")}</p>
          <Link href="/create" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card hover:bg-accent-deep">
            {t("recentEmptyCta")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p) => (
            <Link key={p.id} href={`/p/${p.id}`} className="group overflow-hidden rounded-2xl border border-border bg-paper-card">
              <div className="h-24 bg-gradient-to-br from-[#caa24a] to-[#7e5b23]">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-ink transition-colors group-hover:text-accent">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add components/home/CategoryGrid.tsx components/home/RecentPosts.tsx messages/vi.json messages/en.json
git commit -m "feat: home category grid + recent posts"
```

---

## Task 9: Compose the landing (`app/page.tsx` rewrite)

**Files:**
- Modify (rewrite): `app/page.tsx`

Server component: fetch posts once, derive `featured` (latest with image, else latest) + `recent` (next 4), map to the section prop shapes, render the sections.

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import type { Post } from "@/lib/types";
import { primaryCategory } from "@/lib/categories";
import SiteHeader from "@/components/SiteHeader";
import HomeHero from "@/components/home/HomeHero";
import FeaturedStrip, { type FeaturedData } from "@/components/home/FeaturedStrip";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecentPosts, { type RecentItem } from "@/components/home/RecentPosts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const tCat = await getTranslations("Categories");

  let posts: Post[] = [];
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(10);
    posts = (data ?? []).map(rowToPost);
  }

  // Featured = newest post with an image, else newest post.
  const featuredPost = posts.find((p) => p.image_url) ?? posts[0] ?? null;
  const recentPosts = posts.filter((p) => p.id !== featuredPost?.id).slice(0, 4);

  const featured: FeaturedData | null = featuredPost
    ? (() => {
        const cat = primaryCategory(featuredPost);
        return {
          id: featuredPost.id,
          title: featuredPost.content.title || featuredPost.object_name,
          excerpt: featuredPost.content.hook ?? "",
          imageUrl: featuredPost.image_url ?? null,
          categoryLabel: cat ? tCat(`${cat.slug}.label`) : null,
          hashtags: featuredPost.content.hashtags ?? [],
          funFact: featuredPost.content.three_fun_facts?.[0] ?? null,
        };
      })()
    : null;

  const recent: RecentItem[] = recentPosts.map((p) => ({
    id: p.id,
    title: p.content.title || p.object_name,
    excerpt: p.content.hook ?? "",
    imageUrl: p.image_url ?? null,
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] px-5 pb-10 pt-6 sm:px-8">
        <HomeHero />
        <FeaturedStrip featured={featured} />
        <HowItWorks />
        <CategoryGrid />
        <RecentPosts posts={recent} />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Build check + route table**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Manual smoke (dev)**

Run: `npm run dev` then open `http://localhost:3000/`. Verify: hero renders, dropzone opens file picker, all five sections present, footer at the bottom, nav links route to `/kham-pha`, `/chu-de`, `/gioi-thieu`. Stop dev when done.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose Heritage Warm landing home"
```

---

## Task 10: `/chu-de` topics index + i18n

**Files:**
- Create: `app/chu-de/page.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (add `Topics` namespace)

- [ ] **Step 1: Add `Topics` i18n keys**

`messages/vi.json`:
```json
"Topics": {
  "title": "Chủ đề",
  "intro": "Khám phá văn hoá Việt theo từng chủ đề — kiến trúc, di sản, trang phục và nghệ thuật dân gian."
}
```
`messages/en.json`:
```json
"Topics": {
  "title": "Topics",
  "intro": "Explore Vietnamese culture by topic — architecture, heritage, costume, and folk art."
}
```

- [ ] **Step 2: `app/chu-de/page.tsx`** (server component reusing the same card markup as `CategoryGrid` but full-width; since `CategoryGrid` is a client component with no props, render it directly).

```tsx
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SectionTitle from "@/components/decor/SectionTitle";
import CategoryGrid from "@/components/home/CategoryGrid";

export default async function TopicsPage() {
  const t = await getTranslations("Topics");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-10 sm:px-8">
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="mb-8 max-w-2xl text-ink-soft">{t("intro")}</p>
        <CategoryGrid />
      </main>
    </>
  );
}
```

> `CategoryGrid` already renders its own `SectionTitle` ("Khám phá theo chủ đề") + "see all". On `/chu-de` that inner title is redundant. Acceptable for MVP; if undesired, add an optional `bare?: boolean` prop to `CategoryGrid` that hides its `SectionTitle` and pass `bare` here. Decide during implementation — if adding the prop, update `CategoryGrid` and the home usage stays default (not bare).

- [ ] **Step 3: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error\|/chu-de"`
Expected: `✓ Compiled successfully` and `/chu-de` in the route table.

- [ ] **Step 4: Commit**

```bash
git add app/chu-de/page.tsx messages/vi.json messages/en.json
git commit -m "feat: /chu-de topics index"
```

---

## Task 11: `/gioi-thieu` about page + i18n

**Files:**
- Create: `app/gioi-thieu/page.tsx`
- Modify: `messages/vi.json`, `messages/en.json` (add `About` namespace)

- [ ] **Step 1: Add `About` i18n keys**

`messages/vi.json`:
```json
"About": {
  "title": "Giới thiệu",
  "lead": "One-Minute Museum biến mỗi bức ảnh đời thường thành một câu chuyện văn hoá Việt — nhanh gọn, thú vị và đáng nhớ.",
  "storyTitle": "Ôm trọn văn hoá Việt",
  "storyBody": "OMM đọc lên nghe như “Ôm” — một cái ôm dành cho di sản và đời sống Việt. Từ chiếc dép tổ ong đến trống đồng Đông Sơn, mỗi vật đều mang một câu chuyện đáng kể.",
  "missionTitle": "Sứ mệnh",
  "missionBody": "Giữ gìn và lan toả giá trị văn hoá Việt tới mọi người, bắt đầu từ những điều gần gũi nhất quanh ta.",
  "cta": "Tạo bài viết đầu tiên"
}
```
`messages/en.json`:
```json
"About": {
  "title": "About",
  "lead": "One-Minute Museum turns everyday photos into stories of Vietnamese culture — quick, fun, and memorable.",
  "storyTitle": "A hug for Vietnamese culture",
  "storyBody": "OMM sounds like “Ôm” (to hug) — an embrace for Vietnamese heritage and daily life. From a humble sandal to a Đông Sơn drum, every object has a story worth telling.",
  "missionTitle": "Mission",
  "missionBody": "Preserve and spread Vietnamese culture for everyone, starting with the things closest to us.",
  "cta": "Create your first post"
}
```

- [ ] **Step 2: `app/gioi-thieu/page.tsx`**

```tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import SectionTitle from "@/components/decor/SectionTitle";
import HowItWorks from "@/components/home/HowItWorks";
import DongSonWatermark from "@/components/decor/DongSonWatermark";

export default async function AboutPage() {
  const t = await getTranslations("About");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[900px] px-5 pb-24 pt-10 sm:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-paper-sunk px-6 py-12 sm:px-10">
          <DongSonWatermark className="absolute -right-8 -top-8 w-56 text-gold/15" />
          <h1 className="font-serif text-4xl font-medium text-ink">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{t("lead")}</p>
        </section>

        <section className="mt-12">
          <SectionTitle>{t("storyTitle")}</SectionTitle>
          <p className="max-w-2xl leading-relaxed text-ink-soft">{t("storyBody")}</p>
        </section>

        <HowItWorks />

        <section className="mt-12">
          <SectionTitle>{t("missionTitle")}</SectionTitle>
          <p className="max-w-2xl leading-relaxed text-ink-soft">{t("missionBody")}</p>
          <Link href="/create" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper-card hover:bg-accent-deep">
            {t("cta")}
          </Link>
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Build check**

Run: `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error\|/gioi-thieu"`
Expected: `✓ Compiled successfully` and `/gioi-thieu` in the route table.

- [ ] **Step 4: Commit**

```bash
git add app/gioi-thieu/page.tsx messages/vi.json messages/en.json
git commit -m "feat: /gioi-thieu about page"
```

---

## Task 12: i18n parity, full build, manual QA, merge

**Files:** none (verification + merge)

- [ ] **Step 1: Verify vi/en key parity**

Run:
```bash
node -e '
const c=o=>{let n=0;(function w(x){for(const k in x){n++;if(x[k]&&typeof x[k]==="object")w(x[k])}})(o);return n};
const vi=require("./messages/vi.json"), en=require("./messages/en.json");
const keys=o=>{const s=new Set();(function w(x,p=""){for(const k in x){const kk=p?p+"."+k:k;s.add(kk);if(x[k]&&typeof x[k]==="object")w(x[k],kk)}})(o);return s};
const kv=keys(vi),ke=keys(en);
const onlyVi=[...kv].filter(k=>!ke.has(k)), onlyEn=[...ke].filter(k=>!kv.has(k));
console.log("vi",c(vi),"en",c(en));
console.log("only in vi:",onlyVi); console.log("only in en:",onlyEn);
if(onlyVi.length||onlyEn.length) process.exit(1);
console.log("PARITY OK");
'
```
Expected: `PARITY OK` with empty "only in" arrays. Fix any mismatch before continuing.

- [ ] **Step 2: Full type + build gate**

Run: `npx tsc --noEmit && npm run build 2>&1 | tail -30`
Expected: `✓ Compiled successfully`; route table includes `/`, `/kham-pha`, `/chu-de`, `/gioi-thieu`.

- [ ] **Step 3: Manual QA checklist (dev)**

Run `npm run dev`, then verify:
- `/` — all five sections + footer; hero dropzone opens picker; dropping an image navigates to `/create` with the photo attached.
- Header nav routes correctly; "Bộ sưu tập" shows "Sắp ra mắt" and is non-clickable; search submits to `/kham-pha?q=…`.
- Mobile width (DevTools ~390px): hamburger opens drawer with links + search.
- `/kham-pha` — feed renders; lens chips filter; `?chu-de=trang-phuc` shows only matching posts with the topic heading + "Xoá lọc"; empty topic shows the empty message.
- `/chu-de` — four topic cards link into `/kham-pha?chu-de=…`.
- `/gioi-thieu` — renders story/mission/how-it-works + CTA.
- Toggle dark mode (AccountMenu) — text legible, decoration faint, contrast OK.
- Footer appears on every route.

- [ ] **Step 4: Merge to main + push**

```bash
git checkout main
git merge --ff-only feat/heritage-warm-landing
git branch -d feat/heritage-warm-landing
git push origin main
```
Expected: fast-forward succeeds; `main` pushed.

---

## Self-review notes (addressed)

- **Spec coverage:** Header (T4), Footer (T3), Home landing + 5 sections (T6–T9), Khám phá feed move + filters (T5), Chủ đề (T10), Giới thiệu (T11), categories no-migration (T1), decoration SVG (T2), data fallbacks (T7/T9 fallback strings + empty states), auth via AccountMenu (T4), i18n parity (T12), Collections placeholder (T4). All spec sections map to a task.
- **No migration:** confirmed — categories are JS keyword buckets (T1); no `posts` schema change.
- **Type consistency:** `FeaturedData`/`RecentItem` are defined in their components (T7/T8) and imported by the page (T9); `Post.content` fields (`title`, `hook`, `hashtags`, `three_fun_facts`, `image_url`) match `lib/types.ts`. `PENDING_IMAGE_KEY` value `"omm-pending-image"` matches the literal read in `app/create/page.tsx` (T6).
- **Open implementation choices flagged inline** (not placeholders): the `tFeed("allLenses")` key reuse in T5; optional `bare` prop for `CategoryGrid` on `/chu-de` in T10. Both have a concrete default.
