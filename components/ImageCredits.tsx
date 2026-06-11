import { ExternalLink } from "lucide-react";
import type { ImageCandidate, ImageRelevanceScore } from "@/lib/image-curation";
import ImageSourceBadge from "./ImageSourceBadge";

/**
 * Attribution block for a curated image: source, author, license, source link,
 * and (optionally) why it was selected. Never hide attribution.
 */
export default function ImageCredits({
  candidate,
  score,
}: {
  candidate: ImageCandidate;
  score?: ImageRelevanceScore;
}) {
  return (
    <div className="space-y-1.5 text-xs text-ink-soft">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ImageSourceBadge source={candidate.source} />
        {candidate.author && <span>· {candidate.author}</span>}
        {candidate.license && <span>· {candidate.license}</span>}
      </div>
      <a
        href={candidate.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 text-teal transition-colors hover:underline"
      >
        Nguồn
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </a>
      {score?.reason && (
        <p className="leading-relaxed text-ink-faint">{score.reason}</p>
      )}
    </div>
  );
}
