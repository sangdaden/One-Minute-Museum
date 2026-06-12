"use client";

import { useTranslations } from "next-intl";
import { Upload, BrainCircuit, FileText } from "lucide-react";
import SectionTitle from "@/components/decor/SectionTitle";

export default function HowItWorks() {
  const t = useTranslations("Home");
  const steps = [
    { n: 1, Icon: Upload, title: t("how1Title"), desc: t("how1Desc") },
    { n: 2, Icon: BrainCircuit, title: t("how2Title"), desc: t("how2Desc") },
    { n: 3, Icon: FileText, title: t("how3Title"), desc: t("how3Desc") },
  ];
  return (
    <section className="mt-14">
      <SectionTitle center>{t("howTitle")}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map(({ n, Icon, title, desc }) => (
          <div key={n} className="flex gap-3 rounded-2xl border border-border bg-paper-card p-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-paper-card">{n}</span>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal" strokeWidth={2} />
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
