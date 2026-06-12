"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Menu as MenuIcon, X } from "lucide-react";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";

/**
 * Top-nav app shell: brand (left), primary nav + search + account control
 * (right). Mobile collapses the nav into a slide-down drawer. Sticky, blurred.
 */
export default function SiteHeader() {
  const t = useTranslations("Nav");
  const tBrand = useTranslations("Brand");
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");

  const links = [
    { href: "/kham-pha", label: t("explore") },
    { href: "/chu-de", label: t("topics") },
    { href: "/gioi-thieu", label: t("about") },
  ];

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/kham-pha?q=${encodeURIComponent(term)}`);
    setDrawer(false);
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`text-sm transition-colors ${active ? "font-semibold text-accent" : "text-ink hover:text-accent"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label={tBrand("name")} className="shrink-0 transition-opacity hover:opacity-80">
          <Logo tagline={tBrand("tagline")} className="text-[1.3rem]" />
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-5 lg:flex">
          {navLink("/kham-pha", t("explore"))}
          {/* Collections: deferred → non-link placeholder */}
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-faint" title={t("comingSoon")}>
            {t("collections")}
            <span className="rounded-full bg-paper-sunk px-1.5 py-0.5 text-[10px] text-ink-faint">{t("comingSoon")}</span>
          </span>
          {navLink("/chu-de", t("topics"))}
          {navLink("/gioi-thieu", t("about"))}
        </nav>

        <div className="flex-1" />

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="hidden items-center md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border-strong bg-paper-card/60 px-3 py-1.5">
            <Search className="h-4 w-4 text-ink-faint" strokeWidth={2} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("search")}
              className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </form>

        <AccountMenu />

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setDrawer((v) => !v)}
          aria-label={drawer ? t("closeMenu") : t("openMenu")}
          className="text-ink lg:hidden"
        >
          {drawer ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="border-t border-border bg-paper-card px-5 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-full border border-border-strong bg-paper px-3 py-2">
            <Search className="h-4 w-4 text-ink-faint" strokeWidth={2} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("search")}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </form>
          <nav className="flex flex-col gap-3" onClick={() => setDrawer(false)}>
            {links.map((l) => navLink(l.href, l.label))}
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-faint">
              {t("collections")}
              <span className="rounded-full bg-paper-sunk px-1.5 py-0.5 text-[10px]">{t("comingSoon")}</span>
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
