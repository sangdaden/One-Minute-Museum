import type { Exhibition } from "./types";

/**
 * Format an exhibition as social-ready plain text for Facebook / LinkedIn.
 * Layout follows docs/coding_agent_instructions.md §10. Never emits raw JSON.
 *
 *   {title}
 *
 *   {hook}
 *
 *   3 điều thú vị:
 *   1. {fact1}
 *   2. {fact2}
 *   3. {fact3}
 *
 *   {why_it_matters}
 *
 *   Câu hỏi: {reflection_question}
 *
 *   #Tag1 #Tag2 #Tag3
 */
export function formatExhibitionForSocial(ex: Exhibition): string {
  const facts = (ex.three_fun_facts ?? [])
    .map((fact, i) => `${i + 1}. ${fact}`)
    .join("\n");

  // Each array entry becomes a single "#Tag"; tolerate stray leading "#".
  const hashtags = (ex.hashtags ?? [])
    .map((tag) => tag.replace(/^#+/, "").trim())
    .filter((tag) => tag.length > 0)
    .map((tag) => `#${tag}`)
    .join(" ");

  const blocks = [
    ex.title,
    ex.hook,
    ["3 điều thú vị:", facts].join("\n"),
    ex.why_it_matters,
    `Câu hỏi: ${ex.reflection_question}`,
  ];

  if (hashtags) blocks.push(hashtags);

  // Blank line between blocks.
  return blocks.join("\n\n");
}

/** @deprecated Use {@link formatExhibitionForSocial}. */
export const formatExhibitionForCopy = formatExhibitionForSocial;
