/** Skeleton shown while an exhibition is generating (docs/ui_spec.md §5). */
export default function LoadingExhibition() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-pulse rounded-2xl border border-border bg-paper-card p-8 sm:p-10"
    >
      <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Đang dựng triển lãm…
      </p>

      {/* Title bar */}
      <div className="mb-6 h-9 w-3/4 rounded-md bg-border" />

      {/* Quote block */}
      <div className="mb-8 space-y-2 border-l-4 border-border pl-4">
        <div className="h-4 w-full rounded bg-border" />
        <div className="h-4 w-5/6 rounded bg-border" />
      </div>

      {/* 3 fact cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 rounded-xl bg-paper p-4">
            <div className="h-3 w-full rounded bg-border" />
            <div className="h-3 w-4/5 rounded bg-border" />
            <div className="h-3 w-3/5 rounded bg-border" />
          </div>
        ))}
      </div>

      <span className="sr-only">Đang tạo nội dung triển lãm</span>
    </div>
  );
}
