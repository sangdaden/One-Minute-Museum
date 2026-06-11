import type { Exhibition } from "./types";

/**
 * Client-side gallery persistence via localStorage (docs/data_model.md §1).
 * No database, no network. All functions are SSR-safe (no-op on the server).
 */

export const GALLERY_STORAGE_KEY = "one_minute_museum_exhibitions";

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** Read all saved exhibitions (newest first). Returns [] on any failure. */
export function getExhibitions(): Exhibition[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only entries that look like exhibitions.
    return parsed.filter(
      (x): x is Exhibition =>
        x && typeof x === "object" && typeof x.id === "string",
    );
  } catch {
    return [];
  }
}

/**
 * Persist an exhibition, newest first. Skips the write if an entry with the
 * same id already exists (no duplicates). Returns the resulting list.
 */
export function saveExhibition(exhibition: Exhibition): Exhibition[] {
  if (!isBrowser()) return [];
  const existing = getExhibitions();
  if (existing.some((e) => e.id === exhibition.id)) return existing;

  const next = [exhibition, ...existing];
  try {
    window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / serialization failure — fail silently, generation still succeeded.
  }
  return next;
}

/**
 * Replace a saved exhibition (matched by id) with an edited version; inserts it
 * at the front if it wasn't saved yet. Returns the resulting list.
 */
export function updateExhibition(exhibition: Exhibition): Exhibition[] {
  if (!isBrowser()) return [];
  const existing = getExhibitions();
  const found = existing.some((e) => e.id === exhibition.id);
  const next = found
    ? existing.map((e) => (e.id === exhibition.id ? exhibition : e))
    : [exhibition, ...existing];
  try {
    window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / serialization errors
  }
  return next;
}

/** Remove every saved exhibition. */
export function clearExhibitions(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(GALLERY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
