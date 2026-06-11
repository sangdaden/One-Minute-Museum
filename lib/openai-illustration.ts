import OpenAI from "openai";
import { APIError, RateLimitError, AuthenticationError } from "openai";
import { GenerationError } from "./openai-exhibition";

/**
 * AI sample illustrations for an object (used when the user didn't upload a
 * photo). Each generation returns a few images in DIFFERENT art styles so the
 * user sees variety and can pick one.
 *
 * Mirrors the error-mapping discipline of `openai-exhibition.ts`: provider
 * errors are mapped to public-safe codes/messages — never leak keys or details.
 */

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

/** How many candidates (= distinct styles) to generate per request. */
export const ILLUSTRATION_COUNT = 3;

const genericFailMessage = "Không tạo được ảnh lúc này. Thử lại nhé.";

/** A generated candidate: the image data URI + which style produced it. */
export interface Illustration {
  url: string;
  style: string;
}

/**
 * The style palette. `id` is keyed to the `Styles` i18n namespace for display;
 * `descriptor` steers the image model. Composition is kept constant so only the
 * rendering style changes.
 */
export const STYLES: { id: string; descriptor: string }[] = [
  {
    id: "handdrawn",
    descriptor:
      "loose hand-drawn illustration with visible pencil and ink strokes, sketchbook texture, light watercolor washes",
  },
  {
    id: "realistic",
    descriptor:
      "photorealistic product photograph, true-to-life detail and materials, soft studio lighting, gentle shadow",
  },
  {
    id: "cartoon",
    descriptor:
      "playful cartoon and caricature illustration, bold clean outlines, friendly exaggerated shapes, flat cel shading, cheerful colors",
  },
  {
    id: "abstract",
    descriptor:
      "abstract artistic interpretation, bold geometric shapes and expressive colors, non-literal modern-art feel",
  },
  {
    id: "classical",
    descriptor:
      "classical fine-art oil painting, refined still life, rich brushwork and warm museum lighting",
  },
  {
    id: "minimal",
    descriptor:
      "minimalist illustration, simple flat shapes, very limited palette, lots of negative space, clean and calm",
  },
  {
    id: "spatial",
    descriptor:
      "3D rendered graphic, soft dimensional clay-like render, isometric depth and volume, smooth studio shading",
  },
];

function buildPrompt(objectName: string, descriptor: string) {
  return `An image of: ${objectName}.
Single object centred in frame, plain neutral background, no text, no captions,
no watermark, no logo, no people, no hands. Square composition.
Art style: ${descriptor}.`;
}

/** Fisher–Yates pick of `n` distinct styles. */
function pickStyles(n: number) {
  const pool = [...STYLES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function mapError(err: unknown): GenerationError {
  if (err instanceof RateLimitError)
    return new GenerationError(
      "RATE_LIMITED",
      "Hệ thống đang bận. Thử lại sau một chút nhé.",
      429,
    );
  if (err instanceof AuthenticationError)
    return new GenerationError(
      "INTERNAL_ERROR",
      "Server chưa được cấu hình đúng. Vui lòng thử lại sau.",
      500,
    );
  if (err instanceof APIError)
    return new GenerationError("GENERATION_FAILED", genericFailMessage, 502);
  return new GenerationError("GENERATION_FAILED", genericFailMessage, 500);
}

/**
 * Generate `ILLUSTRATION_COUNT` images, each in a different style.
 * Runs one request per style in parallel; tolerates partial failures (returns
 * the successes). Assumes OPENAI_API_KEY is present (the route checks first).
 */
export async function generateObjectImages(
  objectName: string,
): Promise<Illustration[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const name = objectName.trim();
  const styles = pickStyles(ILLUSTRATION_COUNT);

  const results = await Promise.allSettled(
    styles.map((style) =>
      client.images
        .generate({
          model: IMAGE_MODEL,
          prompt: buildPrompt(name, style.descriptor),
          n: 1,
          size: "1024x1024",
          quality: "low",
          output_format: "jpeg",
          output_compression: 80,
        })
        .then((res): Illustration => {
          const b64 = res.data?.[0]?.b64_json;
          if (!b64) throw new Error("no image data");
          return { url: `data:image/jpeg;base64,${b64}`, style: style.id };
        }),
    ),
  );

  const images = results
    .filter(
      (r): r is PromiseFulfilledResult<Illustration> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  if (images.length === 0) {
    // Surface a representative provider error if every request failed.
    const firstRejected = results.find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    throw mapError(firstRejected?.reason);
  }

  return images;
}
