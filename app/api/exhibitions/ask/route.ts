import { NextResponse } from "next/server";
import type { ApiError, ChatMessage, Exhibition } from "@/lib/types";
import { GenerationError } from "@/lib/openai-exhibition";
import { answerQuestion } from "@/lib/openai-ask";
import { mockAnswer } from "@/lib/mock-ask";

// The OpenAI SDK needs the Node.js runtime.
export const runtime = "nodejs";

function errorResponse(
  code: ApiError["error"]["code"],
  message: string,
  status: number,
) {
  return NextResponse.json<ApiError>({ error: { code, message } }, { status });
}

const MAX_LEN = 1000;

/**
 * POST /api/exhibitions/ask
 *
 * Body: `{ exhibition, messages }`. Answers the latest user question about the
 * object, grounded in the exhibition and spoken in its voice. Returns `{ answer }`.
 * Ephemeral — nothing is stored. Keys / provider details are never exposed.
 */
export async function POST(request: Request) {
  let body: { exhibition?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Body không phải JSON hợp lệ.", 400);
  }

  const ex = body.exhibition as Exhibition | undefined;
  if (!ex || typeof ex.object_name !== "string") {
    return errorResponse("VALIDATION_ERROR", "Thiếu nội dung triển lãm.", 400);
  }

  // Sanitise the conversation: only user/assistant turns with non-empty content.
  const messages: ChatMessage[] = Array.isArray(body.messages)
    ? (body.messages as unknown[])
        .map((m) => m as { role?: unknown; content?: unknown })
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim().length > 0,
        )
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: (m.content as string).slice(0, MAX_LEN),
        }))
    : [];

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return errorResponse("VALIDATION_ERROR", "Thiếu câu hỏi.", 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { answer: mockAnswer(ex, messages) },
        { status: 200, headers: { "x-ask-source": "mock-fallback" } },
      );
    }
    return errorResponse(
      "INTERNAL_ERROR",
      "Server chưa cấu hình OPENAI_API_KEY. Vui lòng thử lại sau.",
      500,
    );
  }

  try {
    const answer = await answerQuestion(ex, messages);
    return NextResponse.json({ answer }, { status: 200 });
  } catch (err) {
    if (err instanceof GenerationError) {
      return errorResponse(err.code, err.publicMessage, err.status);
    }
    console.error("[ask] unexpected error:", err);
    return errorResponse(
      "GENERATION_FAILED",
      "Không trả lời được lúc này. Thử lại nhé.",
      500,
    );
  }
}
