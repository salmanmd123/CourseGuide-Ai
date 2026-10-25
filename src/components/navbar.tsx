"use client";

import Link from "next/link";

import {
    Moon,
    Search,
    Sun,
    User,
    BookOpen,
    LogOut,
    ChevronDown,
    X,
    Menu,
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const contentType = response.headers.get("content-type");

                if (!contentType?.includes("application/json")) {
                    throw new Error("Current-user API did not return JSON.");
                }

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
        <header className="sticky top-0 z-50 bg-[#e0e5ec]/95 backdrop-blur-md transition-colors duration-300 dark:bg-[#1a1d23]/95">

            <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">

                {/* =================================================
                   LOGO
                ================================================= */}

                <Link
                    href="/"
                    className="neo-surface-sm flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-[18px] p-2.5 sm:justify-start sm:gap-3 sm:rounded-[20px] sm:px-5 sm:py-2"
                    onClick={() =>
                        setProfileOpen(false)
                    }
                >

                    <img
                        src="/logo2.png"
                        alt="CourseGuide"
                        className="h-9 w-9 rounded-full object-contain sm:h-9 sm:w-9"
                    />

                    <div className="hidden leading-tight sm:block">

                        <div className="translate-y-0 sm:translate-y-1">

                            <span className="text-[14px] font-bold leading-none tracking-tight text-black sm:text-[16px] dark:text-[#f5f7fa]">
                                Course
                            </span>

                            <span className="text-[14px] font-bold leading-none tracking-tight text-[#ff4500] sm:text-[16px]">
                                Guide
                            </span>

                        </div>

                        <p className="mb-0 mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-[#ff4500] sm:mb-1 sm:text-[10px] sm:tracking-[0.18em]">
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

                            dark:text-[#f5f7fa]

                            hover:bg-[#e0e5ec]
                            hover:text-[#ff4500]

                            dark:hover:bg-[#1e2229]
                            dark:hover:text-[#ff4500]

                            hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)]

                            dark:hover:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]

                            active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                            dark:active:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                        "
                    >
                        Courses
                    </Link>

                    <Link
                        href="/quizzes"
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

                            dark:text-[#f5f7fa]

                            hover:bg-[#e0e5ec]
                            hover:text-[#ff4500]

                            dark:hover:bg-[#1e2229]
                            dark:hover:text-[#ff4500]

                            hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)]

                            dark:hover:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]

                            active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                            dark:active:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                        "
                    >
                        Quizzes
                    </Link>

                    <Link
                        href="/interviews"
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

                            dark:text-[#f5f7fa]

                            hover:bg-[#e0e5ec]
                            hover:text-[#ff4500]

                            dark:hover:bg-[#1e2229]
                            dark:hover:text-[#ff4500]

                            hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)]

                            dark:hover:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]

                            active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                            dark:active:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                        "
                    >
                        Interviews
                    </Link>

                </nav>

                {/* =================================================
                   ACTIONS
                ================================================= */}

                <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3 md:ml-0">

                    {/* =================================================
                       SEARCH
                    ================================================= */}

                    {searchOpen ? (

                        <form
                            onSubmit={handleSearchSubmit}
                            className="neo-inset absolute left-3 right-3 top-[calc(100%+8px)] z-20 flex h-11 items-center rounded-full px-2 sm:static sm:w-[280px]"
                        >

                            <Search
                                size={17}
                                className="ml-2 shrink-0 text-zinc-500 dark:text-[#a8adb7]"
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
                                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-[#f5f7fa] dark:placeholder:text-[#a8adb7]"
                            />

                            <button
                                type="button"
                                onClick={closeSearch}
                                aria-label="Close search"
                                className="neo-button flex h-7 w-7 items-center justify-center rounded-full text-[#3f3e3e] dark:text-[#f5f7fa]"
                            >
                                <X size={16} />
                            </button>

                        </form>

                    ) : (

                        <button
                            type="button"
                            aria-label="Search courses"
                            onClick={openSearch}
                            className="neo-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#3f3e3e] sm:h-10 sm:w-10 dark:text-[#f5f7fa]"
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
                            className="neo-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#3f3e3e] sm:h-10 sm:w-10 dark:text-[#f5f7fa]"
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
                                    dark:text-[#f5f7fa]
                                    transition-all
                                    duration-200

                                    hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

                                    dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]
                                "
                            >

                                {/* Avatar */}

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4500] text-xs font-bold text-white shadow-[3px_3px_7px_rgba(163,177,198,0.5)] dark:shadow-[3px_3px_7px_rgba(5,7,10,0.6)]">

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
                                    className={`transition-transform ${profileOpen
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

                                        <p className="text-sm font-semibold text-zinc-950 dark:text-[#f5f7fa]">
                                            {user.name}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-[#a8adb7]">
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
                                            className="neo-button flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3f3e3e] dark:text-[#f5f7fa]"
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
                                            className="neo-button flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3f3e3e] dark:text-[#f5f7fa]"
                                        >

                                            <BookOpen size={17} />

                                            My Learning

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
                                className="hidden px-3 py-2 text-sm font-semibold text-[#3f3e3e] transition hover:text-[#ff4500] dark:text-[#f5f7fa] sm:block"
                            >
                                Log in
                            </Link>

                            <Link
                                href="/register"
                                className="neo-accent-button whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-bold sm:px-5 sm:py-2.5 sm:text-sm"
                            >
                                Get started
                            </Link>

                        </>

                    )}

                </div>

                {/* MOBILE HAMBURGER */}
                <button
                    type="button"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen((open) => !open)}
                    className="neo-button ml-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#3f3e3e] md:ml-0 md:hidden dark:text-[#f5f7fa] sm:h-10 sm:w-10"
                >
                    {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>

            </div>

            {/* MOBILE DROPDOWN: links stacked vertically */}
            {mobileMenuOpen && (
                <nav className="mx-3 mb-3 grid gap-2 rounded-[22px] p-3 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] md:hidden dark:shadow-[inset_4px_4px_8px_rgba(5,7,10,0.65),inset_-4px_-4px_8px_rgba(43,48,58,0.55)]" aria-label="Mobile navigation">
                    {[
                        { href: "/courses", label: "Courses" },
                        { href: "/quizzes", label: "Quizzes" },
                        { href: "/interviews", label: "Interviews" },
                        ...(user ? [{ href: "/my-learning", label: "My Learning" }, { href: "/profile", label: "Profile" }] : [{ href: "/login", label: "Log in" }]),
                    ].map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="neo-button flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-semibold text-[#222] dark:text-[#f5f7fa]">
                            {item.label}
                        </Link>
                    ))}
                    {user && (
                        <button type="button" onClick={handleLogout} className="neo-button flex min-h-11 items-center rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600">
                            <LogOut size={16} className="mr-2" /> Log out
                        </button>
                    )}
                </nav>
            )}

        </header>
    );
} 