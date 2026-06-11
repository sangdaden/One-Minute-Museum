interface LogoProps {
  /** Optional slogan shown next to the mark (hidden on small screens). */
  tagline?: string;
  /** Extra classes — set the font-size here to scale the whole mark. */
  className?: string;
}

/**
 * OMM brand wordmark. "OMM" reads aloud like "Ôm" (to hug) — a nón lá sits over
 * the first O to spell it out. Presentational and server-safe (no hooks).
 * Colours use theme tokens so it adapts to light/dark.
 */
export default function Logo({ tagline, className }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-2.5 ${className ?? "text-[1.4rem]"}`}
    >
      <span className="font-serif font-extrabold leading-none tracking-[-0.04em] text-accent">
        <span className="relative inline-block">
          {/* nón lá / circumflex over the first O → "Ô" */}
          <svg
            aria-hidden
            viewBox="0 0 24 12"
            className="absolute left-1/2 top-[-0.32em] -translate-x-1/2 text-gold"
            style={{ width: "0.66em" }}
          >
            <path
              d="M3 9.5 Q12 1 21 9.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
            />
            <path
              d="M1.5 10.4 H22.5"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          </svg>
          O
        </span>
        MM
      </span>
      {tagline && (
        <span className="eyebrow hidden text-ink-faint sm:inline-block">
          {tagline}
        </span>
      )}
    </span>
  );
}
