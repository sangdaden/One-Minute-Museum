"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import {
  slugifyObjectName,
  cleanHashtag,
  stripWrappingQuotes,
  cardLabels,
  creditLine,
} from "@/lib/format";
import { getTheme, type Theme } from "@/lib/themes";
import OmmMark from "./OmmMark";

interface ShareCardProps {
  exhibition: Exhibition;
  /** Optional in-session photo to feature on the card. */
  imageUrl?: string;
}

const SIZE = 1080; // export canvas — 1080×1080

type Status = "idle" | "working" | "done" | "error";

/** Text arrangement for the photo poster. */
export type PosterLayout = "bottom" | "split" | "panel";
const LAYOUTS: PosterLayout[] = ["bottom", "split", "panel"];

/**
 * 1080×1080 share card with a responsive 1:1 preview and PNG export.
 * html-to-image is imported lazily inside the click handler so it never runs
 * on the server (avoids SSR issues).
 */
export default function ShareCard({ exhibition, imageUrl }: ShareCardProps) {
  const t = useTranslations("Share");
  const ex = exhibition;
  const theme = getTheme(ex.theme);

  const cardRef = useRef<HTMLDivElement>(null); // the real 1080px node (exported)
  const [status, setStatus] = useState<Status>("idle");
  const [zoomed, setZoomed] = useState(false);
  const [layout, setLayout] = useState<PosterLayout>("bottom");

  // Esc + scroll-lock while the zoom lightbox is open.
  useEffect(() => {
    if (!zoomed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed]);

  async function handleDownload() {
    const node = cardRef.current;
    if (!node) return;
    setStatus("working");
    try {
      // Make sure web fonts are ready so the export isn't a fallback font.
      if (document.fonts?.ready) await document.fonts.ready;

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        width: SIZE,
        height: SIZE,
        canvasWidth: SIZE,
        canvasHeight: SIZE,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: theme.bgSolid,
      });

      const link = document.createElement("a");
      link.download = `one-minute-museum-${slugifyObjectName(ex.object_name)}.png`;
      link.href = dataUrl;
      link.click();

      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      window.setTimeout(() => setStatus("idle"), 2400);
    }
  }

  const buttonLabel =
    status === "working"
      ? t("creating")
      : status === "done"
        ? t("done")
        : status === "error"
          ? t("error")
          : t("cta");

  return (
    <section className="reveal flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-ink">{t("header")}</span>
        <span className="h-px flex-1 bg-border-strong" />
      </div>

      {/* Text-layout picker (poster only) */}
      {imageUrl && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow text-ink-faint">{t("layout")}</span>
          {LAYOUTS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayout(l)}
              className={[
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                layout === l
                  ? "border-accent bg-accent/5 text-accent ring-1 ring-accent/30"
                  : "border-border-strong text-ink-soft hover:border-accent/50 hover:text-ink",
              ].join(" ")}
            >
              {t(`layout_${l}`)}
            </button>
          ))}
        </div>
      )}

      {/* Moderate-size preview; click to view larger. The exported PNG is
          still a full 1080². */}
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={t("zoom")}
        className="block aspect-square w-full max-w-[340px] cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-border transition hover:ring-accent/50"
      >
        <Preview
          ex={ex}
          imageUrl={imageUrl}
          theme={theme}
          layout={layout}
          nodeRef={cardRef}
        />
      </button>

      {/* Zoom lightbox */}
      {zoomed &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setZoomed(false)}
          >
            <div
              className="w-full max-w-[min(92vw,82vh)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Preview ex={ex} imageUrl={imageUrl} theme={theme} layout={layout} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label={t("close")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>,
          document.body,
        )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={status === "working"}
          className={[
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-paper-card transition-colors disabled:opacity-70",
            status === "error" ? "bg-accent-deep" : "bg-accent hover:bg-accent-deep",
          ].join(" ")}
        >
          <Download aria-hidden className="h-4 w-4" strokeWidth={2} />
          {buttonLabel}
        </button>
        <span className="eyebrow text-ink-faint">{t("pngSquare")}</span>
      </div>
    </section>
  );
}

/** Responsive 1:1 frame that scales the fixed 1080px artwork to fit. */
function Preview({
  ex,
  imageUrl,
  theme,
  layout,
  nodeRef,
}: {
  ex: Exhibition;
  imageUrl?: string;
  theme: Theme;
  layout: PosterLayout;
  nodeRef?: React.Ref<HTMLDivElement>;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SIZE);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="relative aspect-square w-full overflow-hidden">
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <ShareArtwork
          ref={nodeRef}
          exhibition={ex}
          imageUrl={imageUrl}
          theme={theme}
          layout={layout}
        />
      </div>
    </div>
  );
}

/**
 * The fixed 1080×1080 artwork. All sizing in px so the export is deterministic.
 * Colours come from the chosen theme.
 */
function ShareArtwork({
  ref,
  exhibition: ex,
  imageUrl,
  theme: t,
  layout = "bottom",
}: {
  ref?: React.Ref<HTMLDivElement>;
  exhibition: Exhibition;
  imageUrl?: string;
  theme: Theme;
  layout?: PosterLayout;
}) {
  const mono = "var(--font-jetbrains), monospace";
  const display = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
  const L = cardLabels(ex);

  // With a photo: full-bleed poster (image as background, text overlaid).
  if (imageUrl) {
    return (
      <PosterArtwork
        ref={ref}
        ex={ex}
        imageUrl={imageUrl}
        t={t}
        mono={mono}
        display={display}
        layout={layout}
      />
    );
  }

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
        background: t.bg,
        color: t.ink,
        fontFamily: "var(--font-be-vietnam), system-ui, sans-serif",
        padding: 64,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar — themed, safe (no overlap). */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: t.accent,
        }}
      />

      {/* Inner frame */}
      <div
        style={{
          height: "100%",
          width: "100%",
          border: `1px solid ${t.inkSoft}40`,
          padding: "56px 60px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header — brand */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <OmmMark size={42} color={t.accent} nonColor="#c89b3c" />
            <span
              style={{
                fontFamily: mono,
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.inkSoft,
              }}
            >
              {L.brand}
            </span>
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: t.inkSoft,
            }}
          >
            {L.toldBy}
          </span>
        </div>

        {/* Optional featured photo */}
        {imageUrl && (
          <div
            style={{
              // Square frame, centred — the featured image is 1:1, so it fills
              // (no wide empty bands); a non-square photo letterboxes lightly.
              width: 320,
              height: 320,
              marginTop: 24,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 18,
              background: `${t.inkSoft}14`,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}
        {imageUrl && creditLine(ex, L.photo) && (
          <div
            style={{
              marginTop: 10,
              fontFamily: mono,
              fontSize: 15,
              color: `${t.inkSoft}`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {creditLine(ex, L.photo)}
          </div>
        )}

        {/* Hero — object name */}
        <div style={{ marginTop: imageUrl ? 22 : 28 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 17,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: t.inkSoft,
              marginBottom: 18,
            }}
          >
            {L.object}
          </div>
          <div
            style={{
              fontFamily: display,
              fontSize: imageUrl ? 56 : 78,
              fontWeight: 600,
              // Vietnamese stacked diacritics (Ế, Ỏ, Ự…) sit above cap height —
              // generous line-height + top padding keeps them from clipping.
              lineHeight: 1.2,
              paddingTop: 10,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color: t.ink,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {ex.object_name}
          </div>
        </div>

        {/* Quote */}
        <div
          style={{ borderLeft: `3px solid ${t.accent}`, paddingLeft: 26, margin: "8px 0" }}
        >
          <p
            style={{
              fontFamily: display,
              fontWeight: 300,
              fontSize: 40,
              lineHeight: 1.42,
              paddingTop: 6,
              color: t.ink,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            “{stripWrappingQuotes(ex.share_quote)}”
          </p>
        </div>

        {/* 3 fun facts */}
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 17,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: t.accent,
              marginBottom: 18,
            }}
          >
            {L.facts}
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ex.three_fun_facts.slice(0, 3).map((fact, i) => (
              <li
                key={i}
                style={{ display: "flex", gap: 16, marginBottom: 14, alignItems: "baseline" }}
              >
                <span
                  style={{
                    fontFamily: display,
                    fontSize: 24,
                    color: t.accent,
                    flex: "0 0 auto",
                    lineHeight: 1.3,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontSize: 25,
                    lineHeight: 1.42,
                    color: t.ink,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {fact}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer — hashtags */}
        <div
          style={{
            borderTop: `1px solid ${t.inkSoft}40`,
            paddingTop: 22,
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
          }}
        >
          {ex.hashtags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: mono,
                fontSize: 20,
                letterSpacing: "0.12em",
                color: t.inkSoft,
              }}
            >
              #{cleanHashtag(tag)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Poster: the photo fills the whole 1080² and the text sits over it in one of
 * three arrangements (`bottom` / `split` / `panel`). Text is light for
 * legibility regardless of theme; facts show up to two lines.
 */
function PosterArtwork({
  ref,
  ex,
  imageUrl,
  t,
  mono,
  display,
  layout,
}: {
  ref?: React.Ref<HTMLDivElement>;
  ex: Exhibition;
  imageUrl: string;
  t: Theme;
  mono: string;
  display: string;
  layout: PosterLayout;
}) {
  const cream = "#f3e7cf";
  const light = "rgba(255,255,255,0.82)";
  const L = cardLabels(ex);

  const Brand = () => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <OmmMark size={42} color={cream} nonColor="#e2c27e" />
        <span
          style={{
            fontFamily: mono,
            fontSize: 14,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: light,
          }}
        >
          {L.brand}
        </span>
      </div>
      <span
        style={{
          fontFamily: mono,
          fontSize: 18,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: light,
        }}
      >
        {L.toldBy}
      </span>
    </div>
  );

  const Head = (nameSize: number) => (
    <div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 16,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: light,
          marginBottom: 12,
        }}
      >
        {L.object}
      </div>
      <div
        style={{
          fontFamily: display,
          fontSize: nameSize,
          fontWeight: 600,
          lineHeight: 1.16,
          paddingTop: 8,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: "#ffffff",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {ex.object_name}
      </div>
      <div
        style={{ borderLeft: `4px solid ${t.accent}`, paddingLeft: 22, marginTop: 18 }}
      >
        <p
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: 31,
            lineHeight: 1.36,
            paddingTop: 4,
            color: "rgba(255,255,255,0.96)",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          “{stripWrappingQuotes(ex.share_quote)}”
        </p>
      </div>
    </div>
  );

  const Facts = () => (
    <div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 15,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: cream,
          marginBottom: 12,
        }}
      >
        {L.facts}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {ex.three_fun_facts.slice(0, 3).map((fact, i) => (
          <li
            key={i}
            style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "baseline" }}
          >
            <span
              style={{
                fontFamily: display,
                fontSize: 20,
                color: cream,
                flex: "0 0 auto",
                lineHeight: 1.3,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: 22,
                lineHeight: 1.36,
                color: "rgba(255,255,255,0.94)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {fact}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const Hashtags = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {ex.hashtags.map((tag) => (
        <span
          key={tag}
          style={{
            fontFamily: mono,
            fontSize: 18,
            letterSpacing: "0.12em",
            color: light,
          }}
        >
          #{cleanHashtag(tag)}
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
        background: t.bgSolid,
        fontFamily: "var(--font-be-vietnam), system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Scrims per layout */}
      {layout === "panel" ? (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.32)" }} />
      ) : layout === "split" ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 30%, transparent 47%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 28%, transparent 50%)",
            }}
          />
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 32%, rgba(0,0,0,0.4) 56%, rgba(0,0,0,0.08) 74%, transparent 86%)",
            }}
          />
        </>
      )}

      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: t.accent,
        }}
      />

      {/* Content per layout */}
      {layout === "panel" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 70,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 28,
              padding: "48px 52px",
              boxSizing: "border-box",
            }}
          >
            {Brand()}
            <div style={{ marginTop: 26 }}>{Head(50)}</div>
            <div style={{ marginTop: 24 }}>{Facts()}</div>
            <div style={{ marginTop: 20 }}>{Hashtags()}</div>
          </div>
        </div>
      ) : layout === "split" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 64,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {Brand()}
            <div style={{ marginTop: 28 }}>{Head(50)}</div>
          </div>
          <div>
            {Facts()}
            <div style={{ marginTop: 16 }}>{Hashtags()}</div>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 64,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {Brand()}
          <div>
            {Head(54)}
            <div style={{ marginTop: 24 }}>{Facts()}</div>
            <div style={{ marginTop: 18 }}>{Hashtags()}</div>
          </div>
        </div>
      )}

      {creditLine(ex, L.photo) && (
        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            bottom: 26,
            textAlign: "right",
            fontFamily: mono,
            fontSize: 16,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.6)",
            textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {creditLine(ex, L.photo)}
        </div>
      )}
    </div>
  );
}
