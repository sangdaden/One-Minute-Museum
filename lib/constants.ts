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

/** Number of feed posts per page (initial + each "Tải thêm"). */
export const FEED_PAGE_SIZE = 20;

/**
 * Mode/voice display labels + descriptions now live in the i18n message
 * catalogs (messages/*.json, namespaces `Modes`/`Voices`), keyed by the
 * canonical mode/voice value.
 */

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
