"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";

/**
 * Unified top app bar across all screens: a full-width sticky bar with the OMM
 * logo pinned to the far left (links home) and the account menu to the far
 * right. Client island — usable in both server and client pages.
 */
export default function SiteHeader() {
  const t = useTranslations("Brand");
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link
          href="/"
          aria-label={t("name")}
          className="transition-opacity hover:opacity-80"
        >
          <Logo tagline={t("tagline")} className="text-[1.35rem]" />
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
