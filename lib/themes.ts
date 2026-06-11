// Vietnamese-identity themes for exhibition cards + share cards.
// Data-driven: one ThemedCard layout renders any theme from this config.

export type DecorationKind =
  | "none"
  | "seal"
  | "menlam"
  | "dongho"
  | "thocam"
  | "note"
  | "tet";

export interface Theme {
  id: string;
  label: string;
  /** Small background used in the picker swatch. */
  swatch: string;
  /** Card surface background (may be a gradient). */
  bg: string;
  /** Solid representative colour (e.g. for the PNG export canvas fill). */
  bgSolid: string;
  /** Content panel background (null = text sits directly on bg). */
  panel: string | null;
  ink: string;
  inkSoft: string;
  accent: string;
  decoration: DecorationKind;
}

export const DEFAULT_THEME = "macdinh";

export const THEMES: Theme[] = [
  {
    id: "macdinh",
    label: "Mặc định",
    swatch:
      "linear-gradient(135deg,#f7f1e3 0 50%,#a8322a 50% 100%)",
    bg: "#f7f1e3",
    bgSolid: "#f7f1e3",
    panel: null,
    ink: "#2f2621",
    inkSoft: "#7a6a5f",
    accent: "#a8322a",
    decoration: "none",
  },
  {
    id: "sonmai",
    label: "Sơn mài",
    swatch: "radial-gradient(circle at 30% 30%,#3a261a,#18100b 75%)",
    bg: "radial-gradient(circle at 22% 25%,#3a261a,#18100b 72%)",
    bgSolid: "#18100b",
    panel: null,
    ink: "#f4e7c8",
    inkSoft: "#cbb488",
    accent: "#c99a4a",
    decoration: "seal",
  },
  {
    id: "menlam",
    label: "Men lam",
    swatch: "repeating-linear-gradient(45deg,#234e9e 0 5px,#fff 5px 10px)",
    bg: "#f1ede1",
    bgSolid: "#f1ede1",
    panel: "#ffffff",
    ink: "#15233f",
    inkSoft: "#41506b",
    accent: "#234e9e",
    decoration: "menlam",
  },
  {
    id: "dongho",
    label: "Đông Hồ",
    swatch: "linear-gradient(135deg,#f6efd9,#e7d9b0)",
    bg: "#f6efd9",
    bgSolid: "#f6efd9",
    panel: "rgba(255,253,245,0.6)",
    ink: "#3a2a14",
    inkSoft: "#6b5a3a",
    accent: "#d23a2e",
    decoration: "dongho",
  },
  {
    id: "thocam",
    label: "Thổ cẩm",
    swatch:
      "repeating-linear-gradient(90deg,#9e2b22 0 6px,#1c1714 6px 9px,#e0a52e 9px 14px,#2f7a5f 14px 19px)",
    bg: "#f7f0e6",
    bgSolid: "#f7f0e6",
    panel: "rgba(255,255,255,0.55)",
    ink: "#2a1c14",
    inkSoft: "#5a4636",
    accent: "#9e2b22",
    decoration: "thocam",
  },
  {
    id: "note",
    label: "Giấy note",
    swatch: "linear-gradient(135deg,#f1ebe0 60%,#ffe27a 60%)",
    bg: "#f1ebe0",
    bgSolid: "#f1ebe0",
    panel: "#ffffff",
    ink: "#231a12",
    inkSoft: "#6a5a44",
    accent: "#9e3322",
    decoration: "note",
  },
  {
    id: "tet",
    label: "Tết",
    swatch: "linear-gradient(140deg,#a8122a,#7d0f20)",
    bg: "linear-gradient(140deg,#a8122a,#7d0f20)",
    bgSolid: "#7d0f20",
    panel: null,
    ink: "#fff2cf",
    inkSoft: "#f3d59a",
    accent: "#ffcf6b",
    decoration: "tet",
  },
];

const BY_ID = new Map(THEMES.map((t) => [t.id, t]));

/** Resolve a theme id to its config; falls back to the default (bento). */
export function getTheme(id?: string | null): Theme {
  return (id && BY_ID.get(id)) || BY_ID.get(DEFAULT_THEME)!;
}
