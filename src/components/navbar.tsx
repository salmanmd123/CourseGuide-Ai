"use client";

import Link from "next/link";
import { Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white shadow-sm">
            C
          </div>

          <div>
            <p className="text-[16px] font-bold leading-none tracking-tight text-zinc-900 dark:text-white">
              CourseGuide
            </p>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-600">
              AI Learning
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-9 md:flex">
          <Link
            href="/courses"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            Courses
          </Link>

          <Link
            href="/how-it-works"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            How it works
          </Link>

          <Link
            href="/features"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            Features
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Search */}
          <button
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Search size={19} strokeWidth={1.8} />
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle dark mode"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {theme === "dark" ? (
                <Sun size={19} strokeWidth={1.8} />
              ) : (
                <Moon size={19} strokeWidth={1.8} />
              )}
            </button>
          )}

          {/* Login */}
          <Link
            href="/login"
            className="hidden px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white sm:block"
          >
            Log in
          </Link>

          {/* Get started */}
          <Link
            href="/register"
            className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Get started
          </Link>

        </div>
      </div>
    </header>
  );
}

