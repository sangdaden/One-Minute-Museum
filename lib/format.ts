// Small presentation helpers shared across the museum UI.

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
