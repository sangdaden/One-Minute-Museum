/** Skeleton shown while an exhibition is generating (docs/ui_spec.md §5). */
export default function LoadingExhibition() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative bg-paper-card shadow-[0_1px_2px_rgba(27,22,17,0.05),0_18px_40px_-24px_rgba(27,22,17,0.35)] ring-1 ring-border"
    >
      <div className="pointer-events-none absolute inset-[7px] border border-border/70" />

      <div className="relative px-6 py-7 sm:px-10 sm:py-11">
        <div className="mb-7 flex items-center justify-between">
          <span className="eyebrow inline-flex items-center gap-2 text-accent">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Đang dựng triển lãm…
          </span>
          <span className="shimmer h-2.5 w-16 rounded" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <div className="shimmer h-9 w-4/5 rounded" />
          <div className="shimmer h-9 w-2/5 rounded" />
        </div>

        {/* Quote */}
        <div className="my-8 space-y-2.5 border-l-2 border-border-strong pl-5">
          <div className="shimmer h-4 w-full rounded" />
          <div className="shimmer h-4 w-5/6 rounded" />
        </div>

        {/* Sections */}
        <div className="space-y-7">
          {[0, 1].map((s) => (
            <div key={s} className="space-y-2">
              <div className="shimmer h-2.5 w-24 rounded" />
              <div className="shimmer h-3.5 w-full rounded" />
              <div className="shimmer h-3.5 w-11/12 rounded" />
            </div>
          ))}

          {/* 3 fact tiles */}
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="shimmer h-7 w-8 rounded" />
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Đang tạo nội dung triển lãm</span>
    </div>
  );
}
