/**
 * Faint Đông Sơn drum medallion — concentric rings + a central star — used as a
 * background watermark. Decorative only. Colour via currentColor (set text-gold
 * + an opacity on the wrapper).
 */
export default function DongSonWatermark({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={`pointer-events-none ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="58" />
      <circle cx="100" cy="100" r="34" />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 34;
        const y = 100 + Math.sin(a) * 34;
        return <line key={i} x1="100" y1="100" x2={x} y2={y} />;
      })}
      {/* central 14-point star */}
      <circle cx="100" cy="100" r="10" />
    </svg>
  );
}
