import OpenAI from "openai";
import { APIError, RateLimitError, AuthenticationError } from "openai";
import type { ChatMessage, Exhibition } from "./types";
import { GenerationError } from "./openai-exhibition";

/**
 * Answer a follow-up question about an exhibition's object, grounded in the
 * exhibition content and spoken in its curator voice. Ephemeral (not stored).
 */

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** Keep the conversation short to bound cost. */
const MAX_TURNS = 10;

const genericFailMessage = "Không trả lời được lúc này. Thử lại nhé.";

/** One-line tone per curator voice (mirrors the generator). */
const VOICE_TONE: Record<string, string> = {
  "Nhà nghiên cứu": "điềm đạm, chuẩn mực, có chiều sâu",
  "Bà kể chuyện": "ấm áp, hoài niệm, xưng hô thân mật",
  "Chú bán hàng": "đời, dí dỏm, gần gũi vỉa hè (không thô tục)",
  "Nhà thơ": "văn chương, giàu hình ảnh, có nhịp",
};

function buildSystemPrompt(ex: Exhibition): string {
  const voice = ex.voice ?? "Nhà nghiên cứu";
  const tone = VOICE_TONE[voice] ?? "điềm đạm, rõ ràng";
  return `Bạn là một curator của Bảo Tàng 1 Phút, đang trò chuyện với khách về một hiện vật đời thường.
Trả lời NGẮN GỌN (2-4 câu), thân thiện, dựa trên nội dung triển lãm bên dưới và kiến thức phổ thông đáng tin.
- Không bịa số liệu/năm/tên người cụ thể nếu không chắc; dùng ngôn ngữ thận trọng ("có thể", "thường được xem là").
- Bám chủ đề hiện vật và đời sống/văn hóa; nếu khách hỏi lạc đề, nhẹ nhàng kéo về hiện vật.
- Trả lời bằng tiếng Việt, theo GIỌNG KỂ "${voice}": ${tone}.

Nội dung triển lãm:
Hiện vật: ${ex.object_name}
Tiêu đề: ${ex.title}
Đây là gì: ${ex.what_it_is}
Bối cảnh: ${ex.origin_or_context}
Điều thú vị: ${ex.three_fun_facts.join(" | ")}
Góc nhìn: ${ex.design_or_cultural_insight}
Vì sao đáng chú ý: ${ex.why_it_matters}`;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Answer the latest question given the prior turns. Assumes OPENAI_API_KEY is
 * present (the route checks first).
 */
export async function answerQuestion(
  ex: Exhibition,
  history: ChatMessage[],
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const turns = history.slice(-MAX_TURNS);

  let raw: string | null | undefined;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.8,
      max_tokens: 320,
      messages: [
        { role: "system", content: buildSystemPrompt(ex) },
        ...turns.map((m) => ({ role: m.role, content: m.content })),
      ],
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
    throw new GenerationError("GENERATION_FAILED", genericFailMessage, 502);
  }
  return raw.trim();
}
