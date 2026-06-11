"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import type { Exhibition } from "@/lib/types";
import { slugifyObjectName, cleanHashtag } from "@/lib/format";
import { getTheme, type Theme } from "@/lib/themes";

interface ShareCardProps {
  exhibition: Exhibition;
  /** Optional in-session photo to feature on the card. */
  imageUrl?: string;
}

const SIZE = 1080; // export canvas — 1080×1080

type Status = "idle" | "working" | "done" | "error";

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
  const frameRef = useRef<HTMLDivElement>(null); // responsive preview frame
  const [scale, setScale] = useState(0.4);
  const [status, setStatus] = useState<Status>("idle");

  // Keep the preview scaled to its container while preserving 1:1.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SIZE);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

      {/* Responsive 1:1 preview frame — capped so it stays a moderate size
          (the exported PNG is still a full 1080²). */}
      <div
        ref={frameRef}
        className="relative aspect-square w-full max-w-[340px] overflow-hidden rounded-xl ring-1 ring-border"
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <ShareArtwork
            ref={cardRef}
            exhibition={ex}
            imageUrl={imageUrl}
            theme={theme}
          />
        </div>
      </div>

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

/**
 * The fixed 1080×1080 artwork. All sizing in px so the export is deterministic.
 * Colours come from the chosen theme.
 */
function ShareArtwork({
  ref,
  exhibition: ex,
  imageUrl,
  theme: t,
}: {
  ref: React.Ref<HTMLDivElement>;
  exhibition: Exhibition;
  imageUrl?: string;
  theme: Theme;
}) {
  const mono = "var(--font-jetbrains), monospace";
  const display = "var(--font-display), ui-sans-serif, system-ui, sans-serif";

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
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 21,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: t.accent,
            }}
          >
            Bảo Tàng 1 Phút
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: t.inkSoft,
            }}
          >
            {ex.voice ? `Kể bởi ${ex.voice}` : "★"}
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
            Hiện vật
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
            “{ex.share_quote}”
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
            Ba điều thú vị
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
 * Poster variant: the photo fills the whole 1080² and the text sits over a
 * bottom-weighted scrim (magazine-cover feel). Used when a featured image is
 * present. Text is light for legibility regardless of theme.
 */
function PosterArtwork({
  ref,
  ex,
  imageUrl,
  t,
  mono,
  display,
}: {
  ref: React.Ref<HTMLDivElement>;
  ex: Exhibition;
  imageUrl: string;
  t: Theme;
  mono: string;
  display: string;
}) {
  const cream = "#f3e7cf";
  const light = "rgba(255,255,255,0.82)";

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
      {/* Photo fills the card (the featured image is 1:1, so it covers cleanly). */}
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

      {/* Top + bottom scrims for legibility. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 22%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 26%, rgba(0,0,0,0.12) 50%, transparent 66%)",
        }}
      />

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

      {/* Content */}
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
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 21,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: cream,
            }}
          >
            Bảo Tàng 1 Phút
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: light,
            }}
          >
            {ex.voice ? `Kể bởi ${ex.voice}` : "★"}
          </span>
        </div>

        {/* Bottom block — object name, quote, hashtags */}
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 17,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: light,
              marginBottom: 16,
            }}
          >
            Hiện vật
          </div>
          <div
            style={{
              fontFamily: display,
              fontSize: 78,
              fontWeight: 600,
              lineHeight: 1.2,
              paddingTop: 10,
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
            style={{
              borderLeft: `4px solid ${t.accent}`,
              paddingLeft: 24,
              marginTop: 22,
            }}
          >
            <p
              style={{
                fontFamily: display,
                fontWeight: 300,
                fontSize: 40,
                lineHeight: 1.42,
                paddingTop: 6,
                color: "rgba(255,255,255,0.96)",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              “{ex.share_quote}”
            </p>
          </div>
          <div
            style={{
              marginTop: 26,
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
                  color: light,
                }}
              >
                #{cleanHashtag(tag)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
