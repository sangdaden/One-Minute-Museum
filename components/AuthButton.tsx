"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

/** Masthead auth control: Google sign-in, or the signed-in user + sign-out. */
export default function AuthButton() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  if (!configured) return null;

  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  if (!ready) return <span className="eyebrow text-ink-faint">·</span>;

  if (!user) {
    return (
      <button
        type="button"
        onClick={signIn}
        className="eyebrow group inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
      >
        <LogIn className="h-3.5 w-3.5" strokeWidth={1.75} />
        Đăng nhập
      </button>
    );
  }

  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email ||
    "Bạn";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href="/me"
        className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-accent"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
          />
        ) : null}
        <span className="eyebrow max-w-[10ch] truncate">{name}</span>
      </Link>
      <button
        type="button"
        onClick={signOut}
        aria-label="Đăng xuất"
        className="text-ink-faint transition-colors hover:text-accent"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
