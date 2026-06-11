"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/** Light/dark toggle. Reads the attribute set by the no-FOUC script in layout. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("omm-theme", next);
    } catch {
      // ignore
    }
    setDark(!dark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Chuyển sáng" : "Chuyển tối"}
      title="Đổi sáng/tối"
      className="text-ink-soft transition-colors hover:text-accent"
    >
      {dark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      )}
    </button>
  );
}
