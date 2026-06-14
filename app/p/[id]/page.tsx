import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { APP_DESC } from "@/app/layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, rowToComment, postToExhibition } from "@/lib/posts";
import { formatDate, truncate } from "@/lib/format";
import type { Comment } from "@/lib/types";
import ExhibitionCard from "@/components/ExhibitionCard";
import ImageCredits from "@/components/ImageCredits";
import SiteHeader from "@/components/SiteHeader";
import ReactionBar from "@/components/ReactionBar";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("object_name, content, image_url, language")
      .eq("id", id)
      .maybeSingle();
    if (!data) return {};

    const content = (data.content ?? {}) as { title?: string; hook?: string };
    const title = `${content.title || data.object_name} · OMM`;
    const description = truncate(content.hook ?? "", 160) || APP_DESC;
    const images = data.image_url ? [data.image_url as string] : ["/og-default.jpg"];
    const locale = data.language === "en" ? "en_US" : "vi_VN";

    return {
      title,
      description,
      openGraph: { title, description, type: "article", url: `/p/${id}`, locale, images },
      twitter: { card: "summary_large_image", title, description, images },
    };
  } catch {
    return {};
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const t = await getTranslations("Post");
  const tCommon = await getTranslations("Common");

  const supabase = await createClient();
  const { data: postRow } = await supabase
    .from("posts")
    .select(
      "*, profiles(display_name, avatar_url), reactions(type, user_id), comments(count)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!postRow) notFound();
  const post = rowToPost(postRow);
  const exhibition = postToExhibition(post);

  const { data: commentRows } = await supabase
    .from("comments")
    .select("*, profiles(display_name, avatar_url)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });
  const comments: Comment[] = (commentRows ?? []).map(rowToComment);

  const authorName = post.author?.display_name || tCommon("anon");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
        {/* Left: author + reactions + discussion (fills the column).
            On mobile it sits below the exhibition (order-2). */}
        <aside className="order-2 space-y-5 lg:order-none">
          <Link
            href={`/u/${post.user_id}`}
            className="group flex items-center gap-3"
          >
            {post.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar_url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 font-serif text-lg text-teal">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-ink group-hover:text-accent">
                {authorName}
              </span>
              <span className="eyebrow text-ink-faint">
                {formatDate(post.created_at)}
              </span>
            </div>
          </Link>

          <div className="border-t border-border pt-5">
            <ReactionBar
              postId={post.id}
              initialReactions={post.reactions ?? []}
            />
          </div>

          {/* Comments */}
          <section className="space-y-6 border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <h2 className="eyebrow text-ink">
                {t("comments", { count: comments.length })}
              </h2>
              <span className="h-px flex-1 bg-border-strong" />
            </div>
            <CommentList comments={comments} />
            <CommentForm postId={post.id} />
          </section>
        </aside>

        {/* Right: the exhibition (the star content). First on mobile. */}
        <div className="order-1 space-y-3 lg:order-none">
          <ExhibitionCard
            exhibition={exhibition}
            imageUrl={post.image_url ?? undefined}
          />
          {exhibition.image_credit && (
            <div className="rounded-xl border border-border bg-paper-card/60 p-3">
              <ImageCredits credit={exhibition.image_credit} />
            </div>
          )}
        </div>
      </div>
      </main>
    </>
  );
}
