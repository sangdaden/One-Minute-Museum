import { NextResponse } from "next/server";
import type { ApiError, Exhibition } from "@/lib/types";
import { GenerationError } from "@/lib/openai-exhibition";
import { generateQuiz } from "@/lib/openai-quiz";
import { generateMockQuiz } from "@/lib/mock-quiz";

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
 * POST /api/exhibitions/quiz
 *
 * Body: `{ exhibition }`. Generates a short multiple-choice quiz from the
 * exhibition's own content. Returns `{ questions }`.
 *
 * Without OPENAI_API_KEY: dev → deterministic mock; prod → clear config error.
 * Keys / provider details are never exposed to the client.
 */
export async function POST(request: Request) {
  let body: { exhibition?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Body không phải JSON hợp lệ.", 400);
  }

  const ex = body.exhibition as Exhibition | undefined;
  if (
    !ex ||
    typeof ex.object_name !== "string" ||
    !Array.isArray(ex.three_fun_facts)
  ) {
    return errorResponse("VALIDATION_ERROR", "Thiếu nội dung triển lãm.", 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { questions: generateMockQuiz(ex) },
        { status: 200, headers: { "x-quiz-source": "mock-fallback" } },
      );
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Server chưa cấu hình OPENAI_API_KEY. Vui lòng thử lại sau.",
      500,
    );
  }

  try {
    const questions = await generateQuiz(ex);
    return NextResponse.json({ questions }, { status: 200 });
  } catch (err) {
    if (err instanceof GenerationError) {
      return errorResponse(err.code, err.publicMessage, err.status);
    }
    console.error("[quiz] unexpected error:", err);
    return errorResponse(
      "GENERATION_FAILED",
      "Không tạo được câu đố lúc này. Thử lại nhé.",
      500,
    );
  }
}
