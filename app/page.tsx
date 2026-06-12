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

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const tCat = await getTranslations("Categories");

  let posts: Post[] = [];
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select(
        "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)",
      )
      .order("created_at", { ascending: false })
      .limit(10);
    posts = (data ?? []).map(rowToPost);
  }

  // Featured = newest post with an image, else newest post.
  const featuredPost = posts.find((p) => p.image_url) ?? posts[0] ?? null;
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
