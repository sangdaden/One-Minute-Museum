import type { ChatMessage, Exhibition } from "./types";

/**
 * Dev-only canned answer so the chat flow works without an OPENAI_API_KEY.
 */
export function mockAnswer(ex: Exhibition, history: ChatMessage[]): string {
  const last = [...history].reverse().find((m) => m.role === "user");
  const q = last?.content?.trim();
  return `(Bản dev — chưa cấu hình AI) "${ex.object_name}" đúng là một hiện vật thú vị!${
    q ? ` Bạn hỏi: "${q}".` : ""
  } Khi đã cấu hình OPENAI_API_KEY, mình sẽ trả lời cụ thể hơn nhé.`;
}
