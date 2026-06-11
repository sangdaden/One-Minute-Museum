import OpenAI from "openai";
import { APIError, RateLimitError, AuthenticationError } from "openai";
import type { Exhibition, QuizQuestion } from "./types";
import { GenerationError } from "./openai-exhibition";

/**
 * Generate a short multiple-choice quiz from an exhibition's own content.
 * Mirrors the error-mapping discipline of `openai-exhibition.ts`.
 */

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** How many questions per quiz. */
export const QUIZ_COUNT = 4;

const genericFailMessage = "Không tạo được câu đố lúc này. Thử lại nhé.";
const invalidMessage = "Model trả về dữ liệu không hợp lệ. Thử lại nhé.";

const SYSTEM_PROMPT = `Bạn là người tạo câu đố trắc nghiệm vui, ngắn gọn dựa trên nội dung một triển lãm mini về một vật đời thường ở Việt Nam.
- Chỉ hỏi những gì CÓ trong nội dung được cung cấp; không bịa thêm dữ kiện ngoài.
- Câu hỏi rõ ràng, vui, không quá khó.
- Mỗi câu đúng 4 lựa chọn ngắn gọn, chỉ 1 đáp án đúng; đa dạng vị trí đáp án đúng.
- Output là JSON hợp lệ, không markdown, không giải thích ngoài JSON.`;

function buildPrompt(ex: Exhibition, count: number) {
  return `Tạo đúng ${count} câu đố trắc nghiệm (tiếng Việt) dựa trên triển lãm sau.

Vật thể: ${ex.object_name}
Đây là gì: ${ex.what_it_is}
Bối cảnh: ${ex.origin_or_context}
Điều thú vị:
- ${ex.three_fun_facts.join("\n- ")}
Góc nhìn thiết kế/văn hóa: ${ex.design_or_cultural_insight}
Vì sao đáng chú ý: ${ex.why_it_matters}

Mỗi câu cần:
- "question": câu hỏi vui, rõ ràng, dựa trên nội dung trên.
- "options": đúng 4 lựa chọn ngắn gọn, chỉ 1 đúng.
- "answer_index": chỉ số 0-3 của đáp án đúng.
- "explanation": 1 câu giải thích ngắn vì sao đúng.`;
}

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "answer_index", "explanation"],
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer_index: { type: "integer" },
          explanation: { type: "string" },
        },
      },
    },
  },
} as const;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Validate + sanitise the model output into usable quiz questions. */
function validateQuiz(data: unknown): QuizQuestion[] {
  const o = data as { questions?: unknown };
  if (!o || !Array.isArray(o.questions)) {
    throw new GenerationError("INVALID_JSON", invalidMessage, 502);
  }

  const questions: QuizQuestion[] = [];
  for (const raw of o.questions) {
    if (typeof raw !== "object" || raw === null) continue;
    const q = raw as Record<string, unknown>;
    const options = Array.isArray(q.options)
      ? q.options.filter(isNonEmptyString).slice(0, 4)
      : [];
    const answer = q.answer_index;
    if (
      !isNonEmptyString(q.question) ||
      options.length < 2 ||
      typeof answer !== "number" ||
      answer < 0 ||
      answer >= options.length
    ) {
      continue;
    }
    questions.push({
      question: q.question.trim(),
      options,
      answer_index: answer,
      explanation: isNonEmptyString(q.explanation) ? q.explanation.trim() : "",
    });
  }

  if (questions.length === 0) {
    throw new GenerationError("INVALID_JSON", invalidMessage, 502);
  }
  return questions;
}

/**
 * Generate a quiz from an exhibition. Assumes OPENAI_API_KEY is present
 * (the route checks first).
 */
export async function generateQuiz(ex: Exhibition): Promise<QuizQuestion[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let raw: string | null | undefined;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(ex, QUIZ_COUNT) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "quiz", strict: true, schema: RESPONSE_SCHEMA },
      },
    });
    raw = completion.choices[0]?.message?.content;
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

  if (!isNonEmptyString(raw)) {
    throw new GenerationError("INVALID_JSON", invalidMessage, 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GenerationError("INVALID_JSON", invalidMessage, 502);
  }

  return validateQuiz(parsed).slice(0, QUIZ_COUNT);
}
