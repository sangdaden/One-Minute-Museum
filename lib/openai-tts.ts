import OpenAI from "openai";
import { APIError, RateLimitError, AuthenticationError } from "openai";
import type { Exhibition } from "./types";
import { GenerationError } from "./openai-exhibition";

/**
 * Read an exhibition aloud (OpenAI TTS), in a voice matching the curator
 * persona. Returns mp3 bytes. Ephemeral — nothing is stored.
 */

const MODEL = process.env.OPENAI_TTS_MODEL ?? "tts-1";

type TtsVoice = "alloy" | "onyx" | "shimmer" | "fable" | "nova";

/** Map the canonical Vietnamese curator voices to a TTS timbre. */
const VOICE_MAP: Record<string, TtsVoice> = {
  "Nhà nghiên cứu": "onyx", // calm, authoritative
  "Bà kể chuyện": "shimmer", // warm
  "Chú bán hàng": "alloy", // lively, everyday
  "Nhà thơ": "fable", // expressive
};

const genericFailMessage = "Không tạo được âm thanh lúc này. Thử lại nhé.";

/** Build a flowing ~1-minute narration script from the exhibition. */
function buildScript(ex: Exhibition): string {
  const en = ex.language === "en";
  const factsLabel = en ? "Three fun facts" : "Ba điều thú vị";
  const facts = ex.three_fun_facts.filter(Boolean);
  const parts = [
    ex.title,
    ex.hook,
    ex.what_it_is,
    ex.origin_or_context,
    facts.length ? `${factsLabel}: ${facts.join(". ")}` : "",
    ex.design_or_cultural_insight,
    ex.why_it_matters,
    ex.reflection_question,
  ];
  return parts
    .filter((p) => typeof p === "string" && p.trim().length > 0)
    .join("\n")
    .slice(0, 3900);
}

/**
 * Synthesize the exhibition narration. Returns the mp3 as an ArrayBuffer.
 * Assumes OPENAI_API_KEY is present (the route checks first).
 */
export async function synthesizeSpeech(ex: Exhibition): Promise<ArrayBuffer> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const voice: TtsVoice = (ex.voice && VOICE_MAP[ex.voice]) || "alloy";

  try {
    const res = await client.audio.speech.create({
      model: MODEL,
      voice,
      input: buildScript(ex),
      response_format: "mp3",
    });
    return await res.arrayBuffer();
  } catch (err) {
    if (err instanceof RateLimitError) {
      throw new GenerationError(
        "RATE_LIMITED",
        "Hệ thống đang bận. Thử lại sau một chút nhé.",
        429,
      );
    }
    if (err instanceof AuthenticationError) {
      throw new GenerationError(
        "INTERNAL_ERROR",
        "Server chưa được cấu hình đúng. Vui lòng thử lại sau.",
        500,
      );
    }
    if (err instanceof APIError) {
      throw new GenerationError("GENERATION_FAILED", genericFailMessage, 502);
    }
    throw new GenerationError("GENERATION_FAILED", genericFailMessage, 500);
  }
}
