import type { ImageCandidate } from "./types";

/**
 * Reusable prompt for the (future) LLM/vision scoring step. The deterministic
 * mock in scoring.ts mirrors these criteria so the UI works before any AI key
 * is configured. Replace `scoreImageMock` with a call that fills this template
 * and parses the strict-JSON response.
 */
export const IMAGE_SCORING_PROMPT = `You are an image curator for a Vietnamese cultural micro-museum app.

Given the user topic and image metadata, decide whether this image is relevant.

User topic:
{{topic}}

Image metadata:
Title: {{title}}
Description: {{description}}
Tags: {{tags}}
Source: {{source}}
License: {{license}}

Score the image from 0 to 100 using:
- Relevance to the topic
- Vietnamese cultural relevance
- Visual usefulness for a short educational article
- Risk of being generic, misleading, or unrelated
- License and attribution availability

Return strict JSON:
{
  "relevanceScore": number,
  "culturalScore": number,
  "visualQualityScore": number,
  "licenseScore": number,
  "finalScore": number,
  "shouldUse": boolean,
  "reason": string
}`;

/** Fill the prompt template with a topic + candidate metadata. */
export function buildScoringPrompt(topic: string, c: ImageCandidate): string {
  return IMAGE_SCORING_PROMPT.replace("{{topic}}", topic)
    .replace("{{title}}", c.title || "")
    .replace("{{description}}", c.description || "")
    .replace("{{tags}}", (c.tags ?? []).join(", "))
    .replace("{{source}}", c.source)
    .replace("{{license}}", c.license || "unknown");
}
