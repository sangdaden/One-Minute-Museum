import type { Mode, Voice } from "./types";

/** Default curatorial lens (docs/mvp_scope.md F02). */
export const DEFAULT_MODE: Mode = "Vietnamese Culture";

/** Default curator voice — keeps behaviour equivalent to the original tone. */
export const DEFAULT_VOICE: Voice = "Nhà nghiên cứu";

export const DEFAULT_LANGUAGE = "vi";

/** Max length accepted for an object name (docs/api_spec.md validation). */
export const OBJECT_NAME_MAX = 80;

/**
 * Max length of an image data URI accepted by the API (~1.5MB encoded).
 * The client downscales before upload, so this is a safety cap.
 */
export const IMAGE_MAX_CHARS = 2_000_000;

/** Allowed image data-URI prefixes for the photo path. */
export const IMAGE_DATA_URI_RE = /^data:image\/(png|jpe?g|webp);base64,/;

/** Short copy shown on each mode card. (Icons live in ModeSelector.) */
export const MODE_META: Record<Mode, { description: string }> = {
  "Vietnamese Culture": {
    description: "Ký ức tập thể, đời sống Việt Nam hằng ngày.",
  },
  Museum: {
    description: "Trang trọng, giàu hình ảnh như bảng mô tả bảo tàng.",
  },
  "Fun Fact": {
    description: "Vui, ngắn, dễ share, có chút hài hước nhẹ.",
  },
  Design: {
    description: "Vật liệu, hình dáng, trade-off thiết kế.",
  },
};

/** One-line persona per voice. (Icons live in VoiceSelector.) */
export const VOICE_META: Record<Voice, { description: string }> = {
  "Nhà nghiên cứu": { description: "Điềm đạm, chuẩn mực, có chiều sâu." },
  "Bà kể chuyện": { description: "Ấm áp, hoài niệm, “hồi đó…”." },
  "Chú bán hàng": { description: "Đời, dí dỏm, gần gũi vỉa hè." },
  "Nhà thơ": { description: "Văn chương, giàu hình ảnh." },
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
