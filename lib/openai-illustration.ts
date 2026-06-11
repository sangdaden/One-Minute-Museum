import OpenAI from "openai";
import { APIError, RateLimitError, AuthenticationError } from "openai";
import { GenerationError } from "./openai-exhibition";

/**
 * AI sample illustrations for an object (used when the user didn't upload a
 * photo). Generates a few clean studio/catalogue shots the user can pick from.
 *
 * Mirrors the error-mapping discipline of `openai-exhibition.ts`: provider
 * errors are mapped to public-safe codes/messages — never leak keys or details.
 */

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

/** How many candidates to generate per request. */
export const ILLUSTRATION_COUNT = 3;

const genericFailMessage = "Không tạo được ảnh lúc này. Thử lại nhé.";

/** Fixed studio prompt — neutral catalogue look, safe for any object/theme. */
function buildPrompt(objectName: string) {
  return `A clean studio product photograph of: ${objectName}.
Single object centred in frame, plain seamless neutral background, soft even
studio lighting, gentle shadow, sharp focus, true-to-life colours, museum
catalogue look. No text, no captions, no watermark, no logo, no people, no
hands. Square composition.`;
}

/**
 * Generate `ILLUSTRATION_COUNT` images for an object.
 * Returns `data:image/jpeg;base64,…` URIs. Assumes OPENAI_API_KEY is present
 * (the route checks this first).
 */
export async function generateObjectImages(
  objectName: string,
): Promise<string[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let data: OpenAI.Images.ImagesResponse["data"];
  try {
    const res = await client.images.generate({
      model: IMAGE_MODEL,
      prompt: buildPrompt(objectName.trim()),
      n: ILLUSTRATION_COUNT,
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
      output_compression: 80,
    });
    data = res.data;
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

  const images = (data ?? [])
    .map((d) => d.b64_json)
    .filter((b): b is string => typeof b === "string" && b.length > 0)
    .map((b) => `data:image/jpeg;base64,${b}`);

  if (images.length === 0) {
    throw new GenerationError("GENERATION_FAILED", genericFailMessage, 502);
  }

  return images;
}
