import type { Exhibition } from "@/lib/types";
import { formatDate, accession } from "@/lib/format";

interface GalleryItemProps {
  exhibition: Exhibition;
  index: number;
}

/** A single collected object, styled as a catalogue entry. */
export default function GalleryItem({ exhibition, index }: GalleryItemProps) {
  const ex = exhibition;
  return (
    <article
      className="reveal group relative flex h-full flex-col bg-paper-card p-5 ring-1 ring-border transition-shadow hover:shadow-[0_1px_2px_rgba(27,22,17,0.05),0_16px_34px_-22px_rgba(27,22,17,0.4)] sm:p-6"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
      />

      {/* Accession strip */}
      <div className="mb-4 flex items-center justify-between">
        <span className="eyebrow text-ink-faint">No. {accession(ex.id)}</span>
        <span className="eyebrow text-ink-faint">{formatDate(ex.created_at)}</span>
      </div>

      {/* Object + mode + voice */}
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="eyebrow text-accent">{ex.mode}</span>
        {ex.voice && (
          <>
            <span className="text-gold">·</span>
            <span className="eyebrow text-ink-faint">{ex.voice}</span>
          </>
        )}
      </div>

      <h2 className="font-serif text-[1.45rem] font-medium leading-tight tracking-[-0.01em] text-ink">
        {ex.title}
      </h2>

      <p className="mt-1.5 eyebrow text-ink-faint">{ex.object_name}</p>

      {/* Hook preview */}
      <p className="mt-3 line-clamp-3 font-serif text-[0.98rem] italic leading-snug text-ink-soft">
        {ex.hook}
      </p>

      {/* Footer rule */}
      <div className="mt-auto pt-4">
        <div className="rule" />
      </div>
    </article>
  );
}
