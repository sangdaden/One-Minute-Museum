/** Bento skeleton shown while an exhibition is generating (docs/ui_spec.md §5). */
export default function LoadingExhibition() {
  // span + height per tile, matching the ExhibitionCard bento shape.
  const tiles = [
    "col-span-2 sm:col-span-6 h-24", // title
    "col-span-2 sm:col-span-6 h-28", // hook
    "col-span-2 sm:col-span-3 h-24", // what
    "col-span-2 sm:col-span-3 h-24", // story
    "col-span-2 sm:col-span-2 h-24", // fact 1
    "col-span-2 sm:col-span-2 h-24", // fact 2
    "col-span-2 sm:col-span-2 h-24", // fact 3
    "col-span-2 sm:col-span-4 h-24", // insight
    "col-span-2 sm:col-span-2 h-24", // why
    "col-span-2 sm:col-span-6 h-20", // reflection
  ];

  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="eyebrow text-accent">Đang dựng triển lãm…</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {tiles.map((cls, i) => (
          <div key={i} className={`shimmer rounded-2xl ${cls}`} />
        ))}
      </div>

      <span className="sr-only">Đang tạo nội dung triển lãm</span>
    </div>
  );
}
