import type { Exhibition } from "./types";

/**
 * Format an exhibition as social-ready plain text.
 * Layout follows docs/coding_agent_instructions.md §10.
 */
export function formatExhibitionForCopy(ex: Exhibition): string {
  const facts = ex.three_fun_facts
    .map((fact, i) => `${i + 1}. ${fact}`)
    .join("\n");

  const hashtags = ex.hashtags.map((tag) => `#${tag}`).join(" ");

  return [
    ex.title,
    "",
    ex.hook,
    "",
    "3 điều thú vị:",
    facts,
    "",
    ex.why_it_matters,
    "",
    `Câu hỏi: ${ex.reflection_question}`,
    "",
    hashtags,
  ].join("\n");
}
