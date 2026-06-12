"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import SectionTitle from "@/components/decor/SectionTitle";

export interface RecentItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
}

export default function RecentPosts({ posts }: { posts: RecentItem[] }) {
  const t = useTranslations("Home");
  return (
    <section className="mt-14">
      <SectionTitle allHref="/kham-pha" allLabel={t("seeAll")}>{t("recentTitle")}</SectionTitle>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-paper-card/40 px-6 py-16 text-center">
          <p className="font-serif text-lg text-ink-soft">{t("recentEmpty")}</p>
          <Link href="/create" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper-card hover:bg-accent-deep">
            {t("recentEmptyCta")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p) => (
            <Link key={p.id} href={`/p/${p.id}`} className="group overflow-hidden rounded-2xl border border-border bg-paper-card">
              <div className="h-24 bg-gradient-to-br from-[#caa24a] to-[#7e5b23]">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-ink transition-colors group-hover:text-accent">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
