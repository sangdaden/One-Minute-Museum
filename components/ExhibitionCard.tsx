import type { Exhibition } from "@/lib/types";
import { formatExhibitionForCopy } from "@/lib/copy-format";
import { formatDate, accession } from "@/lib/format";
import CopyButton from "./CopyButton";

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onRegenerate?: () => void;
}

function Section({
  label,
  children,
  delay,
}: {
  label: string;
  children: string;
  delay: number;
}) {
  return (
    <section
      className="reveal space-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="eyebrow text-accent">{label}</h3>
      <p className="text-[15.5px] leading-[1.75] text-ink/90">{children}</p>
    </section>
  );
}

/** Museum wall-label result card (docs/ui_spec.md §4). */
export default function ExhibitionCard({
  exhibition,
  onRegenerate,
}: ExhibitionCardProps) {
  const ex = exhibition;

  return (
    <article className="reveal relative bg-paper-card shadow-[0_1px_2px_rgba(27,22,17,0.05),0_18px_40px_-24px_rgba(27,22,17,0.35)] ring-1 ring-border">
      {/* Inset catalogue frame */}
      <div className="pointer-events-none absolute inset-[7px] border border-border/70" />

      <div className="relative px-6 py-7 sm:px-10 sm:py-11">
        {/* Accession strip */}
        <div className="mb-7 flex items-center justify-between">
          <span className="eyebrow text-ink-faint">
            No. {accession(ex.id)}
          </span>
          <span className="eyebrow text-ink-faint">
            {formatDate(ex.created_at)}
          </span>
        </div>

        {/* Header */}
        <header
          className="reveal space-y-4"
          style={{ animationDelay: "60ms" }}
        >
          <p className="eyebrow text-accent">One-Minute Museum</p>
          <h2 className="font-serif text-[2rem] font-medium leading-[1.08] tracking-[-0.01em] text-ink sm:text-[2.7rem]">
            {ex.title}
          </h2>
          {/* Museum "medium" line */}
          <p className="eyebrow text-ink-faint">
            {ex.mode} <span className="text-gold">·</span> {ex.language}
          </p>
        </header>

        {/* Hook — pulled display quote */}
        <blockquote
          className="reveal relative my-8 border-l-2 border-gold pl-5"
          style={{ animationDelay: "120ms" }}
        >
          <span
            aria-hidden
            className="absolute -left-1 -top-4 font-serif text-5xl leading-none text-gold/40"
          >
            “
          </span>
          <p className="font-serif text-[1.35rem] font-light italic leading-snug text-ink/85 sm:text-[1.6rem]">
            {ex.hook}
          </p>
        </blockquote>

        {/* Body */}
        <div className="space-y-7">
          <Section label="Đây là gì?" delay={160}>
            {ex.what_it_is}
          </Section>

          <div className="rule" />

          <Section label="Câu chuyện phía sau" delay={200}>
            {ex.origin_or_context}
          </Section>

          <div className="rule" />

          {/* 3 fun facts */}
          <section
            className="reveal space-y-4"
            style={{ animationDelay: "240ms" }}
          >
            <h3 className="eyebrow text-accent">Ba điều thú vị</h3>
            <ol className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
              {ex.three_fun_facts.map((fact, i) => (
                <li key={i} className="space-y-2">
                  <span className="block font-serif text-3xl font-medium leading-none text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink/85">
                    {fact}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="rule" />

          <Section label="Góc nhìn thiết kế / văn hóa" delay={280}>
            {ex.design_or_cultural_insight}
          </Section>

          <Section label="Vì sao đáng chú ý?" delay={320}>
            {ex.why_it_matters}
          </Section>

          {/* Reflection question — highlighted plate */}
          <section
            className="reveal border border-dashed border-gold/60 bg-paper-sunk/40 px-5 py-5 text-center"
            style={{ animationDelay: "360ms" }}
          >
            <h3 className="eyebrow mb-2 text-gold">Câu hỏi suy ngẫm</h3>
            <p className="font-serif text-[1.2rem] font-light italic leading-snug text-ink/90">
              {ex.reflection_question}
            </p>
          </section>
        </div>

        {/* Caption plate — share quote + hashtags */}
        <footer
          className="reveal mt-9 border-t border-border-strong pt-6"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-center font-serif text-[1.05rem] italic text-ink/75">
            {ex.share_quote}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {ex.hashtags.map((tag) => (
              <span key={tag} className="eyebrow text-ink-faint">
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      </div>

      {/* Action bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-border bg-paper-sunk/50 px-6 py-4 sm:px-10">
        <span className="eyebrow hidden text-ink-faint sm:block">
          Bảo Tàng 1 Phút
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <CopyButton text={formatExhibitionForCopy(ex)} />
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
            >
              Tạo lại
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
