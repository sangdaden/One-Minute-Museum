import type { ImageCandidate, ImageRelevanceScore } from "./types";

/**
 * Image relevance scoring.
 *
 *   finalScore = relevance*0.45 + cultural*0.30 + visual*0.15 + license*0.10
 *
 * Keep an image only when finalScore >= MIN_FINAL_SCORE, it has a sourceUrl,
 * and license/attribution metadata is present.
 *
 * `scoreImageMock` is a deterministic heuristic so the pipeline works with no AI
 * key. TODO: replace with an LLM/vision call using buildScoringPrompt() +
 * IMAGE_SCORING_PROMPT (prompt.ts), parsing the strict-JSON response.
 */

export const WEIGHTS = {
  relevance: 0.45,
  cultural: 0.3,
  visual: 0.15,
  license: 0.1,
} as const;

export const MIN_FINAL_SCORE = 75;

const CULTURAL_TERMS = [
  "việt", "vietnam", "vietnamese", "đông sơn", "dong son", "huế", "hue",
  "hội an", "hoi an", "áo dài", "ao dai", "trống đồng", "trong dong",
  "múa rối", "mua roi", "water puppet", "heritage", "temple", "pagoda",
  "lotus", "sen", "lantern", "đèn lồng", "imperial", "folk", "traditional",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreImageMock(
  topic: string,
  c: ImageCandidate,
): ImageRelevanceScore {
  const hay = `${c.title} ${c.description ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase();
  const topicWords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  const matches = topicWords.filter((w) => hay.includes(w)).length;
  const relevanceScore = topicWords.length
    ? clamp((matches / topicWords.length) * 100)
    : 50;

  const culturalHits = CULTURAL_TERMS.filter((term) => hay.includes(term)).length;
  const culturalScore = clamp(
    35 + culturalHits * 18 + (c.source === "wikimedia" ? 15 : 0),
  );

  const visualQualityScore = c.thumbnailUrl ? 80 : 70;

  const hasAttribution = Boolean(c.license) && Boolean(c.author);
  const licenseScore = !c.sourceUrl ? 0 : hasAttribution ? 100 : 55;

  const finalScore = clamp(
    relevanceScore * WEIGHTS.relevance +
      culturalScore * WEIGHTS.cultural +
      visualQualityScore * WEIGHTS.visual +
      licenseScore * WEIGHTS.license,
  );

  const shouldUse =
    finalScore >= MIN_FINAL_SCORE && Boolean(c.sourceUrl) && licenseScore > 0;

  const reason = shouldUse
    ? `Khớp chủ đề (${relevanceScore}/100) và có yếu tố văn hoá Việt (${culturalScore}/100); nguồn ${c.source} có dẫn nguồn + giấy phép.`
    : `Điểm tổng ${finalScore} dưới ngưỡng ${MIN_FINAL_SCORE}, hoặc thiếu dẫn nguồn/giấy phép.`;

  return {
    imageId: c.id,
    relevanceScore,
    culturalScore,
    visualQualityScore,
    licenseScore,
    finalScore,
    shouldUse,
    reason,
  };
}
