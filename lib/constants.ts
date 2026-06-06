import type { Mode } from "./types";

/** Default curatorial lens (docs/mvp_scope.md F02). */
export const DEFAULT_MODE: Mode = "Vietnamese Culture";

export const DEFAULT_LANGUAGE = "vi";

/** Max length accepted for an object name (docs/api_spec.md validation). */
export const OBJECT_NAME_MAX = 80;

/** Short copy shown on each mode card. */
export const MODE_META: Record<
  Mode,
  { icon: string; description: string }
> = {
  "Vietnamese Culture": {
    icon: "🇻🇳",
    description: "Ký ức tập thể, đời sống Việt Nam hằng ngày.",
  },
  Museum: {
    icon: "🏛️",
    description: "Trang trọng, giàu hình ảnh như bảng mô tả bảo tàng.",
  },
  "Fun Fact": {
    icon: "✨",
    description: "Vui, ngắn, dễ share, có chút hài hước nhẹ.",
  },
  Design: {
    icon: "📐",
    description: "Vật liệu, hình dáng, trade-off thiết kế.",
  },
};

/**
 * Hardcoded suggested objects (docs/coding_agent_instructions.md §8).
 * Vietnam Everyday Collection — ≥12 items as required by F06.
 */
export const SUGGESTED_OBJECTS: string[] = [
  "Dép tổ ong",
  "Ghế nhựa đỏ",
  "Ly cà phê sữa đá",
  "Remote TV bọc nilon",
  "Áo mưa",
  "Xe máy",
  "Mũ bảo hiểm",
  "Phích nước",
  "Nồi cơm điện",
  "Quạt máy",
  "Túi nilon đi chợ",
  "Bút bi Thiên Long",
];
