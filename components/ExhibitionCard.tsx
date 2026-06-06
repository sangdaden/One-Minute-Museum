import type { Exhibition } from "@/lib/types";
import { formatExhibitionForCopy } from "@/lib/copy-format";
import CopyButton from "./CopyButton";

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onRegenerate?: () => void;
}

function Section({ label, children }: { label: string; children: string }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {label}
      </h3>
      <p className="text-[15px] leading-relaxed text-ink/90">{children}</p>
    </section>
  );
}

/** Museum-label result card (docs/ui_spec.md §4, coding_agent_instructions §7). */
export default function ExhibitionCard({
  exhibition,
  onRegenerate,
}: ExhibitionCardProps) {
  const ex = exhibition;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-paper-card shadow-sm">
      <div className="space-y-8 p-7 sm:p-10">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper-card">
              One-Minute Museum
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              {ex.mode}
            </span>
          </div>
          <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {ex.title}
          </h2>
          <blockquote className="border-l-4 border-accent-soft pl-4 font-serif text-xl italic leading-relaxed text-ink/80">
            “{ex.hook}”
          </blockquote>
        </header>

        {/* Body sections */}
        <div className="space-y-6">
          <Section label="Đây là gì?">{ex.what_it_is}</Section>
          <Section label="Câu chuyện phía sau">{ex.origin_or_context}</Section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              3 điều thú vị
            </h3>
            <ol className="grid gap-3 sm:grid-cols-3">
              {ex.three_fun_facts.map((fact, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-paper p-4 text-sm leading-relaxed text-ink/90"
                >
                  <span className="mb-1 block font-serif text-lg text-accent">
                    {i + 1}
                  </span>
                  {fact}
                </li>
              ))}
            </ol>
          </section>

          <Section label="Góc nhìn thiết kế / văn hóa">
            {ex.design_or_cultural_insight}
          </Section>
          <Section label="Vì sao đáng chú ý?">{ex.why_it_matters}</Section>

          <section className="rounded-xl border border-dashed border-accent-soft/60 bg-accent/[0.03] p-5">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Câu hỏi suy ngẫm
            </h3>
            <p className="font-serif text-lg italic text-ink/85">
              {ex.reflection_question}
            </p>
          </section>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2">
          {ex.hashtags.map((tag) => (
            <span key={tag} className="text-sm text-ink-soft">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <footer className="flex flex-wrap items-center gap-3 border-t border-border bg-paper px-7 py-5 sm:px-10">
        <CopyButton text={formatExhibitionForCopy(ex)} />
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            Tạo lại
          </button>
        )}
      </footer>
    </article>
  );
}
