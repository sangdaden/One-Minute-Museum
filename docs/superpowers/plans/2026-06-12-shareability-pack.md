# Shareability Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give shared posts rich link previews (OG/Twitter) and bake curated-image attribution into exported share cards/flashcards.

**Architecture:** Two independent parts. (A) Server metadata: add `metadataBase` + a committed default OG image to the root metadata, and `generateMetadata` to the post route. (B) Client render: a `creditLine` helper that the three export-artwork surfaces render onto the baked image when the featured image is curated. No DB migration. No new dependencies.

**Tech Stack:** Next.js 16 App Router (file metadata + `generateMetadata`), React 19, TypeScript, Supabase (`@supabase/ssr`), inline-styled export components (html-to-image). **No test runner** — verify with `node`/`npx tsx` assertions, `npx tsc --noEmit`, `npm run build`, and inspecting rendered `<head>`.

**Reference:** Spec at `docs/superpowers/specs/2026-06-12-shareability-pack-design.md`.

**Conventions:** Branch `feat/shareability-pack`. Commit per task. `lib/format.ts` already exports `cardLabels(ex)` (returns `{ en, brand, voiceName, toldBy, object, facts, fact }`) and `stripWrappingQuotes`. `ImageCredit = { source: "wikimedia"|"unsplash"|"pexels"|"user_upload", author?, license?, sourceUrl, title? }`; `Exhibition.image_credit?` is present on the `ex` passed to the artwork components.

---

## Task 0: Branch

- [ ] **Step 1:** `git checkout -b feat/shareability-pack` → expect `Switched to a new branch 'feat/shareability-pack'`.

---

## Task 1: `lib/format.ts` — `truncate`, `creditLine`, and `cardLabels.photo`

**Files:** Modify `lib/format.ts`.

- [ ] **Step 1: Add a `photo` label to `cardLabels`.** In the object returned by `cardLabels`, add a `photo` field after `fact`:

```ts
    fact: en ? "Fun fact" : "Fun fact",
    photo: en ? "Photo" : "Ảnh",
  };
```

- [ ] **Step 2: Add `truncate` and `creditLine` exports** (append near the other helpers in `lib/format.ts`):

```ts
/** Trim to `max` chars on a word-safe-ish boundary, adding an ellipsis if cut. */
export function truncate(s: string, max: number): string {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

const IMAGE_SOURCE_NAMES: Record<string, string> = {
  wikimedia: "Wikimedia Commons",
  unsplash: "Unsplash",
  pexels: "Pexels",
  user_upload: "",
};

/**
 * One-line attribution baked onto export artwork when the featured image came
 * from the curation pipeline. Returns null for user uploads or when there is no
 * credit, so callers can `{creditLine(ex, L.photo) && ...}`.
 */
export function creditLine(ex: Exhibition, photoLabel: string): string | null {
  const c = ex.image_credit;
  if (!c || c.source === "user_upload") return null;
  const parts = [
    c.author ? truncate(c.author, 28) : null,
    c.license || null,
    IMAGE_SOURCE_NAMES[c.source] || null,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return `${photoLabel}: ${parts.join(" · ")}`;
}
```

- [ ] **Step 3: Verify with a node assertion.**

```bash
npx tsx -e '
import { truncate, creditLine, cardLabels } from "./lib/format.ts";
import assert from "node:assert";
assert.equal(truncate("hello world", 5), "hell…");
assert.equal(truncate("  short  ", 20), "short");
const base = { language: "vi", image_credit: { source: "wikimedia", author: "Daderot", license: "CC0", sourceUrl: "x" } };
assert.equal(creditLine(base, "Ảnh"), "Ảnh: Daderot · CC0 · Wikimedia Commons");
assert.equal(creditLine({ language: "vi", image_credit: { source: "user_upload", sourceUrl: "x" } }, "Ảnh"), null);
assert.equal(creditLine({ language: "vi" }, "Ảnh"), null);
assert.equal(cardLabels({ language: "en" }).photo, "Photo");
assert.equal(cardLabels({ language: "vi" }).photo, "Ảnh");
console.log("format OK");
'
```
Expected: `format OK`. (Casts are loose on purpose for the assertion; the real types are `Exhibition`.)

- [ ] **Step 4:** `npx tsc --noEmit` → exit 0.

- [ ] **Step 5: Commit.**
```bash
git add lib/format.ts
git commit -m "feat: truncate + creditLine helpers + photo card label"
```

---

## Task 2: `metadataBase` + default OG image (`app/layout.tsx` + asset)

**Files:** Modify `app/layout.tsx`; add `public/og-default.jpg`.

- [ ] **Step 1: Create the default OG image** by copying the committed Public-Domain Huế photo:

```bash
cp public/images/landing/hero-1.jpg public/og-default.jpg
```
(Deterministic, no dependency, already PD/CC0. It can be upgraded to a 1200×630 branded image later.)

- [ ] **Step 2: Add `metadataBase` + default images to the root metadata** in `app/layout.tsx`. The current block is:

```ts
export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESC,
  applicationName: "Bảo Tàng 1 Phút",
  openGraph: {
    title: APP_TITLE,
    description: APP_DESC,
    type: "website",
    locale: "vi_VN",
    siteName: "Bảo Tàng 1 Phút",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESC,
  },
};
```
Change it to:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: APP_TITLE,
  description: APP_DESC,
  applicationName: "Bảo Tàng 1 Phút",
  openGraph: {
    title: APP_TITLE,
    description: APP_DESC,
    type: "website",
    locale: "vi_VN",
    siteName: "Bảo Tàng 1 Phút",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESC,
    images: ["/og-default.jpg"],
  },
};
```

- [ ] **Step 3:** `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"` → `✓ Compiled successfully`.

- [ ] **Step 4: Commit.**
```bash
git add app/layout.tsx public/og-default.jpg
git commit -m "feat: metadataBase + default OG image for link previews"
```

---

## Task 3: Per-post `generateMetadata` (`app/p/[id]/page.tsx`)

**Files:** Modify `app/p/[id]/page.tsx`.

The page is a server component that already imports `isSupabaseConfigured`, `createClient`, and has `export const dynamic = "force-dynamic"`.

- [ ] **Step 1: Add imports.** Ensure these are imported at the top of `app/p/[id]/page.tsx`:
- `import type { Metadata } from "next";`
- `import { truncate } from "@/lib/format";` (merge with any existing `@/lib/format` import if present — the file already imports `formatDate` from there, so extend that import: `import { formatDate, truncate } from "@/lib/format";`)

- [ ] **Step 2: Add `generateMetadata`** above the default `PostPage` export:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("object_name, content, image_url, language")
    .eq("id", id)
    .maybeSingle();
  if (!data) return {};

  const content = (data.content ?? {}) as { title?: string; hook?: string };
  const title = `${content.title || data.object_name} · OMM`;
  const description = truncate(content.hook ?? "", 160) || data.object_name;
  const images = data.image_url ? [data.image_url as string] : ["/og-default.jpg"];
  const locale = data.language === "en" ? "en_US" : "vi_VN";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/p/${id}`,
      locale,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
```

Notes for the implementer:
- `generateMetadata` MUST NOT throw — missing post or unconfigured Supabase returns `{}` (root metadata applies).
- Explicitly setting `images` here is intentional: Next replaces (not deep-merges) a child `openGraph`, so text-only posts must point at `/og-default.jpg` themselves.
- `data.image_url` is an absolute Supabase Storage URL; `/og-default.jpg` and `/p/${id}` resolve against `metadataBase`.

- [ ] **Step 3:** `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"` → `✓ Compiled successfully`.

- [ ] **Step 4: Inspect the rendered head (best-effort).** If Supabase + a seeded post exist locally: `npm run dev`, then `curl -s localhost:3000/p/<id> | grep -iE 'og:title|og:image|og:description|twitter:card'` and confirm the tags reflect the post. If no local DB, rely on the build + the static-analysis that `generateMetadata` returns the right shape (typecheck covers it). Document which path was used.

- [ ] **Step 5: Commit.**
```bash
git add app/p/[id]/page.tsx
git commit -m "feat: per-post Open Graph / Twitter metadata"
```

---

## Task 4: Bake curated-image credit into export artwork

**Files:** Modify `components/ShareCard.tsx` (PosterArtwork + the themed card), `components/FlashcardArtwork.tsx` (CoverBody).

The credit only appears when `creditLine(ex, L.photo)` is non-null (curated image present, not a user upload). Read each component to place the snippet precisely; each already has `const L = cardLabels(ex)` in the relevant scope (add `creditLine` to the `@/lib/format` import).

- [ ] **Step 1: Import `creditLine`** in both files. They already import from `@/lib/format` (e.g. `cardLabels`); extend that import to include `creditLine`.

- [ ] **Step 2: PosterArtwork (ShareCard.tsx).** PosterArtwork renders a full-bleed photo poster inside one absolutely-positioned 1080×1080 root container (it already destructures `cream`/`light`/`mono` and `const L = cardLabels(ex)`). Just before the closing tag of that root container (after the per-layout content blocks), add a bottom-anchored credit line:

```tsx
        {creditLine(ex, L.photo) && (
          <div
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              bottom: 26,
              textAlign: "right",
              fontFamily: mono,
              fontSize: 16,
              letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {creditLine(ex, L.photo)}
          </div>
        )}
```
(If `mono` is named differently in PosterArtwork's scope, use that local constant. The line sits over the dark bottom gradient, so it stays legible across all three layouts.)

- [ ] **Step 3: Themed ShareCard (ShareCard.tsx).** The themed (non-poster) card renders the featured image in a framed box with `const L = cardLabels(ex)` and a theme `t` in scope. Directly below that image frame element, add a muted caption:

```tsx
        {creditLine(ex, L.photo) && (
          <div
            style={{
              marginTop: 10,
              fontFamily: mono,
              fontSize: 15,
              color: `${t.inkSoft}`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {creditLine(ex, L.photo)}
          </div>
        )}
```
(Use the themed card's local mono/`t` names. Place it inside the same container that holds the image so it sits directly under it. If the themed card only shows the image conditionally, place the caption inside that same conditional so it never renders without an image.)

- [ ] **Step 4: FlashcardArtwork CoverBody (FlashcardArtwork.tsx).** `CoverBody` renders the 520×520 image frame (with `marginBottom: 36`) and has `const L = cardLabels(ex)` + theme `t` + the module-level `MONO` constant. Immediately after the image-frame `<div>` (inside the `{imageUrl && (...)}` block is fine, or right after it guarded by `imageUrl`), add:

```tsx
        {imageUrl && creditLine(ex, L.photo) && (
          <div
            style={{
              marginTop: -20,
              marginBottom: 20,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 16,
              color: `${t.inkSoft}`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {creditLine(ex, L.photo)}
          </div>
        )}
```

- [ ] **Step 5:** `npx tsc --noEmit && npm run build 2>&1 | grep -i "compiled\|error"` → `✓ Compiled successfully`.

- [ ] **Step 6: Commit.**
```bash
git add components/ShareCard.tsx components/FlashcardArtwork.tsx
git commit -m "feat: bake curated-image attribution into export artwork"
```

---

## Task 5: Verify + merge

- [ ] **Step 1: Full gates.** `npx tsc --noEmit && npm run build 2>&1 | tail -5` → `✓ Compiled successfully`.

- [ ] **Step 2: i18n parity unchanged** (no catalog keys were added; `photo` lives in `cardLabels`):
```bash
node -e 'const keys=o=>{const s=new Set();(function w(x,p=""){for(const k in x){const kk=p?p+"."+k:k;s.add(kk);if(x[k]&&typeof x[k]==="object")w(x[k],kk)}})(o);return s};const v=keys(require("./messages/vi.json")),e=keys(require("./messages/en.json"));const ov=[...v].filter(k=>!e.has(k)),oe=[...e].filter(k=>!v.has(k));console.log("parity",ov.length===0&&oe.length===0,"vi",v.size,"en",e.size)'
```
Expected: `parity true`.

- [ ] **Step 3: Manual QA (if local DB available).**
  - Post detail: `curl -s localhost:3000/p/<id> | grep -iE 'og:|twitter:'` shows post title/description and the post image (or `/og-default.jpg` for a text-only post).
  - Export a share card + flashcard from a post that used a **curated Wikimedia image** → the credit line is present and legible on poster, themed card, and flashcard cover.
  - Export from a **user-uploaded-photo** post → no credit line.

- [ ] **Step 4: Merge + push.**
```bash
git checkout main
git merge --ff-only feat/shareability-pack
git branch -d feat/shareability-pack
git push origin main
```

---

## Self-review notes (addressed)

- **Spec coverage:** metadataBase + default OG (T2) ✓; per-post generateMetadata (T3) ✓; baked credit on all three surfaces (T4) ✓; `truncate`/`creditLine`/`cardLabels.photo` (T1) ✓; verification incl. head inspection + parity (T3/T5) ✓; out-of-scope items (Satori, other routes) not added ✓.
- **No migration / no new deps:** default OG is a copied committed photo; no sharp/satori.
- **Type/name consistency:** `creditLine(ex, photoLabel)` signature is identical across T1 (def) and T4 (calls); `cardLabels(...).photo` added in T1 and read in T4; `truncate` defined in T1, used in T3 and inside `creditLine`.
- **Merge-safety note for Next metadata:** child `openGraph` replaces parent, so T3 sets `images` explicitly rather than relying on inheritance — called out in T3.
- **Implementer latitude flagged (not placeholders):** local constant names for `mono`/`t` in ShareCard scopes (T4 Steps 2–3) — the implementer matches the file's existing names; the snippet content is fully specified.
