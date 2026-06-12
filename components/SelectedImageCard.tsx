"use client";

import { useState } from "react";
import type { ImageCandidate, ImageRelevanceScore } from "@/lib/image-curation";
import ImageCredits from "./ImageCredits";

/**
 * A curated-image card (Heritage Warm). Shows the image with a warm gradient
 * fallback (never a broken image), the title, and full attribution credits.
 */
export default function SelectedImageCard({
  candidate,
  score,
}: {
  candidate: ImageCandidate;
  score?: ImageRelevanceScore;
}) {
  const [failed, setFailed] = useState(false);
  const src = candidate.thumbnailUrl || candidate.imageUrl;

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-paper-card shadow-[0_12px_32px_-18px_rgba(47,38,33,0.18)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-sunk">
        {!failed && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={candidate.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-paper-sunk), color-mix(in srgb, var(--color-gold) 28%, var(--color-paper-card)))",
            }}
          >
            <span className="font-serif text-4xl text-gold/60">❦</span>
          </div>
        )}
        {score && (
          <span className="eyebrow absolute right-2 top-2 rounded-full bg-paper-card/90 px-2 py-1 tabular-nums text-ink-soft">
            {score.finalScore}/100
          </span>
        )}
      </div>
      <figcaption className="space-y-2 p-4">
        <h3 className="font-serif text-base font-semibold leading-snug text-ink">
          {candidate.title}
        </h3>
        {candidate.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {candidate.description}
          </p>
        )}
        <ImageCredits credit={candidate} reason={score?.reason} />
      </figcaption>
    </figure>
  );
}
