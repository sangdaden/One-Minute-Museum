import Link from "next/link";
import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, postToExhibition } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";
import AccountMenu from "@/components/AccountMenu";
import GalleryItem from "@/components/GalleryItem";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

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

  const name = profile.display_name || "Người dùng ẩn danh";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      {/* Masthead */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="eyebrow group inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span> Khám phá
        </Link>
        <AccountMenu />
      </div>
      <div className="mt-3 h-px bg-ink/80" />

      {/* Profile header */}
      <header className="mt-9 flex items-center gap-5 sm:mt-12">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-paper-sunk font-serif text-3xl text-ink-soft">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="space-y-1.5">
          <h1 className="font-serif text-[2rem] font-medium leading-none tracking-[-0.01em] text-ink sm:text-[2.6rem]">
            {name}
          </h1>
          <p className="eyebrow text-ink-faint">
            Tham gia {formatDate(profile.created_at)}{" "}
            <span className="text-gold">·</span>{" "}
            {count ?? posts.length} hiện vật
          </p>
        </div>
      </header>

      {/* Posts */}
      <section className="mt-10">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
            <span aria-hidden className="font-serif text-5xl text-gold/50">
              ❦
            </span>
            <p className="font-serif text-lg italic leading-snug text-ink-soft">
              Người này chưa đăng hiện vật nào.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </main>
  );
}
