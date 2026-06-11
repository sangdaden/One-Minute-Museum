import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import type { Post } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import FeedPost from "@/components/FeedPost";
import FeedLoadMore from "@/components/FeedLoadMore";

// Public community feed — render fresh each request.
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const configured = isSupabaseConfigured();
  const t = await getTranslations("Feed");
  const tNav = await getTranslations("Nav");
  let posts: Post[] = [];

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select(
        "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)",
      )
      .order("created_at", { ascending: false })
      .limit(FEED_PAGE_SIZE);
    posts = (data ?? []).map(rowToPost);
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
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
            <FeedLoadMore initialNextBefore={nextBefore} />
          </div>
        )}
      </section>
      </div>
      </main>
    </>
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
