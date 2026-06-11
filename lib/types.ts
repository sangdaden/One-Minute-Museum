// Core domain types for Bảo Tàng 1 Phút / One-Minute Museum.

/** The four curatorial lenses a user can pick. */
export const MODES = [
  "Vietnamese Culture",
  "Museum",
  "Fun Fact",
  "Design",
] as const;

export type Mode = (typeof MODES)[number];

/** The curator voices — a tone/persona axis, parallel to (not replacing) MODES. */
export const VOICES = [
  "Nhà nghiên cứu",
  "Bà kể chuyện",
  "Chú bán hàng",
  "Nhà thơ",
] as const;

export type Voice = (typeof VOICES)[number];

export type Language = "vi" | "en";

/** Request body for POST /api/exhibitions/generate. */
export interface GenerateRequest {
  object_name: string;
  mode: Mode;
  voice?: Voice;
  language?: Language;
  /**
   * Optional downscaled image data URI (JPEG). When present, the object is
   * generated from the photo (multimodal) and object_name may be empty —
   * the model identifies it. Never persisted.
   */
  image?: string;
}

/**
 * A generated mini exhibition. Mirrors the JSON schema in docs/prompt_spec.md,
 * plus the request/metadata fields documented in docs/api_spec.md.
 */
export interface Exhibition {
  id: string;
  object_name: string;
  mode: string;
  language: string;
  title: string;
  hook: string;
  what_it_is: string;
  origin_or_context: string;
  three_fun_facts: string[];
  design_or_cultural_insight: string;
  why_it_matters: string;
  reflection_question: string;
  share_quote: string;
  hashtags: string[];
  created_at: string;
  /**
   * Curator voice used. Optional for back-compat: exhibitions saved before the
   * voice feature won't have this field, so consumers must tolerate undefined.
   */
  voice?: string;
  /** Vietnamese theme id (presentation only; not part of generated content). */
  theme?: string;
  /** Optional personal note (shown on the "Giấy note" theme). Stored in content. */
  note?: string;
}

/** The exhibition content fields only (no id/meta) — stored as `content` jsonb. */
export type ExhibitionContent = Omit<
  Exhibition,
  "id" | "object_name" | "mode" | "voice" | "language" | "created_at" | "theme"
>;

/** A published exhibition (row in `posts`), optionally with its author. */
export interface Post {
  id: string;
  user_id: string;
  object_name: string;
  mode: string;
  voice: string | null;
  language: string;
  created_at: string;
  content: ExhibitionContent;
  /** Vietnamese theme id chosen for this post. */
  theme?: string | null;
  /** Public URL of the object photo (Supabase Storage), if published with one. */
  image_url?: string | null;
  author?: { display_name: string | null; avatar_url: string | null };
  /** Loaded for feed/detail: who reacted with what. */
  reactions?: { type: string; user_id: string }[];
  /** Loaded for feed/detail. */
  comment_count?: number;
}

/** The curated reaction set (docs/specs reactions-comments). */
export const REACTIONS = [
  { type: "thich", emoji: "❤️", label: "Thích" },
  { type: "batngo", emoji: "😮", label: "Bất ngờ" },
  { type: "suyngam", emoji: "🤔", label: "Suy ngẫm" },
  { type: "vui", emoji: "😄", label: "Vui" },
] as const;

export type ReactionType = (typeof REACTIONS)[number]["type"];

/** A comment on a post. */
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: { display_name: string | null; avatar_url: string | null };
}

/** Error codes from docs/api_spec.md §8. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "GENERATION_FAILED"
  | "INVALID_JSON"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
