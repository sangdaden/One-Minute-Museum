import OpenAI from "openai";
import { APIError, RateLimitError, AuthenticationError } from "openai";
import type { ApiErrorCode, Exhibition, GenerateRequest } from "./types";
import { DEFAULT_LANGUAGE, DEFAULT_VOICE } from "./constants";

/**
 * Real LLM-backed exhibition generator.
 *
 * Prompts and JSON schema follow docs/prompt_spec.md. The model is asked to
 * return strict JSON (Structured Outputs); we still parse + validate defensively
 * before trusting the payload.
 */

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/**
 * Carries a public-safe error code + message up to the route handler.
 * Never put raw provider errors / stack traces in `publicMessage`.
 */
export class GenerationError extends Error {
  code: ApiErrorCode;
  status: number;
  publicMessage: string;

  constructor(code: ApiErrorCode, publicMessage: string, status: number) {
    super(publicMessage);
    this.name = "GenerationError";
    this.code = code;
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

// System prompt — docs/prompt_spec.md §1.
const SYSTEM_PROMPT = `Bạn là một curator của một bảo tàng hiện đại, có khả năng biến những vật bình thường trong đời sống thành các triển lãm mini thú vị, dễ hiểu và có chiều sâu.

Nhiệm vụ của bạn:
- Biến một vật thể đời thường thành một mini exhibition có thể đọc trong khoảng 1 phút.
- Viết hấp dẫn, gợi tò mò, không quá học thuật.
- Ưu tiên góc nhìn thiết kế, văn hóa, lịch sử đời sống và hành vi con người.
- Không bịa thông tin cụ thể như năm tháng, người phát minh, số liệu nếu không chắc.
- Nếu nguồn gốc/lịch sử không chắc chắn, hãy dùng ngôn ngữ thận trọng như "có thể", "thường được gắn với", "được xem là".
- Không đưa ra claim nguy hiểm, y tế, pháp lý hoặc khoa học quá chắc chắn nếu không có cơ sở.
- Output phải là JSON hợp lệ, không markdown, không giải thích ngoài JSON.`;

// User prompt template — docs/prompt_spec.md §2.
function buildUserPrompt(
  objectName: string,
  language: string,
  mode: string,
  voice: string,
) {
  return `Hãy tạo một mini exhibition cho vật thể sau.

Vật thể: ${objectName}
Ngôn ngữ: ${language}
Mode: ${mode}
Giọng kể: ${voice}

Giải thích mode (kể ĐIỀU GÌ):
- Vietnamese Culture: liên hệ đời sống Việt Nam, ký ức tập thể, cách vật này xuất hiện trong sinh hoạt hằng ngày.
- Museum: trang trọng, giàu hình ảnh, giống bảng mô tả trong bảo tàng hiện đại.
- Fun Fact: vui, ngắn, dễ share, có chút hài hước nhẹ.
- Design: phân tích vật như một sản phẩm: vật liệu, hình dáng, pain point, use case, trade-off thiết kế.

Giải thích giọng kể (kể BẰNG GIỌNG AI — chỉ đổi tone, không đổi nội dung mode):
- Nhà nghiên cứu: điềm đạm, chuẩn mực, có chiều sâu; ngôn ngữ sáng rõ, tôn trọng sự thật.
- Bà kể chuyện: ấm áp, hoài niệm, như người bà kể cho cháu; dùng "hồi đó", "ngày xưa", xưng hô thân mật.
- Chú bán hàng: đời, dí dỏm, gần gũi kiểu quán xá vỉa hè; câu ngắn, ví von đời thường, tếu nhẹ — không thô tục.
- Nhà thơ: văn chương, giàu hình ảnh, có nhịp điệu và ẩn dụ nhẹ; vẫn rõ nghĩa, không sáo rỗng.

Ràng buộc:
- title ngắn gọn, có tên vật.
- hook tối đa 2 câu.
- mỗi fun fact tối đa 1-2 câu, cần đúng 3 fun fact.
- reflection_question phải gợi suy nghĩ, không quá nghiêm trọng.
- share_quote tối đa 20 từ.
- hashtags không dấu hoặc tiếng Anh, dễ dùng trên social, từ 2 đến 5 cái.
- QUAN TRỌNG: Giọng kể chỉ thay đổi cách diễn đạt và lựa chọn từ ngữ, KHÔNG thay đổi tính chính xác hay mức độ chắc chắn của thông tin. Vẫn dùng ngôn ngữ thận trọng khi không chắc, không bịa năm tháng/người/số liệu, và vẫn đúng JSON schema.`;
}

/**
 * JSON schema for Structured Outputs. Mirrors docs/prompt_spec.md §3.
 * Note: OpenAI strict mode does not support minItems/maxItems, so array
 * cardinality is enforced in `validateContent` after parsing.
 */
const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "hook",
    "what_it_is",
    "origin_or_context",
    "three_fun_facts",
    "design_or_cultural_insight",
    "why_it_matters",
    "reflection_question",
    "share_quote",
    "hashtags",
  ],
  properties: {
    title: { type: "string" },
    hook: { type: "string" },
    what_it_is: { type: "string" },
    origin_or_context: { type: "string" },
    three_fun_facts: { type: "array", items: { type: "string" } },
    design_or_cultural_insight: { type: "string" },
    why_it_matters: { type: "string" },
    reflection_question: { type: "string" },
    share_quote: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
  },
} as const;

type ExhibitionContent = Omit<
  Exhibition,
  "id" | "object_name" | "mode" | "language" | "created_at"
>;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/** Validate the parsed model output against the expected schema shape. */
function validateContent(data: unknown): ExhibitionContent {
  if (typeof data !== "object" || data === null) {
    throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
  }
  const o = data as Record<string, unknown>;

  const stringFields = [
    "title",
    "hook",
    "what_it_is",
    "origin_or_context",
    "design_or_cultural_insight",
    "why_it_matters",
    "reflection_question",
    "share_quote",
  ] as const;

  for (const field of stringFields) {
    if (!isNonEmptyString(o[field])) {
      throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
    }
  }

  if (!isStringArray(o.three_fun_facts) || o.three_fun_facts.length === 0) {
    throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
  }
  if (!isStringArray(o.hashtags) || o.hashtags.length === 0) {
    throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
  }

  // The model sometimes returns tags already prefixed with "#". Store them bare
  // so the UI/copy layer can add a single "#" without producing "##".
  const hashtags = o.hashtags
    .map((tag) => tag.replace(/^#+/, "").trim())
    .filter((tag) => tag.length > 0);
  if (hashtags.length === 0) {
    throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
  }

  return {
    title: o.title as string,
    hook: o.hook as string,
    what_it_is: o.what_it_is as string,
    origin_or_context: o.origin_or_context as string,
    three_fun_facts: o.three_fun_facts,
    design_or_cultural_insight: o.design_or_cultural_insight as string,
    why_it_matters: o.why_it_matters as string,
    reflection_question: o.reflection_question as string,
    share_quote: o.share_quote as string,
    hashtags,
  };
}

const invalidJsonMessage = "Model trả về dữ liệu không hợp lệ. Thử lại nhé.";
const genericFailMessage = "Không tạo được triển lãm lúc này. Thử lại nhé.";

/**
 * Generate an exhibition via the OpenAI API.
 * Assumes OPENAI_API_KEY is present (the route checks this first).
 */
export async function generateExhibitionWithLLM(
  req: GenerateRequest,
): Promise<Exhibition> {
  const objectName = req.object_name.trim();
  const language = req.language ?? DEFAULT_LANGUAGE;
  const voice = req.voice ?? DEFAULT_VOICE;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let raw: string | null | undefined;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.85,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildUserPrompt(objectName, language, req.mode, voice),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "exhibition",
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
    });
    raw = completion.choices[0]?.message?.content;
  } catch (err) {
    // Map known provider errors to public-safe codes; never leak details.
    if (err instanceof RateLimitError) {
      throw new GenerationError(
        "RATE_LIMITED",
        "Hệ thống đang bận. Thử lại sau một chút nhé.",
        429,
      );
    }
    if (err instanceof AuthenticationError) {
      // Bad/expired key is a server config problem, not the user's fault.
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
    throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GenerationError("INVALID_JSON", invalidJsonMessage, 502);
  }

  const content = validateContent(parsed);

  return {
    id: crypto.randomUUID(),
    object_name: objectName,
    mode: req.mode,
    voice,
    language,
    created_at: new Date().toISOString(),
    ...content,
  };
}
