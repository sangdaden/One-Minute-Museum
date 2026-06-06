import { NextResponse } from "next/server";
import type { ApiError, GenerateRequest, Mode } from "@/lib/types";
import { MODES } from "@/lib/types";
import { OBJECT_NAME_MAX, DEFAULT_LANGUAGE } from "@/lib/constants";
import { generateMockExhibition } from "@/lib/mock-exhibition";

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
 * Validates the request and returns a mock exhibition matching the schema in
 * docs/prompt_spec.md. No real LLM is called yet — generateMockExhibition is a
 * drop-in stand-in for a future provider call.
 */
export async function POST(request: Request) {
  let body: Partial<GenerateRequest>;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "VALIDATION_ERROR",
      "Body không phải JSON hợp lệ.",
      400,
    );
  }

  const objectName = typeof body.object_name === "string"
    ? body.object_name.trim()
    : "";

  if (objectName.length < 1 || objectName.length > OBJECT_NAME_MAX) {
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

  try {
    const exhibition = generateMockExhibition({
      object_name: objectName,
      mode: body.mode as Mode,
      language,
    });
    return NextResponse.json(exhibition, { status: 200 });
  } catch {
    return errorResponse(
      "GENERATION_FAILED",
      "Không tạo được triển lãm lúc này. Thử lại nhé.",
      500,
    );
  }
}
