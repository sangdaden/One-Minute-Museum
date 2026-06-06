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
