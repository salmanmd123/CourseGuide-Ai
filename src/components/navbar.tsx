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
    X,
} from "lucide-react";

import { useTheme } from "next-themes";
import { FormEvent, useEffect, useState } from "react";

type UserData = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
};

export default function Navbar() {
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);

    const [user, setUser] = useState<UserData | null>(null);

    const [loading, setLoading] = useState(true);

    const [profileOpen, setProfileOpen] = useState(false);

    /* =========================================================
       SEARCH
    ========================================================= */

    const [searchOpen, setSearchOpen] = useState(false);

    const [search, setSearch] = useState("");

    /* =========================================================
       MOUNT
    ========================================================= */

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
                console.error(
                    "Failed to get current user:",
                    error
                );

                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkUser();
    }, []);

    /* =========================================================
       LOGOUT
    ========================================================= */

    async function handleLogout() {
        try {
            const response = await fetch(
                "/api/auth/logout",
                {
                    method: "POST",
                }
            );

            if (response.ok) {
                setUser(null);

                setProfileOpen(false);

                window.location.href = "/login";
            }
        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );
        }
    }

    /* =========================================================
       SEARCH SUBMIT
    ========================================================= */

    function handleSearchSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const query = search.trim();

        if (!query) {
            return;
        }

        window.location.href =
            `/courses?q=${encodeURIComponent(query)}`;
    }

    /* =========================================================
       OPEN SEARCH
    ========================================================= */

    function openSearch() {
        setSearchOpen(true);

        setTimeout(() => {
            const input = document.getElementById(
                "navbar-search"
            ) as HTMLInputElement | null;

            input?.focus();
        }, 50);
    }

    /* =========================================================
       CLOSE SEARCH
    ========================================================= */

    function closeSearch() {
        setSearchOpen(false);

        setSearch("");
    }

    return (
        <header className="sticky top-0 z-50 bg-[#e0e5ec]/95 backdrop-blur-md dark:bg-zinc-950/95">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                {/* =================================================
                   LOGO
                ================================================= */}

                <Link
                    href="/"
                    className="neo-surface-sm flex shrink-0 items-center gap-3 rounded-[20px] px-5 py-2"
                    onClick={() =>
                        setProfileOpen(false)
                    }
                >

                    <img
                        src="/logo2.png"
                        alt="CourseGuide"
                        className="h-9 w-9 rounded-full object-contain"
                    />

                    <div>

                        <div className="translate-y-1">

                            <span className="text-[16px] font-bold leading-none tracking-tight text-black dark:text-white">
                                Course
                            </span>

                            <span className="text-[16px] font-bold leading-none tracking-tight text-[#ff4500] dark:text-white">
                                Guide
                            </span>

                        </div>

                        <p className="mb-1 mt-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff4500]">
                            AI Learning
                        </p>

                    </div>

                </Link>

                {/* =================================================
                   NAVIGATION
                ================================================= */}

                <nav className="neo-pill-inset hidden items-center gap-2 p-[6px] md:flex">

                    <Link
                        href="/courses"
                        className="
                            rounded-full
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-[#222]
                            transition-all
                            duration-200
                            ease-out

                            hover:bg-[#e0e5ec]
                            hover:text-[#ff4500]
                            hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)]

                            active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                        "
                    >
                        Courses
                    </Link>

                    <Link
                        href="/how-it-works"
                        className="
                            rounded-full
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-[#222]
                            transition-all
                            duration-200
                            ease-out

                            hover:bg-[#e0e5ec]
                            hover:text-[#ff4500]
                            hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)]

                            active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                        "
                    >
                        How it works
                    </Link>

                    <Link
                        href="/features"
                        className="
                            rounded-full
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-[#222]
                            transition-all
                            duration-200
                            ease-out

                            hover:bg-[#e0e5ec]
                            hover:text-[#ff4500]
                            hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)]

                            active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                        "
                    >
                        Features
                    </Link>

                </nav>

                {/* =================================================
                   ACTIONS
                ================================================= */}

                <div className="flex items-center gap-2 sm:gap-3">

                    {/* =================================================
                       NAVBAR SEARCH
                    ================================================= */}

                    {searchOpen ? (

                        <form
                            onSubmit={handleSearchSubmit}
                            className="neo-inset flex h-10 w-[240px] items-center rounded-full px-2 sm:w-[280px]"
                        >

                            <Search
                                size={17}
                                className="ml-2 shrink-0 text-zinc-500"
                            />

                            <input
                                id="navbar-search"
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search courses..."
                                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-white"
                            />

                            <button
                                type="button"
                                onClick={closeSearch}
                                aria-label="Close search"
                                className="neo-button flex h-7 w-7 items-center justify-center rounded-full text-[#3f3e3e]"
                            >
                                <X size={16} />
                            </button>

                        </form>

                    ) : (

                        <button
                            type="button"
                            aria-label="Search courses"
                            onClick={openSearch}
                            className="neo-button flex h-10 w-10 items-center justify-center rounded-full text-[#3f3e3e]"
                        >
                            <Search
                                size={19}
                                strokeWidth={1.8}
                            />
                        </button>

                    )}

                    {/* =================================================
                       THEME
                    ========================================================= */}

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
                            className="neo-button flex h-10 w-10 items-center justify-center rounded-full text-[#3f3e3e]"
                        >

                            {theme === "dark" ? (

                                <Sun
                                    size={19}
                                    strokeWidth={1.8}
                                />

                            ) : (

                                <Moon
                                    size={19}
                                    strokeWidth={1.8}
                                />

                            )}

                        </button>

                    )}

                    {/* =================================================
                       LOADING
                    ========================================================= */}

                    {loading ? (

                        <div className="neo-surface-sm h-10 w-24 animate-pulse rounded-full" />

                    ) : user ? (

                        /* =================================================
                           LOGGED IN
                        ================================================= */

                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(
                                        !profileOpen
                                    )
                                }
                                className="
                                    neo-surface-sm
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    px-2
                                    py-1.5
                                    text-[#111111]
                                    transition-all
                                    duration-200
                                    hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                                "
                            >

                                {/* Avatar */}

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4500] text-xs font-bold text-white shadow-[3px_3px_7px_rgba(163,177,198,0.5)]">

                                    {user.name
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                                {/* Name */}

                                <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">
                                    {user.name}
                                </span>

                                {/* Arrow */}

                                <ChevronDown
                                    size={15}
                                    className={`transition-transform ${
                                        profileOpen
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />

                            </button>

                            {/* =================================================
                               PROFILE DROPDOWN
                            ================================================= */}

                            {profileOpen && (

                                <div className="neo-surface absolute right-0 top-14 w-64 overflow-hidden rounded-[22px] border-0">

                                    {/* User info */}

                                    <div className="px-4 py-4">

                                        <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                                            {user.name}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-zinc-500">
                                            {user.email}
                                        </p>

                                    </div>

                                    {/* Menu */}

                                    <div className="space-y-2 px-2 pb-2">

                                        <Link
                                            href="/profile"
                                            onClick={() =>
                                                setProfileOpen(
                                                    false
                                                )
                                            }
                                            className="neo-button flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3f3e3e]"
                                        >

                                            <User size={17} />

                                            Profile

                                        </Link>

                                        <Link
                                            href="/my-learning"
                                            onClick={() =>
                                                setProfileOpen(
                                                    false
                                                )
                                            }
                                            className="neo-button flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3f3e3e]"
                                        >

                                            <BookOpen size={17} />

                                            My Learning

                                        </Link>

                                        <Link
                                            href="/settings"
                                            onClick={() =>
                                                setProfileOpen(
                                                    false
                                                )
                                            }
                                            className="neo-button flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3f3e3e]"
                                        >

                                            <Settings size={17} />

                                            Settings

                                        </Link>

                                    </div>

                                    {/* Logout */}

                                    <div className="px-2 pb-2 pt-1">

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="neo-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600"
                                        >

                                            <LogOut size={17} />

                                            Log out

                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                    ) : (

                        /* =================================================
                           LOGGED OUT
                        ================================================= */

                        <>

                            <Link
                                href="/login"
                                className="hidden px-3 py-2 text-sm font-semibold text-[#3f3e3e] transition hover:text-[#ff4500] sm:block"
                            >
                                Log in
                            </Link>

                            <Link
                                href="/register"
                                className="neo-accent-button rounded-full px-5 py-2.5 text-sm font-bold"
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