// Small presentation helpers shared across the museum UI.

import type { Exhibition } from "./types";

/** English labels for the canonical Vietnamese curator voices. */
const VOICE_EN: Record<string, string> = {
  "Nhà nghiên cứu": "Researcher",
  "Bà kể chuyện": "Storyteller",
  "Chú bán hàng": "Street vendor",
  "Nhà thơ": "Poet",
};

/**
 * Baked labels for export artwork (share card / flashcards), in the
 * exhibition's content language so a card reads consistently with its content.
 */
export function cardLabels(ex: Exhibition) {
  const en = ex.language === "en";
  const voiceName = ex.voice
    ? en
      ? (VOICE_EN[ex.voice] ?? ex.voice)
      : ex.voice
    : "";
  return {
    en,
    brand: en ? "One-Minute Museum" : "Bảo Tàng 1 Phút",
    voiceName,
    toldBy: voiceName ? `${en ? "Told by" : "Kể bởi"} ${voiceName}` : "★",
    object: en ? "Object" : "Hiện vật",
    facts: en ? "Three fun facts" : "Ba điều thú vị",
    fact: en ? "Fun fact" : "Fun fact",
  };
}

/** ISO date -> "06.06.2026" (deterministic, locale-free to avoid hydration drift). */
export function formatDate(iso: string): string {
  const [d] = iso.split("T");
  const parts = d.split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : d;
}

/** Short accession id from a uuid, e.g. "A1B2·C3D4". */
export function accession(id: string): string {
  const clean = id.replace(/-/g, "").toUpperCase();
  return `${clean.slice(0, 4)}·${clean.slice(4, 8)}`;
}

/**
 * Normalize a hashtag to just letters/digits/underscore — drops a leading "#",
 * stray "%", spaces, and other punctuation the model sometimes emits
 * (e.g. "#%bocnilon" -> "bocnilon"). Render with a single "#" in front.
 */
export function cleanHashtag(tag: string): string {
  return tag.replace(/[^\p{L}\p{N}_]/gu, "");
}

/** Strip surrounding quote marks the model sometimes adds to a quote string. */
export function stripWrappingQuotes(s: string): string {
  return s.trim().replace(/^[“"'‘]+|[”"'’]+$/g, "").trim();
}

/**
 * ASCII slug for filenames, e.g. "Dép tổ ong" -> "dep-to-ong".
 * Strips Vietnamese diacritics so downloads are safe across OSes.
 */
export function slugifyObjectName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining marks (incl. Vietnamese horn/hook)
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "exhibition";
}
