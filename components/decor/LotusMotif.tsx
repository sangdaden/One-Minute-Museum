/**
 * Simple lotus silhouette for hero/footer decoration. Decorative only.
 */
export default function LotusMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 48"
      className={`pointer-events-none ${className ?? ""}`}
      fill="currentColor"
    >
      <path d="M32 44c-10 0-20-6-20-16 6 0 11 3 14 7-2-7 1-15 6-23 5 8 8 16 6 23 3-4 8-7 14-7 0 10-10 16-20 16z" opacity="0.5" />
      <path d="M32 44c-5 0-10-5-10-14 5 1 9 6 10 13 1-7 5-12 10-13 0 9-5 14-10 14z" />
    </svg>
  );
}
