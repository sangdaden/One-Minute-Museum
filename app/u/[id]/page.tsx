import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, postToExhibition } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import GalleryItem from "@/components/GalleryItem";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const t = await getTranslations("Profile");
  const tCommon = await getTranslations("Common");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!profile) notFound();

  const { data: postRows, count } = await supabase
    .from("posts")
    .select("*, profiles(display_name, avatar_url)", { count: "exact" })
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(60);
  const posts: Post[] = (postRows ?? []).map(rowToPost);

  const name = profile.display_name || tCommon("anon");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
      {/* Profile header (sticky on large screens) */}
      <header className="flex items-center gap-5 lg:sticky lg:top-24 lg:flex-col lg:items-start lg:gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-20 w-20 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal/10 font-serif text-3xl text-teal">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="space-y-1.5">
          <h1 className="font-serif text-[2rem] font-medium leading-none tracking-[-0.01em] text-ink sm:text-[2.6rem]">
            {name}
          </h1>
          <p className="eyebrow text-ink-faint">
            {t("joined")} {formatDate(profile.created_at)}{" "}
            <span className="text-gold">·</span>{" "}
            {count ?? posts.length} {tCommon("objects")}
          </p>
        </div>
      </header>

      {/* Posts */}
      <section className="mt-10 lg:mt-0">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
            <span aria-hidden className="font-serif text-5xl text-gold/50">
              ❦
            </span>
            <p className="font-serif text-lg italic leading-snug text-ink-soft">
              {t("empty")}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {posts.map((post, i) => (
              <li key={post.id}>
                <Link href={`/p/${post.id}`} className="block">
                  <GalleryItem
                    exhibition={postToExhibition(post)}
                    index={i}
                    imageUrl={post.image_url ?? undefined}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
      </main>
    </>
  );
}
