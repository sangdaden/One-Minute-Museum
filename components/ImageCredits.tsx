import { ExternalLink } from "lucide-react";
import type { ImageCredit } from "@/lib/types";
import ImageSourceBadge from "./ImageSourceBadge";

/**
 * Attribution block for a curated image: source, author, license, source link,
 * and (optionally) why it was selected. Never hide attribution.
 */
export default function ImageCredits({
  credit,
  reason,
}: {
  credit: ImageCredit;
  reason?: string;
}) {
  return (
    <div className="space-y-1.5 text-xs text-ink-soft">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ImageSourceBadge source={credit.source} />
        {credit.author && <span>· {credit.author}</span>}
        {credit.license && <span>· {credit.license}</span>}
      </div>
      <a
        href={credit.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 text-teal transition-colors hover:underline"
      >
        Nguồn
        <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </a>
      {reason && <p className="leading-relaxed text-ink-faint">{reason}</p>}
    </div>
  );
}
