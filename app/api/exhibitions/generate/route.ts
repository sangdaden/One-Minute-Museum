import { NextResponse } from "next/server";
import type { ApiError, GenerateRequest, Mode, Voice } from "@/lib/types";
import { MODES, VOICES } from "@/lib/types";
import {
  OBJECT_NAME_MAX,
  DEFAULT_LANGUAGE,
  DEFAULT_VOICE,
  IMAGE_MAX_CHARS,
  IMAGE_DATA_URI_RE,
} from "@/lib/constants";
import { generateMockExhibition } from "@/lib/mock-exhibition";
import {
  generateExhibitionWithLLM,
  GenerationError,
} from "@/lib/openai-exhibition";

// The OpenAI SDK needs the Node.js runtime.
export const runtime = "nodejs";

function errorResponse(
  code: ApiError["error"]["code"],
  message: string,
  status: number,
) {
  return NextResponse.json<ApiError>({ error: { code, message } }, { status });
}

/**
 * POST /api/exhibitions/generate
 *
 * Validates the request and generates a mini exhibition (schema in
 * docs/prompt_spec.md) by calling the OpenAI API.
 *
 * Without OPENAI_API_KEY: falls back to a mock in development, or returns a
 * clear config error in production. Provider details / keys / stack traces are
 * never exposed to the client.
 */
export async function POST(request: Request) {
  let body: Partial<GenerateRequest>;

  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Body không phải JSON hợp lệ.", 400);
  }

  // --- Validation (docs/api_spec.md §2) ---
  const objectName =
    typeof body.object_name === "string" ? body.object_name.trim() : "";

  const image =
    typeof body.image === "string" && body.image.length > 0
      ? body.image
      : undefined;

  if (image) {
    // Photo path: validate the image; object_name is optional (model identifies).
    if (!IMAGE_DATA_URI_RE.test(image)) {
      return errorResponse("VALIDATION_ERROR", "Ảnh không hợp lệ.", 400);
    }
    if (image.length > IMAGE_MAX_CHARS) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Ảnh quá lớn. Thử lại với ảnh nhỏ hơn nhé.",
        400,
      );
    }
  } else if (objectName.length < 1 || objectName.length > OBJECT_NAME_MAX) {
    return errorResponse(
      "VALIDATION_ERROR",
      `Tên vật phải dài từ 1 đến ${OBJECT_NAME_MAX} ký tự.`,
      400,
    );
  }

  if (!MODES.includes(body.mode as Mode)) {
    return errorResponse(
      "VALIDATION_ERROR",
      `Mode không hợp lệ. Chọn một trong: ${MODES.join(", ")}.`,
      400,
    );
  }

  const language = body.language ?? DEFAULT_LANGUAGE;
  // Voice is additive & optional: unknown/missing falls back to default
  // (never an error) so older clients keep working.
  const voice: Voice = VOICES.includes(body.voice as Voice)
    ? (body.voice as Voice)
    : DEFAULT_VOICE;

  const validatedRequest: GenerateRequest = {
    object_name: objectName,
    mode: body.mode as Mode,
    voice,
    language,
    image,
  };

  // --- API key handling ---
  if (!process.env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      // Dev convenience: keep working with mock data when no key is set.
      const mock = generateMockExhibition(validatedRequest);
      return NextResponse.json(mock, {
        status: 200,
        headers: { "x-exhibition-source": "mock-fallback" },
      });
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Server chưa cấu hình OPENAI_API_KEY. Vui lòng thử lại sau.",
      500,
    );
  }

  // --- Real generation ---
  try {
    const exhibition = await generateExhibitionWithLLM(validatedRequest);
    return NextResponse.json(exhibition, { status: 200 });
  } catch (err) {
    if (err instanceof GenerationError) {
      return errorResponse(err.code, err.publicMessage, err.status);
    }
    // Unexpected error: log server-side, return a generic message.
    console.error("[generate] unexpected error:", err);
    return errorResponse(
      "GENERATION_FAILED",
      "Không tạo được triển lãm lúc này. Thử lại nhé.",
      500,
    );
  }
}
