import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, postToExhibition } from "@/lib/posts";
import type { Post } from "@/lib/types";
import GalleryItem from "@/components/GalleryItem";
import SiteHeader from "@/components/SiteHeader";

// Auth-dependent page — always render per-request (read the session fresh).
export const dynamic = "force-dynamic";

export default async function MePage() {
  const configured = isSupabaseConfigured();
  const t = await getTranslations("Me");
  let signedIn = false;
  let posts: Post[] = [];

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = !!user;
    if (user) {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      posts = (data ?? []).map(rowToPost);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
      <header className="space-y-3 lg:sticky lg:top-24">
        <h1 className="font-serif text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[3.4rem]">
          {t("title")}<span className="text-accent">.</span>
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          {t("subtitle")}
        </p>
      </header>

      <section className="mt-10 lg:mt-0">
        {!configured ? (
          <Plate>{t("notConfigured")}</Plate>
        ) : !signedIn ? (
          <Plate>{t("signInPrompt")}</Plate>
        ) : posts.length === 0 ? (
          <Plate>{t("empty")}</Plate>
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

function Plate({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-border-strong bg-paper-card/40 px-6 py-20 text-center">
      <span aria-hidden className="font-serif text-4xl text-gold/50">
        ❦
      </span>
      <p className="max-w-md font-serif text-lg leading-snug text-ink-soft">
        {children}
      </p>
    </div>
  );
}
