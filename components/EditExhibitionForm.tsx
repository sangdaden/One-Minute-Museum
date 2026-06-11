"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Exhibition } from "@/lib/types";
import { cleanHashtag } from "@/lib/format";

interface EditExhibitionFormProps {
  exhibition: Exhibition;
  onSave: (edited: Exhibition) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-paper px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-accent";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="eyebrow text-accent">{label}</span>
      {children}
    </label>
  );
}

/** Edit every content field of a generated exhibition before publishing. */
export default function EditExhibitionForm({
  exhibition: ex,
  onSave,
  onCancel,
}: EditExhibitionFormProps) {
  const t = useTranslations("Edit");
  const [title, setTitle] = useState(ex.title);
  const [hook, setHook] = useState(ex.hook);
  const [whatItIs, setWhatItIs] = useState(ex.what_it_is);
  const [origin, setOrigin] = useState(ex.origin_or_context);
  const [facts, setFacts] = useState<string[]>([
    ex.three_fun_facts[0] ?? "",
    ex.three_fun_facts[1] ?? "",
    ex.three_fun_facts[2] ?? "",
  ]);
  const [insight, setInsight] = useState(ex.design_or_cultural_insight);
  const [why, setWhy] = useState(ex.why_it_matters);
  const [reflection, setReflection] = useState(ex.reflection_question);
  const [shareQuote, setShareQuote] = useState(ex.share_quote);
  const [hashtags, setHashtags] = useState(ex.hashtags.join(", "));

  const canSave = title.trim().length > 0 && hook.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const tags = hashtags
      .split(",")
      .map((t) => cleanHashtag(t))
      .filter((t) => t.length > 0);

    onSave({
      ...ex,
      title: title.trim(),
      hook: hook.trim(),
      what_it_is: whatItIs.trim(),
      origin_or_context: origin.trim(),
      three_fun_facts: facts.map((f) => f.trim()),
      design_or_cultural_insight: insight.trim(),
      why_it_matters: why.trim(),
      reflection_question: reflection.trim(),
      share_quote: shareQuote.trim(),
      hashtags: tags.length > 0 ? tags : ex.hashtags,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-paper-card p-6 shadow-[0_8px_24px_-18px_rgba(120,40,30,0.45)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-2xl font-medium text-ink">
          {t("title")}
        </h2>
        <span className="eyebrow text-ink-faint">
          {ex.object_name} · {ex.mode}
        </span>
      </div>

      <Field label={t("fldTitle")}>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <Field label={t("fldHook")}>
        <textarea
          className={inputClass}
          rows={2}
          value={hook}
          onChange={(e) => setHook(e.target.value)}
        />
      </Field>

      <Field label={t("fldWhat")}>
        <textarea
          className={inputClass}
          rows={2}
          value={whatItIs}
          onChange={(e) => setWhatItIs(e.target.value)}
        />
      </Field>

      <Field label={t("fldStory")}>
        <textarea
          className={inputClass}
          rows={3}
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
      </Field>

      <Field label={t("fldFacts")}>
        <div className="space-y-2">
          {facts.map((f, i) => (
            <textarea
              key={i}
              className={inputClass}
              rows={2}
              placeholder={t("factPlaceholder", { n: i + 1 })}
              value={f}
              onChange={(e) =>
                setFacts((prev) =>
                  prev.map((x, idx) => (idx === i ? e.target.value : x)),
                )
              }
            />
          ))}
        </div>
      </Field>

      <Field label={t("fldInsight")}>
        <textarea
          className={inputClass}
          rows={3}
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
        />
      </Field>

      <Field label={t("fldWhy")}>
        <textarea
          className={inputClass}
          rows={2}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
        />
      </Field>

      <Field label={t("fldReflection")}>
        <textarea
          className={inputClass}
          rows={2}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </Field>

      <Field label={t("fldQuote")}>
        <input
          className={inputClass}
          value={shareQuote}
          onChange={(e) => setShareQuote(e.target.value)}
        />
      </Field>

      <Field label={t("fldHashtags")}>
        <input
          className={inputClass}
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="BaoTang1Phut, OneMinuteMuseum"
        />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper-card transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("save")}
        </button>
      </div>
    </form>
  );
}
