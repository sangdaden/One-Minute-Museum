import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { rowToPost, postToExhibition } from "@/lib/posts";
import type { Post } from "@/lib/types";
import GalleryItem from "@/components/GalleryItem";
import AccountMenu from "@/components/AccountMenu";

// Auth-dependent page — always render per-request (read the session fresh).
export const dynamic = "force-dynamic";

export default async function MePage() {
  const configured = isSupabaseConfigured();
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
    <main className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      {/* Masthead */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="eyebrow group inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span> Trang chủ
        </Link>
        <AccountMenu />
      </div>
      <div className="mt-3 h-px bg-ink/80" />

      <header className="mt-9 space-y-3 sm:mt-12">
        <h1 className="font-serif text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink sm:text-[3.4rem]">
          Bài của tôi<span className="text-accent">.</span>
        </h1>
        <p className="text-base leading-relaxed text-ink-soft">
          Những triển lãm bạn đã đăng lên cộng đồng.
        </p>
      </header>

      <section className="mt-10">
        {!configured ? (
          <Plate>Tính năng cộng đồng chưa được cấu hình trên máy chủ.</Plate>
        ) : !signedIn ? (
          <Plate>Đăng nhập (góc trên phải) để xem bài bạn đã đăng.</Plate>
        ) : posts.length === 0 ? (
          <Plate>
            Bạn chưa đăng bài nào. Tạo một triển lãm rồi bấm “Đăng lên cộng đồng”.
          </Plate>
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
