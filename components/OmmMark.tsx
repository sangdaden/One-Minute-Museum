/**
 * The OMM wordmark rendered with inline px styles so html-to-image can capture
 * it deterministically inside the export artwork (share card / flashcards).
 * Mirrors the on-screen Logo: "OMM" with a nón lá over the first O → "Ôm".
 */
export default function OmmMark({
  size = 40,
  color,
  nonColor,
}: {
  /** Font size in px. */
  size?: number;
  /** Letter colour. */
  color: string;
  /** Nón lá colour. */
  nonColor: string;
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color,
      }}
    >
      <span style={{ position: "relative", display: "inline-block" }}>
        <svg
          viewBox="0 0 24 12"
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "-0.34em",
            transform: "translateX(-50%)",
            width: "0.66em",
            color: nonColor,
          }}
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
  );
}
