import { NextResponse } from "next/server";
import type { ApiError, Exhibition } from "@/lib/types";
import { GenerationError } from "@/lib/openai-exhibition";
import { synthesizeSpeech } from "@/lib/openai-tts";

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
 * POST /api/exhibitions/listen
 *
 * Body: `{ exhibition }`. Returns the narration as audio/mpeg (mp3) in a voice
 * matching the curator persona. Ephemeral — nothing is stored. Keys / provider
 * details are never exposed to the client.
 */
export async function POST(request: Request) {
  let body: { exhibition?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Body không phải JSON hợp lệ.", 400);
  }

  const ex = body.exhibition as Exhibition | undefined;
  if (!ex || typeof ex.object_name !== "string") {
    return errorResponse("VALIDATION_ERROR", "Thiếu nội dung triển lãm.", 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "INTERNAL_ERROR",
      "Server chưa cấu hình OPENAI_API_KEY. Vui lòng thử lại sau.",
      500,
    );
  }

  try {
    const audio = await synthesizeSpeech(ex);
    return new NextResponse(audio, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof GenerationError) {
      return errorResponse(err.code, err.publicMessage, err.status);
    }
    console.error("[listen] unexpected error:", err);
    return errorResponse(
      "GENERATION_FAILED",
      "Không tạo được âm thanh lúc này. Thử lại nhé.",
      500,
    );
  }
}
