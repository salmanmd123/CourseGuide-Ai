"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

    const [mounted, setMounted] = useState(false);

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const [profileOpen, setProfileOpen] =
        useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        <header className="sticky top-0 z-50 bg-[#e0e5ec]/95 backdrop-blur-md">
            <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* =================================================
                   LOGO + ADMIN BADGE
                ================================================= */}

                <div className="flex items-center gap-3 sm:gap-4">
                    <Link
                        href="/admin"
                        className="neo-surface-sm flex shrink-0 items-center gap-3 rounded-[20px] px-3 py-2 sm:px-4"
                        onClick={closeMobile}
                    >
                        <img
                            src="/logo2.png"
                            alt="CourseGuide"
                            className="h-9 w-9 rounded-full object-contain sm:h-10 sm:w-10"
                        />

                        <div className="hidden sm:block">
                            <div className="translate-y-1">
                                <span className="text-[16px] font-bold leading-none tracking-tight text-black">
                                    Course
                                </span>

                                <span className="text-[16px] font-bold leading-none tracking-tight text-[#ff4500]">
                                    Guide
                                </span>
                            </div>

                            <p className="mb-1 mt-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff4500]">
                                AI Learning
                            </p>
                        </div>
                    </Link>

                    {/* ADMIN DIVIDER */}

                    <div className="hidden h-8 w-px bg-[#cdd3dc] sm:block" />

                    {/* ADMIN BADGE */}

                    <div className="neo-surface-sm hidden items-center gap-2 rounded-full px-4 py-2 text-[#ff4500] sm:flex">
                        <ShieldCheck size={16} />

                        <span className="text-xs font-bold uppercase tracking-wide">
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* =================================================
                   DESKTOP NAVIGATION
                ================================================= */}

                <nav className="neo-pill-inset hidden items-center gap-1 p-[6px] md:flex">
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
                                theme === "dark"
                                    ? "light"
                                    : "dark"
                            )
                        }
                        aria-label="Toggle dark mode"
                        className="neo-button flex h-10 w-10 items-center justify-center rounded-full text-[#3f3e3e]"
                    >
                        {mounted ? (
                            theme === "dark" ? (
                                <Sun
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            ) : (
                                <Moon
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            )
                        ) : (
                            <span
                                className="h-[19px] w-[19px]"
                                aria-hidden="true"
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
                            className="neo-surface-sm flex items-center gap-2 rounded-full px-2 py-1.5 text-[#111111] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff4500] text-white shadow-[3px_3px_7px_rgba(163,177,198,0.5)]">
                                <ShieldCheck size={15} />
                            </div>

                            <span className="max-w-[120px] truncate text-sm font-semibold">
                                {name}
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

                        {profileOpen && (
                            <div className="neo-surface absolute right-0 top-14 w-64 overflow-hidden rounded-[22px]">
                                <div className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[#ff4500] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                                            <ShieldCheck size={19} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-black">
                                                {name}
                                            </p>

                                            <p className="truncate text-xs text-[#3f3e3e]">
                                                {email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="neo-inset mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#ff4500]">
                                        <ShieldCheck size={11} />
                                        Administrator
                                    </div>
                                </div>

                                <div className="px-2 pb-2">
                                    <Link
                                        href="/admin"
                                        onClick={() =>
                                            setProfileOpen(
                                                false
                                            )
                                        }
                                        className="neo-button flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#3f3e3e]"
                                    >
                                        <LayoutDashboard
                                            size={17}
                                        />
                                        Admin Dashboard
                                    </Link>
                                </div>

                                <div className="px-2 pb-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={
                                            handleLogout
                                        }
                                        className="neo-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600"
                                    >
                                        <LogOut size={17} />
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
                        className="neo-button flex h-10 w-10 items-center justify-center rounded-full text-[#3f3e3e] md:hidden"
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
                <div className="bg-[#e0e5ec] px-4 py-4 shadow-[inset_0_4px_8px_rgba(163,177,198,0.35)] md:hidden sm:px-6">
                    <div className="neo-surface mb-4 flex items-center gap-3 rounded-[20px] p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff4500] text-white shadow-[3px_3px_7px_rgba(163,177,198,0.5)]">
                            <ShieldCheck size={17} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-black">
                                {name}
                            </p>

                            <p className="truncate text-xs text-[#3f3e3e]">
                                Administrator
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <MobileNavLink
                            href="/admin"
                            icon={
                                <LayoutDashboard
                                    size={18}
                                />
                            }
                            label="Dashboard"
                            onClick={closeMobile}
                        />

                        <MobileNavLink
                            href="/admin/courses"
                            icon={
                                <BookOpen
                                    size={18}
                                />
                            }
                            label="Manage Courses"
                            onClick={closeMobile}
                        />

                        <MobileNavLink
                            href="/admin/users"
                            icon={
                                <Users
                                    size={18}
                                />
                            }
                            label="Manage Users"
                            onClick={closeMobile}
                        />

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="neo-button mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600"
                        >
                            <LogOut size={18} />
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
            className="rounded-full px-5 py-3 text-sm font-semibold text-[#222] transition-all duration-200 ease-out hover:bg-[#e0e5ec] hover:text-[#ff4500] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.9)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
        >
            <span className="flex items-center gap-2">
                {icon}
                {label}
            </span>
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
            className="neo-button flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#3f3e3e]"
        >
            {icon}
            {label}
        </Link>
    );
}