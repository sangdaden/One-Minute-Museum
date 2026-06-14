import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost } from "@/lib/posts";
import type { Post } from "@/lib/types";
import { primaryCategory } from "@/lib/categories";
import SiteHeader from "@/components/SiteHeader";
import HomeHero from "@/components/home/HomeHero";
import FeaturedStrip, { type FeaturedData } from "@/components/home/FeaturedStrip";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecentPosts, { type RecentItem } from "@/components/home/RecentPosts";

export const dynamic = "force-dynamic";

/** Featured = most-interacted post within this rolling window. */
const FEATURED_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * The post id with the most interactions (reactions + comments, weighted
 * equally) created since `sinceISO`, or null when there were none in the window.
 */
async function mostInteractedPostId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sinceISO: string,
): Promise<string | null> {
  const [reactions, comments] = await Promise.all([
    supabase.from("reactions").select("post_id").gte("created_at", sinceISO),
    supabase.from("comments").select("post_id").gte("created_at", sinceISO),
  ]);
  const counts = new Map<string, number>();
  for (const row of [...(reactions.data ?? []), ...(comments.data ?? [])]) {
    const id = (row as { post_id: string }).post_id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let topId: string | null = null;
  let topCount = 0;
  for (const [id, n] of counts) {
    if (n > topCount) {
      topCount = n;
      topId = id;
    }
  }
  return topId;
}

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const tCat = await getTranslations("Categories");

  const POST_SELECT =
    "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)";

  let posts: Post[] = [];
  let featuredPost: Post | null = null;
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .order("created_at", { ascending: false })
      .limit(10);
    posts = (data ?? []).map(rowToPost);

    // Featured = the post with the most interactions in the last 24h. The hot
    // post may be older than the latest 10, so fetch it by id.
    const sinceISO = new Date(Date.now() - FEATURED_WINDOW_MS).toISOString();
    const topId = await mostInteractedPostId(supabase, sinceISO);
    if (topId) {
      const { data: topRow } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("id", topId)
        .maybeSingle();
      if (topRow) featuredPost = rowToPost(topRow);
    }
  }

  // Fallback when nobody interacted in the window: newest post with an image,
  // else newest post.
  if (!featuredPost) {
    featuredPost = posts.find((p) => p.image_url) ?? posts[0] ?? null;
  }
  const recentPosts = posts.filter((p) => p.id !== featuredPost?.id).slice(0, 4);

  const featured: FeaturedData | null = featuredPost
    ? (() => {
        const cat = primaryCategory(featuredPost);
        return {
          id: featuredPost.id,
          title: featuredPost.content.title || featuredPost.object_name,
          excerpt: featuredPost.content.hook ?? "",
          imageUrl: featuredPost.image_url ?? null,
          categoryLabel: cat ? tCat(`${cat.slug}.label`) : null,
          hashtags: featuredPost.content.hashtags ?? [],
          funFact: featuredPost.content.three_fun_facts?.[0] ?? null,
        };
      })()
    : null;

  const recent: RecentItem[] = recentPosts.map((p) => ({
    id: p.id,
    title: p.content.title || p.object_name,
    excerpt: p.content.hook ?? "",
    imageUrl: p.image_url ?? null,
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] px-5 pb-10 pt-6 sm:px-8">
        <HomeHero />
        <FeaturedStrip featured={featured} />
        <HowItWorks />
        <CategoryGrid />
        <RecentPosts posts={recent} />
      </main>
    </>
  );
}
