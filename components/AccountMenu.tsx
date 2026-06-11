"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  UserCircle,
  Compass,
  Sparkles,
  LayoutGrid,
  Newspaper,
  Sun,
  Moon,
  LogIn,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

/**
 * Single account/settings button → dropdown: user info, navigation, the
 * light/dark toggle, and sign in/out. Replaces the separate username + theme +
 * sign-out controls in the masthead.
 */
export default function AccountMenu() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
    if (!configured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("omm-theme", next);
    } catch {
      // ignore
    }
    setDark(!dark);
  }

  async function signIn() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    await createClient().auth.signOut();
    setUser(null);
    setOpen(false);
  }

  const name =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email ||
    "Bạn";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Tài khoản & cài đặt"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-ink-soft ring-1 ring-border transition-colors hover:text-accent"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-8 w-8 object-cover" />
        ) : (
          <UserIcon className="h-4 w-4" strokeWidth={1.75} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-paper-card p-1.5 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)]">
          {user && (
            <div className="border-b border-border px-3 py-2.5">
              <div className="truncate text-sm font-medium text-ink">{name}</div>
              {user.email && (
                <div className="eyebrow truncate text-ink-faint">
                  {user.email}
                </div>
              )}
            </div>
          )}

          <div className="py-1">
            <Row href="/" icon={Compass} onNavigate={() => setOpen(false)}>
              Khám phá
            </Row>
            <Row href="/create" icon={Sparkles} onNavigate={() => setOpen(false)}>
              Tạo triển lãm
            </Row>
            {user && (
              <Row
                href={`/u/${user.id}`}
                icon={UserCircle}
                onNavigate={() => setOpen(false)}
              >
                Trang cá nhân
              </Row>
            )}
            {user && (
              <Row href="/me" icon={Newspaper} onNavigate={() => setOpen(false)}>
                Bài của tôi
              </Row>
            )}
            <Row
              href="/gallery"
              icon={LayoutGrid}
              onNavigate={() => setOpen(false)}
            >
              Bộ sưu tập
            </Row>
          </div>

          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
            >
              {dark ? (
                <Sun className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Moon className="h-4 w-4" strokeWidth={1.75} />
              )}
              Giao diện: {dark ? "Tối" : "Sáng"}
            </button>

            {configured &&
              (user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-sunk hover:text-accent"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  Đăng xuất
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signIn}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-sunk hover:text-accent"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.75} />
                  Đăng nhập với Google
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  href,
  icon: Icon,
  onNavigate,
  children,
}: {
  href: string;
  icon: LucideIcon;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {children}
    </Link>
  );
}
