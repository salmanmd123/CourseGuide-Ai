"use client";

import Link from "next/link";
import { useState } from "react";

import {
    BookOpen,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    ShieldCheck,
    Sun,
    Users,
    X,
} from "lucide-react";

import { useTheme } from "next-themes";

type AdminNavbarProps = {
    name: string;
    email: string;
};

export default function AdminNavbar({
    name,
    email,
}: AdminNavbarProps) {
    const { theme, setTheme } = useTheme();

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const [profileOpen, setProfileOpen] =
        useState(false);

    async function handleLogout() {
        try {
            const response =
                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST",
                    }
                );

            if (response.ok) {
                window.location.href =
                    "/login";
            }
        } catch (error) {
            console.error(
                "Admin logout failed:",
                error
            );
        }
    }

    function closeMobile() {
        setMobileOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/95 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/95">
            <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-6">
                {/* =================================================
                   LOGO + ADMIN BADGE
                ================================================= */}

                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="flex shrink-0 items-center gap-3"
                        onClick={
                            closeMobile
                        }
                    >
                        <img
                            src="/logo1.png"
                            alt="CourseGuide"
                            className="h-10 w-10 rounded-xl object-contain"
                        />

                        <div className="hidden sm:block">
                            <div className="translate-y-1">
                                <span className="text-[16px] font-bold leading-none tracking-tight text-zinc-900 dark:text-white">
                                    Course
                                </span>

                                <span className="text-[16px] font-bold leading-none tracking-tight text-indigo-600 dark:text-indigo-400">
                                    Guide
                                </span>
                            </div>

                            <p className="mb-1 mt-0 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                                AI Learning
                            </p>
                        </div>
                    </Link>

                    {/* ADMIN DIVIDER */}

                    <div className="hidden h-8 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

                    {/* ADMIN BADGE */}

                    <div className="hidden items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 sm:flex">
                        <ShieldCheck
                            size={16}
                        />

                        <span className="text-xs font-bold uppercase tracking-wide">
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* =================================================
                   DESKTOP NAVIGATION
                ================================================= */}

                <nav className="hidden items-center gap-2 md:flex">
                    <AdminNavLink
                        href="/admin"
                        icon={
                            <LayoutDashboard
                                size={16}
                            />
                        }
                        label="Dashboard"
                    />

                    <AdminNavLink
                        href="/admin/courses"
                        icon={
                            <BookOpen
                                size={16}
                            />
                        }
                        label="Courses"
                    />

                    <AdminNavLink
                        href="/admin/users"
                        icon={
                            <Users
                                size={16}
                            />
                        }
                        label="Users"
                    />
                </nav>

                {/* =================================================
                   RIGHT ACTIONS
                ================================================= */}

                <div className="flex items-center gap-2">
                    {/* THEME */}

                    <button
                        type="button"
                        onClick={() =>
                            setTheme(
                                theme ===
                                    "dark"
                                    ? "light"
                                    : "dark"
                            )
                        }
                        aria-label="Toggle dark mode"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        {theme ===
                            "dark" ? (
                            <Sun
                                size={19}
                                strokeWidth={
                                    1.8
                                }
                            />
                        ) : (
                            <Moon
                                size={19}
                                strokeWidth={
                                    1.8
                                }
                            />
                        )}
                    </button>

                    {/* ADMIN PROFILE */}

                    <div className="relative hidden sm:block">
                        <button
                            type="button"
                            onClick={() =>
                                setProfileOpen(
                                    !profileOpen
                                )
                            }
                            className="flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
                                <ShieldCheck
                                    size={15}
                                />
                            </div>

                            <span className="max-w-[120px] truncate text-sm font-semibold">
                                {name}
                            </span>

                            <ChevronDown
                                size={15}
                                className={`transition-transform ${profileOpen
                                        ? "rotate-180"
                                        : ""
                                    }`}
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                            <ShieldCheck
                                                size={
                                                    19
                                                }
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                                                {name}
                                            </p>

                                            <p className="truncate text-xs text-zinc-400">
                                                {email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        <ShieldCheck
                                            size={
                                                11
                                            }
                                        />
                                        Administrator
                                    </div>
                                </div>

                                <div className="p-2">
                                    <Link
                                        href="/admin"
                                        onClick={() =>
                                            setProfileOpen(
                                                false
                                            )
                                        }
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <LayoutDashboard
                                            size={
                                                17
                                            }
                                        />
                                        Admin Dashboard
                                    </Link>

                                </div>

                                <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={
                                            handleLogout
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                        <LogOut
                                            size={
                                                17
                                            }
                                        />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MOBILE MENU */}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(
                                !mobileOpen
                            )
                        }
                        aria-label="Toggle admin menu"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden"
                    >
                        {mobileOpen ? (
                            <X size={20} />
                        ) : (
                            <Menu size={20} />
                        )}
                    </button>
                </div>
            </div>

            {/* =================================================
               MOBILE NAVIGATION
            ================================================= */}

            {mobileOpen && (
                <div className="border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-500/10">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <ShieldCheck
                                size={17}
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold">
                                {name}
                            </p>

                            <p className="truncate text-xs text-zinc-400">
                                Administrator
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <MobileNavLink
                            href="/admin"
                            icon={
                                <LayoutDashboard
                                    size={18}
                                />
                            }
                            label="Dashboard"
                            onClick={
                                closeMobile
                            }
                        />

                        <MobileNavLink
                            href="/admin/courses"
                            icon={
                                <BookOpen
                                    size={18}
                                />
                            }
                            label="Manage Courses"
                            onClick={
                                closeMobile
                            }
                        />

                        <MobileNavLink
                            href="/admin/users"
                            icon={
                                <Users
                                    size={18}
                                />
                            }
                            label="Manage Users"
                            onClick={
                                closeMobile
                            }
                        />

                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                            <LogOut
                                size={18}
                            />
                            Log out
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}

/* =========================================================
   DESKTOP NAV LINK
========================================================= */

function AdminNavLink({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
            {icon}
            {label}
        </Link>
    );
}

/* =========================================================
   MOBILE NAV LINK
========================================================= */

function MobileNavLink({
    href,
    icon,
    label,
    onClick,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
            {icon}
            {label}
        </Link>
    );
}