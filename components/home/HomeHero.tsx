"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Upload, ImagePlus, BookOpen, ShieldCheck } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/image";
import DongSonWatermark from "@/components/decor/DongSonWatermark";
import LotusMotif from "@/components/decor/LotusMotif";

/** Session key the create page reads once to pre-load a dropped photo. */
export const PENDING_IMAGE_KEY = "omm-pending-image";

export default function HomeHero() {
  const t = useTranslations("Home");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      sessionStorage.setItem(PENDING_IMAGE_KEY, dataUrl);
      router.push("/create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_90%_at_85%_10%,var(--color-paper-sunk),var(--color-paper))] px-6 py-12 sm:px-10 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-[1.12] text-ink sm:text-5xl">
            {t("heroTitle1")}<br />
            <span className="text-accent">{t("heroTitle2")}</span><br />
            <span className="text-accent">{t("heroTitle3")}</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">{t("heroLead")}</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`mt-6 cursor-pointer rounded-2xl border border-dashed px-6 py-7 text-center transition-colors ${drag ? "border-accent bg-paper-card" : "border-border-strong bg-paper-card/60"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; handleFile(f); }}
            />
            <ImagePlus className="mx-auto mb-2 h-8 w-8 text-gold" strokeWidth={1.6} />
            <p className="text-sm text-ink-soft">{busy ? "…" : t("heroDrop")}</p>
            <p className="mt-1 text-xs text-ink-faint">{t("heroDropHint")}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper-card shadow-[0_1px_0_var(--color-accent-deep)] transition-colors hover:bg-accent-deep">
              <Upload className="h-4 w-4" strokeWidth={2} /> {t("heroCreate")}
            </Link>
            <Link href="/kham-pha" className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent">
              <BookOpen className="h-4 w-4" strokeWidth={2} /> {t("heroExample")}
            </Link>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-faint">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} /> {t("heroPrivacy")}
          </p>
        </div>

        {/* Decorative collage */}
        <div className="relative hidden min-h-[260px] lg:block" aria-hidden>
          <DongSonWatermark className="absolute right-4 top-2 w-64 text-gold/15" />
          <div className="absolute left-6 top-6 h-40 w-56 -rotate-6 rounded-xl border-4 border-paper-card bg-gradient-to-br from-[#b9763a] to-[#8a4f28] shadow-xl" />
          <div className="absolute bottom-6 right-10 h-32 w-32 rounded-full border-4 border-paper-card bg-[radial-gradient(circle,#caa24a,#7e5b23)] shadow-xl" />
          <LotusMotif className="absolute bottom-2 left-16 w-16 text-accent/70" />
        </div>
      </div>
    </section>
  );
}
