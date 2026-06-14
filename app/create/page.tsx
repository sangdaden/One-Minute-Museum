"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Crop, X } from "lucide-react";
import type {
  ApiError,
  Exhibition,
  ImageCredit,
  Mode,
  Voice,
} from "@/lib/types";
import { DEFAULT_MODE, DEFAULT_VOICE } from "@/lib/constants";
import { saveExhibition, updateExhibition } from "@/lib/gallery";
import ObjectInput from "@/components/ObjectInput";
import ImageUpload from "@/components/ImageUpload";
import ModeSelector from "@/components/ModeSelector";
import VoiceSelector from "@/components/VoiceSelector";
import ThemePicker from "@/components/ThemePicker";
import CategorySelector from "@/components/CategorySelector";
import SuggestedObjects from "@/components/SuggestedObjects";
import ImageSuggestions from "@/components/ImageSuggestions";
import CulturalImagePicker from "@/components/CulturalImagePicker";
import ImageCredits from "@/components/ImageCredits";
import ImageCropper from "@/components/ImageCropper";
import ExhibitionCard from "@/components/ExhibitionCard";
import EditExhibitionForm from "@/components/EditExhibitionForm";
import ShareCard from "@/components/ShareCard";
import PublishButton from "@/components/PublishButton";
import SiteHeader from "@/components/SiteHeader";
import LoadingExhibition from "@/components/LoadingExhibition";
import ErrorState from "@/components/ErrorState";
import { PENDING_IMAGE_KEY } from "@/components/home/HomeHero";

export default function CreatePage() {
  const t = useTranslations("Create");
  const tCrop = useTranslations("Cropper");
  const tIll = useTranslations("Illustrate");
  const locale = useLocale();
  const [objectName, setObjectName] = useState("");
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [voice, setVoice] = useState<Voice>(DEFAULT_VOICE);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  // The image actually used for the shown result (so changing the picker later
  // doesn't retroactively alter the displayed card).
  const [resultImage, setResultImage] = useState<string | null>(null);
  // Where the result image came from: an uploaded photo, an AI illustration, or
  // nothing yet. Drives whether the AI-illustration picker is offered.
  const [imageSource, setImageSource] = useState<
    "upload" | "ai" | "curated" | null
  >(null);
  const [editing, setEditing] = useState(false);
  const [cropping, setCropping] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Prefill the object from a quick-start link (e.g. /create?object=Áo mưa),
  // and pick up a photo handed off from the home hero dropzone.
  useEffect(() => {
    const obj = new URLSearchParams(window.location.search).get("object");
    if (obj) setObjectName(obj);
    const pending = sessionStorage.getItem(PENDING_IMAGE_KEY);
    if (pending) {
      setImage(pending);
      sessionStorage.removeItem(PENDING_IMAGE_KEY);
    }
  }, []);

  async function generate(name: string, selectedMode: Mode, selectedVoice: Voice) {
    const trimmed = name.trim();
    // Need either a typed name or an attached photo.
    if (trimmed.length === 0 && !image) return;

    setIsLoading(true);
    setError(null);
    // Bring the result area into view on smaller screens.
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

    try {
      const res = await fetch("/api/exhibitions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_name: trimmed,
          mode: selectedMode,
          voice: selectedVoice,
          language: locale === "en" ? "en" : "vi",
          image: image ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        throw new Error(data.error?.message);
      }

      const data = (await res.json()) as Exhibition;
      setExhibition(data);
      setResultImage(image); // photo shown with this result (not persisted)
      setImageSource(image ? "upload" : null);
      setEditing(false);
      // Persist to the local gallery (dedupes by id, image excluded).
      saveExhibition(data);
    } catch (err) {
      setError(
        err instanceof Error && err.message ? err.message : t("generateError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handlePickSuggested(name: string) {
    setObjectName(name);
    generate(name, mode, voice);
  }

  function handleChangeObject() {
    setError(null);
    setExhibition(null);
    setImage(null);
    setResultImage(null);
    setImageSource(null);
    setEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Attach/clear attribution for a curated featured image (persisted in content).
  function applyImageCredit(credit: ImageCredit | null) {
    if (!exhibition) return;
    const next: Exhibition = { ...exhibition };
    if (credit) next.image_credit = credit;
    else delete next.image_credit;
    setExhibition(next);
    updateExhibition(next);
  }

  function clearFeaturedImage() {
    setResultImage(null);
    setImageSource(null);
    applyImageCredit(null);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      {/* Top: hero on the left, controls on the right (large screens). */}
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
        {/* Hero */}
        <header className="space-y-4 lg:sticky lg:top-10">
        <h1
          className="reveal font-serif text-[2.9rem] font-medium leading-[0.98] tracking-[-0.02em] text-ink sm:text-[4.2rem]"
          style={{ animationDelay: "100ms" }}
        >
          {t("heroLine1")}
          <br />
          <span className="text-accent">{t("heroLine2")}</span>
        </h1>
        <p
          className="reveal max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
          style={{ animationDelay: "160ms" }}
        >
          {t("tagline")}
        </p>
        <p
          className="reveal eyebrow text-ink-faint"
          style={{ animationDelay: "190ms" }}
        >
          One-Minute Museum for everyday objects.
        </p>
        </header>

        {/* Controls column */}
        <div className="mt-10 flex flex-col gap-10 lg:mt-0">
          {/* Góc nhìn + giọng kể TRƯỚC — vì chạm một gợi ý là tạo ngay. */}
          <section
            className="reveal flex flex-col gap-4"
            style={{ animationDelay: "220ms" }}
          >
        <div className="flex items-center gap-3">
          <span className="eyebrow text-ink">{t("sectionMode")}</span>
          <span className="h-px flex-1 bg-border-strong" />
        </div>
        <ModeSelector value={mode} onChange={setMode} disabled={isLoading} />

        <div className="mt-2 flex items-center gap-3">
          <span className="eyebrow text-ink">{t("sectionVoice")}</span>
          <span className="h-px flex-1 bg-border-strong" />
        </div>
        <VoiceSelector value={voice} onChange={setVoice} disabled={isLoading} />
      </section>

          {/* Hiện vật — nhập tên/ảnh, hoặc chạm gợi ý (chạm là tạo ngay). */}
          <section
            className="reveal flex flex-col gap-4"
            style={{ animationDelay: "300ms" }}
          >
        <div className="flex items-center gap-3">
          <span className="eyebrow text-ink">{t("sectionObject")}</span>
          <span className="h-px flex-1 bg-border-strong" />
        </div>
        <div className="flex flex-col gap-3">
          <ObjectInput
            value={objectName}
            onChange={setObjectName}
            onSubmit={() => generate(objectName, mode, voice)}
            disabled={isLoading}
            allowEmpty={!!image}
            nameDisabled={!!image}
            placeholder={
              image ? t("placeholderHasImage") : t("placeholderObject")
            }
          />
          <ImageUpload value={image} onChange={setImage} disabled={isLoading} />
        </div>
          <SuggestedObjects
            onPick={handlePickSuggested}
            disabled={isLoading || !!image}
          />
          </section>
        </div>
      </div>

      {/* Result */}
      <section ref={resultRef} className="mt-14 scroll-mt-6">
        {isLoading ? (
          <LoadingExhibition />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => generate(objectName, mode, voice)}
            onChangeObject={handleChangeObject}
          />
        ) : exhibition ? (
          editing ? (
            <EditExhibitionForm
              exhibition={exhibition}
              onSave={(updated) => {
                setExhibition(updated);
                updateExhibition(updated);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="eyebrow text-ink">{t("sectionCategory")}</span>
                  <span className="text-xs text-ink-faint">{t("categoryHint")}</span>
                </div>
                <CategorySelector
                  value={exhibition.category ?? "khac"}
                  onChange={(cat) => {
                    const updated = { ...exhibition, category: cat };
                    setExhibition(updated);
                    updateExhibition(updated);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="eyebrow text-ink">{t("sectionStyle")}</span>
                <ThemePicker
                  value={exhibition.theme ?? "macdinh"}
                  onChange={(themeId) => {
                    const updated = { ...exhibition, theme: themeId };
                    setExhibition(updated);
                    updateExhibition(updated);
                  }}
                />
              </div>

              {exhibition.theme === "note" && (
                <div className="flex flex-col gap-2">
                  <span className="eyebrow text-ink">{t("noteLabel")}</span>
                  <input
                    type="text"
                    value={exhibition.note ?? ""}
                    maxLength={120}
                    placeholder={t("notePlaceholder")}
                    onChange={(e) => {
                      const updated = { ...exhibition, note: e.target.value };
                      setExhibition(updated);
                      updateExhibition(updated);
                    }}
                    className="w-full rounded-lg border border-border bg-paper-card px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:border-accent"
                  />
                </div>
              )}

              {/* Pick a featured image: AI illustration or a real cultural image. */}
              {!resultImage && (
                <div className="space-y-7">
                  <ImageSuggestions
                    objectName={exhibition.object_name}
                    chosen={null}
                    onPick={(uri) => {
                      setResultImage(uri);
                      setImageSource("ai");
                      applyImageCredit(null);
                    }}
                    onClear={() => {}}
                  />
                  <CulturalImagePicker
                    topic={exhibition.object_name}
                    onPick={(uri, cand) => {
                      setResultImage(uri);
                      setImageSource("curated");
                      applyImageCredit({
                        source: cand.source,
                        author: cand.author,
                        license: cand.license,
                        sourceUrl: cand.sourceUrl,
                        title: cand.title,
                      });
                    }}
                  />
                </div>
              )}

              {/* Chosen image: credits (curated) + reframe / remove. */}
              {resultImage && (
                <div className="flex flex-col items-center gap-3">
                  {imageSource === "curated" && exhibition.image_credit && (
                    <div className="w-full max-w-md rounded-xl border border-border bg-paper-card/60 p-3">
                      <ImageCredits credit={exhibition.image_credit} />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCropping(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      <Crop className="h-4 w-4" strokeWidth={1.75} />
                      {tCrop("adjust")}
                    </button>
                    <button
                      type="button"
                      onClick={clearFeaturedImage}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-faint transition-colors hover:text-accent"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                      {tIll("remove")}
                    </button>
                  </div>
                </div>
              )}

              <ExhibitionCard
                exhibition={exhibition}
                imageUrl={resultImage ?? undefined}
                onRegenerate={() =>
                  generate(exhibition.object_name, mode, voice)
                }
              />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  {t("editContent")}
                </button>
                <PublishButton
                  exhibition={exhibition}
                  imageUrl={resultImage ?? undefined}
                />
              </div>
              <ShareCard
                exhibition={exhibition}
                imageUrl={resultImage ?? undefined}
              />
            </div>
          )
        ) : (
          <div className="reveal flex flex-col items-center gap-4 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
            <span className="eyebrow text-ink-faint">{t("lobbyEyebrow")}</span>
            <span aria-hidden className="font-serif text-5xl text-gold/50">
              ❦
            </span>
            <p className="max-w-md font-serif text-xl leading-snug text-ink">
              {t("lobbyTitle")}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              {t("lobbyBody")}
            </p>
          </div>
        )}
      </section>

      <footer className="mt-16 flex items-center justify-between border-t border-border pt-5">
        <span className="eyebrow text-ink-faint">One-Minute Museum</span>
        <span className="eyebrow text-ink-faint">© 2026</span>
      </footer>

      {cropping && resultImage && (
        <ImageCropper
          src={resultImage}
          onCancel={() => setCropping(false)}
          onDone={(uri) => {
            setResultImage(uri);
            if (imageSource === "upload") setImage(uri);
            setCropping(false);
          }}
        />
      )}
      </main>
    </>
  );
}
