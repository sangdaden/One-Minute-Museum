import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/types";
import { OBJECT_NAME_MAX } from "@/lib/constants";
import { GenerationError } from "@/lib/openai-exhibition";
import { generateObjectImages } from "@/lib/openai-illustration";
import { generateMockIllustrations } from "@/lib/mock-illustration";

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
 * POST /api/exhibitions/illustrate
 *
 * Generates a few AI sample images of an object so a user who didn't upload a
 * photo can pick one to attach. Returns `{ images: string[] }` (data URIs).
 *
 * Without OPENAI_API_KEY: dev → deterministic mock placeholders; prod → clear
 * config error. Keys / provider details are never exposed to the client.
 */
export async function POST(request: Request) {
  let body: { object_name?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Body không phải JSON hợp lệ.", 400);
  }

  const objectName =
    typeof body.object_name === "string" ? body.object_name.trim() : "";

  if (objectName.length < 1 || objectName.length > OBJECT_NAME_MAX) {
    return errorResponse(
      "VALIDATION_ERROR",
      `Tên vật phải dài từ 1 đến ${OBJECT_NAME_MAX} ký tự.`,
      400,
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { images: generateMockIllustrations(objectName) },
        { status: 200, headers: { "x-illustration-source": "mock-fallback" } },
      );
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Server chưa cấu hình OPENAI_API_KEY. Vui lòng thử lại sau.",
      500,
    );
  }

  try {
    const images = await generateObjectImages(objectName);
    return NextResponse.json({ images }, { status: 200 });
  } catch (err) {
    if (err instanceof GenerationError) {
      return errorResponse(err.code, err.publicMessage, err.status);
    }
    console.error("[illustrate] unexpected error:", err);
    return errorResponse(
      "GENERATION_FAILED",
      "Không tạo được ảnh lúc này. Thử lại nhé.",
      500,
    );
  }
}
