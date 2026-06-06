// Core domain types for Bảo Tàng 1 Phút / One-Minute Museum.

/** The four curatorial lenses a user can pick. */
export const MODES = [
  "Vietnamese Culture",
  "Museum",
  "Fun Fact",
  "Design",
] as const;

export type Mode = (typeof MODES)[number];

export type Language = "vi" | "en";

/** Request body for POST /api/exhibitions/generate. */
export interface GenerateRequest {
  object_name: string;
  mode: Mode;
  language?: Language;
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
