import type { ImageCandidate, ImageRelevanceScore } from "./types";

/**
 * Image relevance scoring.
 *
 *   finalScore = relevance*0.50 + cultural*0.20 + visual*0.20 + license*0.10
 *
 * Relevance-led on purpose: this app catalogs everyday Vietnamese objects, not
 * only heritage artefacts, so "is this a real photo of the object" matters more
 * than "is it overtly cultural". Cultural is a tie-breaker, not a gate.
 *
 * Keep an image only when finalScore >= MIN_FINAL_SCORE, it has a sourceUrl,
 * and license/attribution metadata is present.
 *
 * `scoreImageMock` is a deterministic heuristic so the pipeline works with no AI
 * key. TODO: replace with an LLM/vision call using buildScoringPrompt() +
 * IMAGE_SCORING_PROMPT (prompt.ts), parsing the strict-JSON response.
 */

export const WEIGHTS = {
  relevance: 0.5,
  cultural: 0.2,
  visual: 0.2,
  license: 0.1,
} as const;

export const MIN_FINAL_SCORE = 55;

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
  // A candidate only reaches scoring because a provider's full-text search
  // already matched the query, so give it a relevance floor. Term overlap is a
  // bonus on top — without it, Vietnamese topics never match English Commons
  // titles and every real result gets unfairly filtered out.
  const relevanceScore = topicWords.length
    ? clamp(60 + (matches / topicWords.length) * 40)
    : 65;

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

  const cultureNote =
    culturalScore >= 60 ? `, đậm yếu tố văn hoá Việt (${culturalScore}/100)` : "";
  const reason = shouldUse
    ? `Khớp chủ đề (${relevanceScore}/100)${cultureNote}; nguồn ${c.source} có dẫn nguồn + giấy phép.`
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
