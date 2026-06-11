import type { Exhibition, QuizQuestion } from "./types";

/**
 * Dev-only deterministic quiz so the flow works without an OPENAI_API_KEY.
 * Derives questions from the exhibition's own fields.
 */
export function generateMockQuiz(ex: Exhibition): QuizQuestion[] {
  const fact0 = ex.three_fun_facts[0] ?? "Một điều thú vị về vật này.";
  const fact1 = ex.three_fun_facts[1] ?? "Một điều thú vị khác.";

  return [
    {
      question: `Triển lãm này nói về hiện vật nào?`,
      options: [ex.object_name, "Một vật khác", "Không rõ", "Tất cả đều sai"],
      answer_index: 0,
      explanation: `Hiện vật của triển lãm là "${ex.object_name}".`,
    },
    {
      question: `Triển lãm nhìn hiện vật chủ yếu dưới góc nhìn nào?`,
      options: ["Ẩm thực", ex.mode, "Thể thao", "Âm nhạc"],
      answer_index: 1,
      explanation: `Góc nhìn được dùng là "${ex.mode}".`,
    },
    {
      question: `Đâu là một điều thú vị được nhắc tới?`,
      options: [
        "Không có thật",
        "Chưa rõ",
        fact0.slice(0, 70),
        "Tất cả đều sai",
      ],
      answer_index: 2,
      explanation: fact0,
    },
    {
      question: `Điều nào sau đây cũng xuất hiện trong triển lãm?`,
      options: [fact1.slice(0, 70), "Một điều bịa đặt", "Không liên quan", "Sai hết"],
      answer_index: 0,
      explanation: fact1,
    },
  ];
}
