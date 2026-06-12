// One-off asset fetcher: pulls Public-Domain / CC0 images from Wikimedia
// Commons for the landing page and saves them under public/images/landing/,
// recording source + license in credits.json. Run: node scripts/fetch-landing-images.mjs
//
// License policy: PREFER Public Domain / CC0 (no attribution legally required).
// We still record full attribution. Items with no PD/CC0 match are reported and
// skipped (the UI keeps its gradient/SVG fallback for those slots).

import { writeFile, mkdir } from "node:fs/promises";
import { Buffer } from "node:buffer";

const API = "https://commons.wikimedia.org/w/api.php";
const OUT_DIR = "public/images/landing";
const UA = "OneMinuteMuseum/1.0 (landing asset fetch; cultural heritage)";

// slug → search queries (tried in order until a PD/CC0 image is found).
// Subjects chosen to favour public-domain heritage material.
const TARGETS = [
  // Category cards
  { slug: "kien-truc", queries: ["One Pillar Pagoda Hanoi", "Temple of Literature Hanoi", "Vietnamese communal house đình"] },
  { slug: "di-san", queries: ["Dong Son bronze drum", "Imperial City Huế", "Complex of Huế Monuments"] },
  { slug: "trang-phuc", queries: ["Áo dài vintage", "Vietnamese women traditional dress historical", "áo dài Huế"] },
  { slug: "nghe-thuat-dan-gian", queries: ["Đông Hồ painting", "Dong Ho woodcut", "Hàng Trống painting"] },
  // Hero collage
  { slug: "hero-1", queries: ["Imperial City Huế", "Ngọ Môn Huế", "Thái Hòa Palace"] },
  { slug: "hero-2", queries: ["Dong Son bronze drum Ngọc Lũ", "Đông Sơn drum"] },
  { slug: "hero-3", queries: ["Hội An ancient town", "Hội An lantern", "Chùa Cầu Hội An"] },
];

function isFreeLicense(meta) {
  const short = (meta?.LicenseShortName?.value ?? "").toLowerCase();
  const code = (meta?.License?.value ?? "").toLowerCase();
  const hay = `${short} ${code}`;
  // Public Domain or CC0 only.
  return (
    hay.includes("public domain") ||
    hay.includes("cc0") ||
    code === "pd" ||
    short.includes("pd-") ||
    hay.includes("no restrictions")
  );
}

function stripHtml(s) {
  return s ? s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : undefined;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia rate-limits bursts and occasionally resets the connection; fetch
// politely with backoff on 429 AND on network errors (ECONNRESET/terminated).
async function politeFetch(url, init, tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status !== 429) return res;
      const wait = 1500 * (i + 1);
      console.log(`  … 429, backing off ${wait}ms`);
      await sleep(wait);
    } catch (e) {
      lastErr = e;
      const wait = 2000 * (i + 1);
      console.log(`  … network error (${e.cause?.code ?? e.message}), retry in ${wait}ms`);
      await sleep(wait);
    }
  }
  if (lastErr) throw lastErr;
  return fetch(url, init);
}

async function searchCommons(query, limit = 12) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime",
    iiurlwidth: "1000",
    origin: "*",
  });
  const res = await politeFetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`http ${res.status} for "${query}"`);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  return Object.values(pages)
    .map((p) => ({ page: p, ii: p?.imageinfo?.[0] }))
    .filter((x) => x.ii?.thumburl);
}

async function download(url, destNoExt) {
  const res = await politeFetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download http ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type") ?? "";
  const ext = ct.includes("png") ? "png" : "jpg";
  const fileName = `${destNoExt}.${ext}`;
  await writeFile(`${OUT_DIR}/${fileName}`, buf);
  return { fileName, bytes: buf.length };
}

async function fetchOne(target, credits) {
  let picked = null;
  for (const q of target.queries) {
    let candidates = [];
    try {
      candidates = await searchCommons(q);
    } catch (e) {
      console.log(`  ! search failed "${q}": ${e.message}`);
      continue;
    }
    const match = candidates.find(
      (c) =>
        isFreeLicense(c.ii.extmetadata) &&
        /image\/(jpeg|png)/i.test(c.ii.mime ?? "") &&
        c.ii.thumburl,
    );
    if (match) {
      picked = { ...match, query: q };
      break;
    }
    await sleep(400);
  }
  if (!picked) {
    console.log(`✗ ${target.slug}: no PD/CC0 image found (tried: ${target.queries.join(" | ")})`);
    return;
  }
  const meta = picked.ii.extmetadata ?? {};
  const { fileName, bytes } = await download(picked.ii.thumburl, target.slug);
  const credit = {
    slug: target.slug,
    fileName,
    title: String(picked.page.title ?? "").replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, ""),
    author: stripHtml(meta.Artist?.value) ?? "Unknown",
    license: stripHtml(meta.LicenseShortName?.value) ?? "Public domain",
    sourceUrl: picked.ii.descriptionurl ?? picked.ii.url,
    query: picked.query,
  };
  credits.push(credit);
  console.log(`✓ ${target.slug}: ${fileName} (${Math.round(bytes / 1024)}KB) — ${credit.license} — "${credit.title}"`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const credits = [];
  for (const target of TARGETS) {
    await sleep(1500); // be polite between items
    try {
      await fetchOne(target, credits);
    } catch (e) {
      console.log(`✗ ${target.slug}: ${e.message} — skipped`);
    }
  }
  await writeFile(`${OUT_DIR}/credits.json`, JSON.stringify(credits, null, 2) + "\n");
  console.log(`\nSaved ${credits.length}/${TARGETS.length} images + credits.json`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
