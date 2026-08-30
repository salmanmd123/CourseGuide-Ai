"use client";

import Link from "next/link";
import {
    Moon,
    Search,
    Sun,
    User,
    BookOpen,
    Settings,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type UserData = {
    id: number;
    name: string;
    email: string;
};

export default function Navbar() {
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);

        async function checkUser() {
            try {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                });

                const data = await response.json();

                setUser(data.user ?? null);
            } catch (error) {
                console.error("Failed to get current user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkUser();
    }, []);

    async function handleLogout() {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (response.ok) {
                setUser(null);
                setProfileOpen(false);

                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/90">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">

                    <img
                        src="/logo.png"
                        alt="CourseGuide"
                        className="h-10 w-10 rounded-xl object-contain"
                    />

                    <div>
                        <div className="translate-y-1">
                            <span className="text-[16px] font-bold leading-none tracking-tight text-zinc-900 dark:text-white">
                                Course
                            </span>

                            <span className="text-[16px] font-bold leading-none tracking-tight text-indigo-600 dark:text-indigo-400">
                                Guide
                            </span>
                        </div>

                        <p className="mt-0 mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
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

                    {/* Theme */}
                    {mounted && (
                        <button
                            type="button"
                            onClick={() =>
                                setTheme(
                                    theme === "dark"
                                        ? "light"
                                        : "dark"
                                )
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

                    {/* Loading */}
                    {loading ? (
                        <div className="h-10 w-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                    ) : user ? (

                        /* =========================
                           LOGGED IN
                        ========================= */
                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(!profileOpen)
                                }
                                className="flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            >

                                {/* Avatar */}
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                    {user.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">
                                    {user.name}
                                </span>

                                <ChevronDown
                                    size={15}
                                    className={`transition-transform ${
                                        profileOpen
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />

                            </button>

                            {/* Dropdown */}
                            {profileOpen && (
                                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">

                                    {/* User info */}
                                    <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">

                                        <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                                            {user.name}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-zinc-400">
                                            {user.email}
                                        </p>

                                    </div>

                                    {/* Menu */}
                                    <div className="p-2">

                                        <Link
                                            href="/profile"
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        >
                                            <User size={17} />
                                            Profile
                                        </Link>

                                        <Link
                                            href="/my-learning"
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        >
                                            <BookOpen size={17} />
                                            My Learning
                                        </Link>

                                        <Link
                                            href="/settings"
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        >
                                            <Settings size={17} />
                                            Settings
                                        </Link>

                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                        >
                                            <LogOut size={17} />
                                            Log out
                                        </button>

                                    </div>

                                </div>
                            )}

                        </div>

                    ) : (

                        /* =========================
                           LOGGED OUT
                        ========================= */
                        <>
                            <Link
                                href="/login"
                                className="hidden px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white sm:block"
                            >
                                Log in
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            >
                                Get started
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </header>
    );
}