import type { Exhibition } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { cleanHashtag } from "@/lib/format";

export const FLASHCARD_SIZE = 1080;

export type FlashCard =
  | { kind: "cover" }
  | { kind: "fact"; index: number; text: string }
  | { kind: "quote" };

const MONO = "var(--font-jetbrains), monospace";
const DISPLAY = "var(--font-display), ui-sans-serif, system-ui, sans-serif";
const BODY = "var(--font-be-vietnam), system-ui, sans-serif";
const BRAND = "Bảo Tàng 1 Phút";

/**
 * One fixed 1080×1080 flashcard. All sizing in px so html-to-image exports are
 * deterministic. Colours come from the exhibition's theme. Brand text is fixed
 * (matches ShareCard); AI content stays in its original language.
 */
export default function FlashcardArtwork({
  ref,
  exhibition: ex,
  imageUrl,
  theme: t,
  card,
}: {
  ref: React.Ref<HTMLDivElement>;
  exhibition: Exhibition;
  imageUrl?: string;
  theme: Theme;
  card: FlashCard;
}) {
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: FLASHCARD_SIZE,
        height: FLASHCARD_SIZE,
        background: t.bg,
        color: t.ink,
        fontFamily: BODY,
        padding: 64,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
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
              fontFamily: MONO,
              fontSize: 21,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: t.accent,
            }}
          >
            {BRAND}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: t.inkSoft,
            }}
          >
            {ex.voice ? `Kể bởi ${ex.voice}` : "★"}
          </span>
        </div>

        {card.kind === "cover" && (
          <CoverBody ex={ex} imageUrl={imageUrl} t={t} />
        )}
        {card.kind === "fact" && <FactBody card={card} t={t} />}
        {card.kind === "quote" && <QuoteBody ex={ex} t={t} />}
      </div>
    </div>
  );
}

function CoverBody({
  ex,
  imageUrl,
  t,
}: {
  ex: Exhibition;
  imageUrl?: string;
  t: Theme;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {imageUrl && (
        <div
          style={{
            // Square frame, centred — fills for the 1:1 featured image.
            width: 520,
            height: 520,
            maxWidth: "100%",
            borderRadius: 20,
            marginBottom: 36,
            marginLeft: "auto",
            marginRight: "auto",
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
      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
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
          fontFamily: DISPLAY,
          fontSize: imageUrl ? 64 : 96,
          fontWeight: 600,
          // Room for Vietnamese stacked diacritics (Ế, Ỏ, Ự…).
          lineHeight: 1.16,
          paddingTop: 8,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: t.ink,
        }}
      >
        {ex.object_name}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 300,
          fontSize: 36,
          lineHeight: 1.25,
          color: t.inkSoft,
          marginTop: 22,
        }}
      >
        {ex.title}
      </div>
    </div>
  );
}

function FactBody({
  card,
  t,
}: {
  card: { index: number; text: string };
  t: Theme;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: 150,
          fontWeight: 700,
          lineHeight: 0.9,
          color: t.accent,
        }}
      >
        {String(card.index + 1).padStart(2, "0")}
      </span>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 19,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: t.inkSoft,
          margin: "24px 0 22px",
        }}
      >
        Fun fact
      </div>
      <p
        style={{
          fontFamily: DISPLAY,
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.38,
          paddingTop: 6,
          color: t.ink,
          margin: 0,
        }}
      >
        {card.text}
      </p>
    </div>
  );
}

function QuoteBody({ ex, t }: { ex: Exhibition; t: Theme }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{ borderLeft: `4px solid ${t.accent}`, paddingLeft: 32 }}
      >
        <p
          style={{
            fontFamily: DISPLAY,
            fontWeight: 300,
            fontSize: 58,
            lineHeight: 1.36,
            paddingTop: 6,
            color: t.ink,
            margin: 0,
          }}
        >
          “{ex.share_quote}”
        </p>
      </div>
      <div
        style={{
          marginTop: 44,
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        {ex.hashtags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: "0.12em",
              color: t.inkSoft,
            }}
          >
            #{cleanHashtag(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}
