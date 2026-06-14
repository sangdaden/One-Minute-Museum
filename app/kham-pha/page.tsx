import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { MODES } from "@/lib/types";
import type { Mode, Post } from "@/lib/types";
import { getCategory, matchesCategory } from "@/lib/categories";
import SiteHeader from "@/components/SiteHeader";
import StoriesTray from "@/components/StoriesTray";
import FeedPost from "@/components/FeedPost";
import FeedLoadMore from "@/components/FeedLoadMore";
import SectionTitle from "@/components/decor/SectionTitle";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; "chu-de"?: string; q?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const t = await getTranslations("Explore");
  const tFeed = await getTranslations("Feed");
  const tModes = await getTranslations("Modes");
  const tCat = await getTranslations("Categories");

  const sp = await searchParams;
  const mode = MODES.includes(sp.mode as Mode) ? (sp.mode as Mode) : null;
  const topic = sp["chu-de"] && getCategory(sp["chu-de"]) ? sp["chu-de"]! : null;
  const q = (sp.q ?? "").trim();
  const qLike = q.replace(/[\\%_]/g, "\\$&");
  const filtered = Boolean(topic || q); // topic/search disable pagination

  let posts: Post[] = [];
  let nextBefore: string | null = null;

  if (configured) {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)")
      .order("created_at", { ascending: false });

    if (q) query = query.ilike("object_name", `%${qLike}%`).limit(FEED_PAGE_SIZE);
    else if (topic) query = query.limit(60); // fetch a window, filter in JS
    else if (mode) query = query.eq("mode", mode).limit(FEED_PAGE_SIZE);
    else query = query.limit(FEED_PAGE_SIZE);

    const { data } = await query;
    posts = (data ?? []).map(rowToPost);
    if (topic) posts = posts.filter((p) => matchesCategory(p, topic));
    if (!filtered) {
      nextBefore = posts.length === FEED_PAGE_SIZE ? posts[posts.length - 1].created_at : null;
    }
  }

  const heading = topic
    ? t("topicHeading", { name: tCat(`${topic}.label`) })
    : q
      ? t("searchHeading", { q })
      : t("title");

  const emptyMsg = topic ? t("emptyTopic") : q ? t("emptySearch") : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-10 sm:px-8">
        <SectionTitle as="h1">{heading}</SectionTitle>

        {!filtered && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Chip href="/kham-pha" active={!mode}>{tFeed("allLenses")}</Chip>
            {MODES.map((m) => (
              <Chip key={m} href={`/kham-pha?mode=${encodeURIComponent(m)}`} active={mode === m}>
                {tModes(`${m}.label`)}
              </Chip>
            ))}
          </div>
        )}

        {filtered && (
          <Link href="/kham-pha" className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-deep">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t("clear")}
          </Link>
        )}

        {posts.length === 0 ? (
          <p className="border border-dashed border-border-strong bg-paper-card/40 px-6 py-16 text-center font-serif text-lg text-ink-soft">
            {emptyMsg ?? t("subtitle")}
          </p>
        ) : (
          <div className="space-y-5">
            {!filtered && <StoriesTray posts={posts} />}
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
            {!filtered && <FeedLoadMore initialNextBefore={nextBefore} mode={mode ?? undefined} />}
          </div>
        )}
      </main>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-teal bg-teal/5 text-teal ring-1 ring-teal/30"
          : "border-border-strong text-ink-soft hover:border-teal/50 hover:text-ink",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
