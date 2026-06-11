import { useTranslations } from "next-intl";
import type { Exhibition } from "@/lib/types";
import type { Theme, DecorationKind } from "@/lib/themes";
import { formatExhibitionForSocial } from "@/lib/copy-format";
import { formatDate, accession } from "@/lib/format";
import CopyButton from "./CopyButton";

interface ThemedCardProps {
  exhibition: Exhibition;
  imageUrl?: string;
  onRegenerate?: () => void;
  theme: Theme;
}

/** A single themed surface that renders any Vietnamese theme from its config. */
export default function ThemedCard({
  exhibition: ex,
  imageUrl,
  onRegenerate,
  theme: t,
}: ThemedCardProps) {
  const tr = useTranslations("Card");
  const label = (text: string) => (
    <div
      className="eyebrow mb-1.5"
      style={{ color: t.accent }}
    >
      {text}
    </div>
  );

  const Section = ({ heading, body }: { heading: string; body: string }) => (
    <section className="space-y-1">
      {label(heading)}
      <p className="text-[15px] leading-relaxed" style={{ color: t.ink }}>
        {body}
      </p>
    </section>
  );

  const content = (
    <div className="space-y-6">
      {/* Header (reserve right space so a corner decoration never covers text) */}
      <header className="space-y-3 pr-24">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="eyebrow" style={{ color: t.accent }}>
            One-Minute Museum
          </span>
          <span className="eyebrow" style={{ color: t.inkSoft }}>
            No. {accession(ex.id)} · {formatDate(ex.created_at)}
          </span>
        </div>
        <h2
          className="font-serif text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.01em] sm:text-[2.5rem]"
          style={{ color: t.ink }}
        >
          {ex.title}
        </h2>
        <p className="eyebrow" style={{ color: t.inkSoft }}>
          {ex.mode}
          {ex.voice ? ` · ${tr("toldBy")} ${ex.voice}` : ""}
        </p>
      </header>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={ex.object_name}
          className="max-h-72 w-full rounded-xl object-cover"
          style={{ boxShadow: "0 10px 28px -18px rgba(0,0,0,0.6)" }}
        />
      )}

      {/* Hook */}
      <blockquote
        className="border-l-2 pl-4"
        style={{ borderColor: t.accent }}
      >
        <p
          className="font-serif text-[1.3rem] font-medium leading-snug sm:text-[1.55rem]"
          style={{ color: t.ink }}
        >
          “{ex.hook}”
        </p>
      </blockquote>

      <Section heading={tr("what")} body={ex.what_it_is} />
      <Section heading={tr("story")} body={ex.origin_or_context} />

      <section>
        {label(tr("facts"))}
        <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          {ex.three_fun_facts.slice(0, 3).map((fact, i) => (
            <li key={i} className="space-y-1.5">
              <span
                className="block font-serif text-2xl font-semibold leading-none"
                style={{ color: t.accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[13.5px] leading-relaxed" style={{ color: t.ink }}>
                {fact}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <Section
        heading={tr("insight")}
        body={ex.design_or_cultural_insight}
      />
      <Section heading={tr("why")} body={ex.why_it_matters} />

      <section
        className="rounded-xl border border-dashed px-4 py-4 text-center"
        style={{ borderColor: t.accent }}
      >
        {label(tr("reflection"))}
        <p
          className="font-serif text-[1.15rem] font-medium leading-snug"
          style={{ color: t.ink }}
        >
          {ex.reflection_question}
        </p>
      </section>

      <div className="space-y-2 pt-1 text-center">
        <p className="font-serif text-[1.02rem]" style={{ color: t.ink }}>
          {ex.share_quote}
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {ex.hashtags.map((tag) => (
            <span key={tag} className="eyebrow" style={{ color: t.inkSoft }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <article
      className="relative overflow-hidden rounded-2xl ring-1 ring-border shadow-[0_10px_30px_-20px_rgba(0,0,0,0.5)]"
      style={{ background: t.bg }}
    >
      <Decoration kind={t.decoration} noteText={ex.note || ex.share_quote} />

      <div className="relative p-4 sm:p-5">
        {t.panel ? (
          <div
            className="rounded-2xl p-5 sm:p-8"
            style={{ background: t.panel }}
          >
            {content}
          </div>
        ) : (
          <div className="p-2 sm:p-4">{content}</div>
        )}
      </div>

      {/* Action bar */}
      <div
        className="relative flex flex-wrap items-center justify-end gap-2.5 px-5 py-4 sm:px-7"
        style={{ borderTop: `1px solid ${t.inkSoft}33` }}
      >
        <CopyButton text={formatExhibitionForSocial(ex)} />
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{ border: `1px solid ${t.inkSoft}66`, color: t.ink }}
          >
            {tr("regenerate")}
          </button>
        )}
      </div>
    </article>
  );
}

/** Per-theme corner decoration — always in a safe corner, never over text. */
function Decoration({
  kind,
  noteText,
}: {
  kind: DecorationKind;
  noteText?: string;
}) {
  switch (kind) {
    case "seal":
      return (
        <div
          aria-hidden
          className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: "#9e2b22",
            color: "#f0d9a8",
            border: "2px solid #c2462f",
            transform: "rotate(-8deg)",
            fontFamily: "var(--font-jetbrains), monospace",
          }}
        >
          OMM
        </div>
      );
    case "menlam":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 z-10 rounded-xl"
          style={{ border: "3px double #234e9e" }}
        />
      );
    case "dongho":
      return (
        <>
          <span aria-hidden className="absolute bottom-3 right-4 z-10 text-4xl">
            🐓
          </span>
          <div
            aria-hidden
            className="absolute bottom-4 left-5 z-10 h-2 w-16 rounded"
            style={{
              background:
                "repeating-linear-gradient(90deg,#3f7d4e 0 10px,#e0a52e 10px 18px,#d23a2e 18px 26px)",
            }}
          />
        </>
      );
    case "thocam":
      return (
        <>
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-2.5"
            style={{
              background:
                "repeating-linear-gradient(90deg,#9e2b22 0 8px,#1c1714 8px 12px,#e0a52e 12px 18px,#2f7a5f 18px 24px)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-10 h-2.5"
            style={{
              background:
                "repeating-linear-gradient(90deg,#9e2b22 0 8px,#1c1714 8px 12px,#e0a52e 12px 18px,#2f7a5f 18px 24px)",
            }}
          />
        </>
      );
    case "note":
      return (
        <div
          aria-hidden
          className="absolute right-4 top-1 z-10 w-[124px] p-3 text-[12px] leading-snug"
          style={{
            background: "#ffe27a",
            color: "#5f4f14",
            transform: "rotate(5deg)",
            boxShadow: "0 8px 16px -8px rgba(0,0,0,0.4)",
            fontFamily: "var(--font-be-vietnam), system-ui, sans-serif",
          }}
        >
          <span
            className="absolute left-1/2 top-[-8px] h-4 w-14 -translate-x-1/2"
            style={{ background: "rgba(170,150,110,0.5)", transform: "rotate(-4deg)" }}
          />
          <span className="line-clamp-4">{noteText}</span>
        </div>
      );
    case "tet":
      return (
        <span aria-hidden className="absolute right-2 top-1 z-10 text-5xl">
          🌸
        </span>
      );
    default:
      return null;
  }
}
