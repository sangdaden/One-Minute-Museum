import type { Exhibition } from "@/lib/types";
import { cleanHashtag, stripWrappingQuotes } from "@/lib/format";

/**
 * Shared slide model + renderer for the multi-post StoriesPlayer.
 * Pure: no hooks, no portal.
 */

export type Slide =
  | { kind: "cover" }
  | {
      kind: "section";
      label: "hook" | "what" | "story" | "insight" | "why" | "reflection";
      body: string;
      emphasis?: boolean;
    }
  | { kind: "fact"; index: number; body: string }
  | { kind: "outro" };

/** Build the slide sequence for one exhibition (skips empty fields). */
export function buildStorySlides(ex: Exhibition): Slide[] {
  const s: Slide[] = [{ kind: "cover" }];
  if (ex.hook)
    s.push({ kind: "section", label: "hook", body: ex.hook, emphasis: true });
  if (ex.what_it_is)
    s.push({ kind: "section", label: "what", body: ex.what_it_is });
  if (ex.origin_or_context)
    s.push({ kind: "section", label: "story", body: ex.origin_or_context });
  ex.three_fun_facts.slice(0, 3).forEach((f, i) => {
    if (f) s.push({ kind: "fact", index: i, body: f });
  });
  if (ex.design_or_cultural_insight)
    s.push({
      kind: "section",
      label: "insight",
      body: ex.design_or_cultural_insight,
    });
  if (ex.why_it_matters)
    s.push({ kind: "section", label: "why", body: ex.why_it_matters });
  if (ex.reflection_question)
    s.push({
      kind: "section",
      label: "reflection",
      body: ex.reflection_question,
      emphasis: true,
    });
  s.push({ kind: "outro" });
  return s;
}

/** Render one slide's content. Kicker is resolved by the caller (i18n). */
export function StorySlideBody({
  slide,
  ex,
  imageUrl,
  fg,
  accent,
  inkSoft,
  kicker,
}: {
  slide: Slide;
  ex: Exhibition;
  imageUrl?: string;
  fg: string;
  accent: string;
  inkSoft: string;
  kicker: string;
}) {
  if (slide.kind === "cover") {
    if (imageUrl) {
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
              {ex.object_name}
            </p>
            <h2 className="mt-2 font-serif text-[2rem] font-semibold leading-[1.05] text-white sm:text-[2.4rem]">
              {ex.title}
            </h2>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full w-full flex-col justify-center px-8">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {ex.object_name}
        </p>
        <h2
          className="mt-3 font-serif text-[2.4rem] font-semibold leading-[1.04] sm:text-[3rem]"
          style={{ color: fg }}
        >
          {ex.title}
        </h2>
      </div>
    );
  }

  if (slide.kind === "outro") {
    return (
      <div className="flex h-full w-full flex-col justify-center px-8">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {kicker}
        </p>
        <p
          className="mt-4 font-serif text-[1.7rem] font-medium leading-snug sm:text-[2.1rem]"
          style={{ color: fg }}
        >
          “{stripWrappingQuotes(ex.share_quote)}”
        </p>
        <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1">
          {ex.hashtags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium uppercase tracking-[0.14em]"
              style={{ color: inkSoft }}
            >
              #{cleanHashtag(tag)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const big = slide.kind === "section" && slide.emphasis;
  const number = slide.kind === "fact";

  return (
    <div className="flex h-full w-full flex-col justify-center px-8">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.2em]"
        style={{ color: accent }}
      >
        {kicker}
      </p>
      {number && (
        <span
          className="mt-3 font-serif text-5xl font-semibold leading-none"
          style={{ color: accent }}
        >
          {String((slide as { index: number }).index + 1).padStart(2, "0")}
        </span>
      )}
      <p
        className={`font-serif font-medium leading-snug ${
          big
            ? "mt-4 text-[2rem] sm:text-[2.6rem]"
            : "mt-4 text-[1.6rem] sm:text-[2.05rem]"
        }`}
        style={{ color: fg }}
      >
        {slide.body}
      </p>
    </div>
  );
}
