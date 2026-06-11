import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import { FEED_PAGE_SIZE, SUGGESTED_OBJECTS } from "@/lib/constants";
import { MODES } from "@/lib/types";
import type { Mode, Post } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import StoriesTray from "@/components/StoriesTray";
import FeedPost from "@/components/FeedPost";
import FeedLoadMore from "@/components/FeedLoadMore";

// Public community feed — render fresh each request.
export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const t = await getTranslations("Feed");
  const tNav = await getTranslations("Nav");
  const tModes = await getTranslations("Modes");

  const { mode: modeParam } = await searchParams;
  const mode = MODES.includes(modeParam as Mode) ? (modeParam as Mode) : null;

  let posts: Post[] = [];
  let totalCount = 0;

  if (configured) {
    const supabase = await createClient();

    let query = supabase
      .from("posts")
      .select(
        "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)",
      )
      .order("created_at", { ascending: false })
      .limit(FEED_PAGE_SIZE);
    if (mode) query = query.eq("mode", mode);
    const { data } = await query;
    posts = (data ?? []).map(rowToPost);

    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });
    totalCount = count ?? 0;
  }

  const nextBefore =
    posts.length === FEED_PAGE_SIZE
      ? posts[posts.length - 1].created_at
      : null;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
      {/* Hero + create CTA (sticky on large screens) */}
      <header className="space-y-5 lg:sticky lg:top-24">
        <div className="space-y-2">
          <h1 className="font-serif text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[3.4rem]">
            {t("title")}<span className="text-accent">.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper-card shadow-[0_1px_0_var(--color-accent-deep)] transition-colors hover:bg-accent-deep"
        >
          <span aria-hidden className="text-base leading-none">
            ＋
          </span>
          {tNav("createCta")}
        </Link>

        {/* Lens filter */}
        <div className="space-y-2.5 border-t border-border pt-5">
          <span className="eyebrow text-ink-faint">{t("lens")}</span>
          <div className="flex flex-wrap gap-2">
            <Chip href="/" active={!mode}>
              {t("allLenses")}
            </Chip>
            {MODES.map((m) => (
              <Chip
                key={m}
                href={`/?mode=${encodeURIComponent(m)}`}
                active={mode === m}
              >
                {tModes(`${m}.label`)}
              </Chip>
            ))}
          </div>
        </div>

        {/* Quick start */}
        <div className="space-y-2.5">
          <span className="eyebrow text-ink-faint">{t("quickStart")}</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_OBJECTS.slice(0, 8).map((name) => (
              <Link
                key={name}
                href={`/create?object=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-paper-card/60 px-3.5 py-1.5 text-sm text-ink-soft transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <span aria-hidden className="text-[8px] text-gold">
                  ◆
                </span>
                {name}
              </Link>
            ))}
          </div>
        </div>

        {/* Community stats */}
        {configured && totalCount > 0 && (
          <p className="eyebrow text-ink-faint">
            {t("statsExhibitions", { count: totalCount })}
          </p>
        )}
      </header>

      <section className="mt-10 lg:mt-0">
        {!configured ? (
          <Plate>
            {t.rich("notConfigured", {
              link: (chunks) => (
                <Link href="/create" className="text-accent underline">
                  {chunks}
                </Link>
              ),
            })}
          </Plate>
        ) : posts.length === 0 ? (
          <Plate>
            {t.rich("empty", {
              link: (chunks) => (
                <Link href="/create" className="text-accent underline">
                  {chunks}
                </Link>
              ),
            })}
          </Plate>
        ) : (
          <div className="space-y-5">
            <StoriesTray posts={posts} />
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
            <FeedLoadMore
              initialNextBefore={nextBefore}
              mode={mode ?? undefined}
            />
          </div>
        )}
      </section>
      </div>
      </main>
    </>
  );
}

/** A lens-filter pill; highlighted when active. */
function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-accent bg-accent/5 text-accent ring-1 ring-accent/30"
          : "border-border-strong text-ink-soft hover:border-accent/50 hover:text-ink",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function Plate({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
      <span aria-hidden className="font-serif text-5xl text-gold/50">
        ❦
      </span>
      <p className="max-w-md font-serif text-lg leading-snug text-ink-soft">
        {children}
      </p>
    </div>
  );
}
