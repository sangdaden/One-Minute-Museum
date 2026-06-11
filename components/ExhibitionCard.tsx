import { useTranslations } from "next-intl";
import type { Exhibition } from "@/lib/types";
import { formatExhibitionForSocial } from "@/lib/copy-format";
import { formatDate, accession } from "@/lib/format";
import { getTheme } from "@/lib/themes";
import CopyButton from "./CopyButton";
import StoryButton from "./StoryButton";
import ThemedCard from "./ThemedCard";

export interface ExhibitionCardProps {
  exhibition: Exhibition;
  /** Optional in-session photo the exhibition was generated from. */
  imageUrl?: string;
  onRegenerate?: () => void;
}

/** Dispatch: default theme → bento layout; any Vietnamese theme → ThemedCard. */
export default function ExhibitionCard(props: ExhibitionCardProps) {
  const theme = getTheme(props.exhibition.theme);
  if (theme.decoration === "none") return <BentoCard {...props} />;
  return <ThemedCard {...props} theme={theme} />;
}

type Variant = "ink" | "brass" | "accentDeep" | "sunk";

const VARIANT: Record<Variant, { wrap: string; label: string; body: string }> = {
  ink: { wrap: "bg-ink", label: "text-gold", body: "text-paper-card/85" },
  brass: { wrap: "bg-gold", label: "text-paper-card/85", body: "text-paper-card" },
  accentDeep: {
    wrap: "bg-accent-deep",
    label: "text-paper-card/75",
    body: "text-paper-card/90",
  },
  sunk: {
    wrap: "bg-paper-sunk border border-border-strong",
    label: "text-accent",
    body: "text-ink/90",
  },
};

/** A labelled bento tile: short uppercase label + body text. */
function Tile({
  variant,
  label,
  span,
  delay,
  text,
}: {
  variant: Variant;
  label: string;
  span: string;
  delay: number;
  text: string;
}) {
  const v = VARIANT[variant];
  return (
    <section
      className={`reveal rounded-2xl p-4 sm:p-5 ${v.wrap} ${span}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className={`eyebrow mb-2 ${v.label}`}>{label}</h3>
      <p className={`text-[14px] leading-relaxed ${v.body}`}>{text}</p>
    </section>
  );
}

/** Modern bento layout for an exhibition (docs/superpowers/specs/2026-06-10-bento). */
function BentoCard({
  exhibition,
  imageUrl,
  onRegenerate,
}: ExhibitionCardProps) {
  const ex = exhibition;
  const t = useTranslations("Card");

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-6 sm:gap-3">
      {/* Title */}
      <section
        className={`reveal col-span-2 rounded-2xl border border-border bg-paper-card p-5 shadow-[0_8px_24px_-18px_rgba(120,40,30,0.45)] sm:p-6 ${
          imageUrl ? "sm:col-span-4" : "sm:col-span-6"
        }`}
        style={{ animationDelay: "0ms" }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="eyebrow text-accent">One-Minute Museum</span>
          <span className="eyebrow text-right text-ink-faint">
            No. {accession(ex.id)} <span className="text-gold">·</span>{" "}
            {formatDate(ex.created_at)}
          </span>
        </div>
        <h2 className="font-serif text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.01em] text-ink sm:text-[2.5rem]">
          {ex.title}
        </h2>
        <p className="eyebrow mt-3 text-ink-faint">
          {ex.mode} <span className="text-gold">·</span> {ex.language}
          {ex.voice && (
            <>
              {" "}
              <span className="text-gold">·</span> {t("toldBy")} {ex.voice}
            </>
          )}
        </p>
      </section>

      {/* Your photo */}
      {imageUrl && (
        <section
          className="reveal relative col-span-2 min-h-[10rem] overflow-hidden rounded-2xl shadow-[0_8px_24px_-18px_rgba(120,40,30,0.45)] ring-1 ring-border sm:col-span-2"
          style={{ animationDelay: "30ms" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={ex.object_name}
            className="h-full max-h-72 w-full object-cover"
          />
          <span className="eyebrow absolute bottom-2 left-2 rounded-full bg-ink/70 px-2.5 py-1 text-paper-card">
            {t("yourPhoto")}
          </span>
        </section>
      )}

      {/* Hook — accent */}
      <section
        className="reveal col-span-2 rounded-2xl bg-accent p-5 sm:col-span-6 sm:p-7"
        style={{ animationDelay: "60ms" }}
      >
        <h3 className="eyebrow mb-2 text-paper-card/70">{t("hook")}</h3>
        <p className="font-serif text-[1.3rem] font-medium leading-snug text-paper-card sm:text-[1.7rem]">
          {ex.hook}
        </p>
      </section>

      {/* What it is + Story */}
      <Tile
        variant="ink"
        label={t("what")}
        span="col-span-2 sm:col-span-3"
        delay={110}
        text={ex.what_it_is}
      />
      <Tile
        variant="brass"
        label={t("story")}
        span="col-span-2 sm:col-span-3"
        delay={150}
        text={ex.origin_or_context}
      />

      {/* 3 fun facts — gold tint */}
      {ex.three_fun_facts.slice(0, 3).map((fact, i) => (
        <section
          key={i}
          className="reveal col-span-2 rounded-2xl border border-gold/40 bg-gold/15 p-4 sm:col-span-2"
          style={{ animationDelay: `${190 + i * 40}ms` }}
        >
          <span className="block font-serif text-3xl font-semibold leading-none text-gold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink/85">
            {fact}
          </p>
        </section>
      ))}

      {/* Insight + Why */}
      <Tile
        variant="sunk"
        label={t("insight")}
        span="col-span-2 sm:col-span-4"
        delay={320}
        text={ex.design_or_cultural_insight}
      />
      <Tile
        variant="accentDeep"
        label={t("why")}
        span="col-span-2 sm:col-span-2"
        delay={360}
        text={ex.why_it_matters}
      />

      {/* Reflection — prompt */}
      <section
        className="reveal col-span-2 rounded-2xl border border-dashed border-gold/60 bg-accent/[0.06] p-5 text-center sm:col-span-6"
        style={{ animationDelay: "400ms" }}
      >
        <h3 className="eyebrow mb-2 text-gold">{t("reflection")}</h3>
        <p className="font-serif text-[1.2rem] font-medium leading-snug text-ink">
          {ex.reflection_question}
        </p>
      </section>

      {/* Footer — caption + hashtags + actions */}
      <section
        className="reveal col-span-2 rounded-2xl border border-border bg-paper-card p-5 shadow-[0_8px_24px_-18px_rgba(120,40,30,0.45)] sm:col-span-6"
        style={{ animationDelay: "440ms" }}
      >
        <p className="text-center font-serif text-[1.02rem] text-ink/75">
          {ex.share_quote}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {ex.hashtags.map((tag) => (
            <span key={tag} className="eyebrow text-ink-faint">
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 border-t border-border pt-4">
          <CopyButton text={formatExhibitionForSocial(ex)} />
          <StoryButton exhibition={ex} imageUrl={imageUrl} />
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
            >
              {t("regenerate")}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
