// Normalized types for the image curation pipeline. Provider logic and scoring
// stay decoupled from UI; everything flows through ImageCandidate.

export type ImageSource = "wikimedia" | "unsplash" | "pexels" | "user_upload";

/** A normalized image result from any provider. */
export interface ImageCandidate {
  id: string;
  source: ImageSource;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  tags?: string[];
  author?: string;
  license?: string;
  /** Always present — link back to the source page (attribution requirement). */
  sourceUrl: string;
}

/** Per-image relevance scoring (see scoring.ts for the weighting). */
export interface ImageRelevanceScore {
  imageId: string;
  relevanceScore: number;
  culturalScore: number;
  visualQualityScore: number;
  licenseScore: number;
  finalScore: number;
  shouldUse: boolean;
  reason: string;
}

/** A candidate paired with its score (what the pipeline returns). */
export interface ScoredImage {
  candidate: ImageCandidate;
  score: ImageRelevanceScore;
}

/** Every provider exposes a single normalized search method. */
export interface ImageProvider {
  readonly source: ImageSource;
  search(query: string, limit?: number): Promise<ImageCandidate[]>;
}
