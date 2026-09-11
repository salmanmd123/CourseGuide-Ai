import Link from "next/link";
import { redirect } from "next/navigation";

import {
    desc,
    eq,
    count,
} from "drizzle-orm";

import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Film,
    GraduationCap,
    ListVideo,
    ShieldCheck,
    Users,
} from "lucide-react";

import { db } from "@/db";

import {
    courses,
    lessons,
    progress,
    users,
} from "@/db/schema";

import { requireAdmin } from "@/lib/auth";
import AdminNavbar from "@/components/admin-navbar";

export default async function AdminDashboardPage() {
    /* =========================================================
       ADMIN AUTHENTICATION
    ========================================================= */

    const admin =
        await requireAdmin();

    if (!admin) {
        redirect("/dashboard");
    }

    /* =========================================================
       BASIC STATISTICS
    ========================================================= */

    const [userCountResult] =
        await db
            .select({
                count: count(),
            })
            .from(users);

    const [courseCountResult] =
        await db
            .select({
                count: count(),
            })
            .from(courses);

    const [lessonCountResult] =
        await db
            .select({
                count: count(),
            })
            .from(lessons);

    const [
        videoCourseCountResult,
    ] = await db
        .select({
            count: count(),
        })
        .from(courses)
        .where(
            eq(
                courses.courseType,
                "VIDEO"
            )
        );

    const [
        playlistCourseCountResult,
    ] = await db
        .select({
            count: count(),
        })
        .from(courses)
        .where(
            eq(
                courses.courseType,
                "PLAYLIST"
            )
        );

    const [
        completedLessonCountResult,
    ] = await db
        .select({
            count: count(),
        })
        .from(progress)
        .where(
            eq(
                progress.completed,
                true
            )
        );

    const totalUsers =
        Number(
            userCountResult?.count ?? 0
        );

    const totalCourses =
        Number(
            courseCountResult?.count ?? 0
        );

    const totalLessons =
        Number(
            lessonCountResult?.count ?? 0
        );

    const videoCourses =
        Number(
            videoCourseCountResult?.count ??
                0
        );

    const playlistCourses =
        Number(
            playlistCourseCountResult?.count ??
                0
        );

    const completedLessons =
        Number(
            completedLessonCountResult?.count ??
                0
        );

    /* =========================================================
       RECENT USERS
    ========================================================= */

    const recentUsers =
        await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt:
                    users.createdAt,
            })
            .from(users)
            .orderBy(
                desc(users.createdAt)
            )
            .limit(5);

    /* =========================================================
       RECENT COURSES
    ========================================================= */

    const recentCourses =
        await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                courseType:
                    courses.courseType,
                language:
                    courses.language,
                createdAt:
                    courses.createdAt,
            })
            .from(courses)
            .orderBy(
                desc(courses.createdAt)
            )
            .limit(5);

    /* =========================================================
       DASHBOARD
    ========================================================= */

    return (
        <main className="min-h-screen bg-[#e0e5ec] text-black transition-colors">

            <AdminNavbar
                name={admin.name}
                email={admin.email}
            />

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">

                {/* =================================================
                   HEADER
                ================================================= */}

                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                    <div>

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">

                            <ShieldCheck
                                size={14}
                            />

                            Administrator

                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Admin Dashboard
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3f3e3e] sm:text-base">
                            Manage CourseGuide
                            AI and monitor
                            platform activity
                            from one place.
                        </p>

                    </div>

                    {/* ADMIN PROFILE */}

                    <div className="flex items-center gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">

                            <ShieldCheck
                                size={21}
                            />

                        </div>

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold">
                                {admin.name}
                            </p>

                            <p className="truncate text-xs text-[#3f3e3e]">
                                {admin.email}
                            </p>

                        </div>

                    </div>

                </div>

                {/* =================================================
                   STATISTICS
                ================================================= */}

                <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    <StatCard
                        title="Total Users"
                        value={
                            totalUsers
                        }
                        icon={
                            <Users className="h-5 w-5" />
                        }
                        description="Registered users"
                    />

                    <StatCard
                        title="Total Courses"
                        value={
                            totalCourses
                        }
                        icon={
                            <BookOpen className="h-5 w-5" />
                        }
                        description="Available courses"
                    />

                    <StatCard
                        title="Total Lessons"
                        value={
                            totalLessons
                        }
                        icon={
                            <GraduationCap className="h-5 w-5" />
                        }
                        description="Lessons in all courses"
                    />

                    <StatCard
                        title="Video Courses"
                        value={
                            videoCourses
                        }
                        icon={
                            <Film className="h-5 w-5" />
                        }
                        description="Single-video courses"
                    />

                    <StatCard
                        title="Playlist Courses"
                        value={
                            playlistCourses
                        }
                        icon={
                            <ListVideo className="h-5 w-5" />
                        }
                        description="YouTube playlist courses"
                    />

                    <StatCard
                        title="Completed Lessons"
                        value={
                            completedLessons
                        }
                        icon={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                        description="Total completed lessons"
                    />

                </section>

                {/* =================================================
                   QUICK ACTIONS
                ================================================= */}

                <section className="mt-10">

                    <div className="mb-5">

                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[orangered]">
                            Management
                        </p>

                        <h2 className="mt-1 text-xl font-bold">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-[#3f3e3e]">
                            Manage important
                            parts of the
                            platform.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <AdminActionCard
                            href="/admin/courses"
                            icon={
                                <BookOpen className="h-5 w-5" />
                            }
                            title="Manage Courses"
                            description="View, feature, recommend and manage CourseGuide AI courses."
                        />

                        <AdminActionCard
                            href="/admin/users"
                            icon={
                                <Users className="h-5 w-5" />
                            }
                            title="Manage Users"
                            description="View registered users and manage platform accounts."
                        />

                    </div>

                </section>

                {/* =================================================
                   RECENT ACTIVITY
                ================================================= */}

                <section className="mt-10">

                    <div className="mb-5">

                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[orangered]">
                            Activity
                        </p>

                        <h2 className="mt-1 text-xl font-bold">
                            Recent Activity
                        </h2>

                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* =================================================
                           RECENT USERS
                        ================================================= */}

                        <div className="overflow-hidden rounded-[20px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

                            <div className="flex items-center justify-between px-5 py-4 shadow-[inset_0_-3px_6px_rgba(163,177,198,0.25)]">

                                <div>

                                    <h2 className="font-semibold">
                                        Recent Users
                                    </h2>

                                    <p className="mt-1 text-xs text-[#3f3e3e]">
                                        Latest registered
                                        users
                                    </p>

                                </div>

                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-1 rounded-[12px] px-3 py-2 text-sm font-semibold text-[orangered] transition-all duration-200 hover:bg-[#e0e5ec] hover:text-[red] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                >
                                    View all

                                    <ArrowRight
                                        className="h-4 w-4"
                                    />

                                </Link>

                            </div>

                            <div>

                                {recentUsers.length ===
                                0 ? (

                                    <div className="px-5 py-10 text-center text-sm text-[#3f3e3e]">
                                        No users
                                        found.
                                    </div>

                                ) : (

                                    recentUsers.map(
                                        (
                                            user
                                        ) => (

                                            <div
                                                key={
                                                    user.id
                                                }
                                                className="flex items-center justify-between gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#e0e5ec] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]"
                                            >

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-sm font-bold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">

                                                        {user.name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold">
                                                            {
                                                                user.name
                                                            }
                                                        </p>

                                                        <p className="truncate text-xs text-[#3f3e3e]">
                                                            {
                                                                user.email
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-[inset_3px_3px_6px_rgba(163,177,198,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] ${
                                                        user.role ===
                                                        "ADMIN"
                                                            ? "text-[orangered]"
                                                            : "text-[#3f3e3e]"
                                                    }`}
                                                >
                                                    {
                                                        user.role
                                                    }
                                                </span>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </div>

                        {/* =================================================
                           RECENT COURSES
                        ================================================= */}

                        <div className="overflow-hidden rounded-[20px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

                            <div className="flex items-center justify-between px-5 py-4 shadow-[inset_0_-3px_6px_rgba(163,177,198,0.25)]">

                                <div>

                                    <h2 className="font-semibold">
                                        Recent Courses
                                    </h2>

                                    <p className="mt-1 text-xs text-[#3f3e3e]">
                                        Recently added
                                        courses
                                    </p>

                                </div>

                                <Link
                                    href="/admin/courses"
                                    className="flex items-center gap-1 rounded-[12px] px-3 py-2 text-sm font-semibold text-[orangered] transition-all duration-200 hover:bg-[#e0e5ec] hover:text-[red] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                >
                                    View all

                                    <ArrowRight
                                        className="h-4 w-4"
                                    />

                                </Link>

                            </div>

                            <div>

                                {recentCourses.length ===
                                0 ? (

                                    <div className="px-5 py-10 text-center text-sm text-[#3f3e3e]">
                                        No courses
                                        found.
                                    </div>

                                ) : (

                                    recentCourses.map(
                                        (
                                            course
                                        ) => (

                                            <div
                                                key={
                                                    course.id
                                                }
                                                className="flex items-center justify-between gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#e0e5ec] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]"
                                            >

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-semibold">
                                                        {
                                                            course.title
                                                        }
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#3f3e3e]">

                                                        <span>
                                                            {course.courseType ===
                                                            "PLAYLIST"
                                                                ? "Playlist"
                                                                : "Video"}
                                                        </span>

                                                        <span>
                                                            •
                                                        </span>

                                                        <span>
                                                            {
                                                                course.language
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                                <Link
                                                    href={`/courses/${course.slug}`}
                                                    target="_blank"
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[red] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                                    aria-label={`View ${course.title}`}
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </div>

                    </div>

                </section>

                {/* =================================================
                   ADMIN STATUS
                ================================================= */}

                <div className="mt-10 flex items-start gap-3 rounded-[20px] bg-[#e0e5ec] px-5 py-4 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">

                        <ShieldCheck
                            size={18}
                        />

                    </div>

                    <div>

                        <p className="text-sm font-semibold text-[orangered]">
                            Admin access
                            enabled
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#3f3e3e]">
                            You are signed in
                            as an administrator.
                            Administrative
                            operations are
                            protected on the
                            server.
                        </p>

                    </div>

                </div>

            </div>

        </main>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    icon,
    description,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
}) {
    return (
        <div className="rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300">

            <div className="flex items-start justify-between gap-4">

                <div>

                    <p className="text-sm font-medium text-[#3f3e3e]">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                        {value.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-[#3f3e3e]">
                        {description}
                    </p>

                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">

                    {icon}

                </div>

            </div>

        </div>
    );
}

/* =========================================================
   ADMIN ACTION CARD
========================================================= */

function AdminActionCard({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]"
        >

            <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 group-hover:bg-[red]">

                    {icon}

                </div>

                <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-3">

                        <h3 className="font-semibold">
                            {title}
                        </h3>

                        <ArrowRight className="h-4 w-4 text-[orangered] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[red]" />

                    </div>

                    <p className="mt-1 text-sm leading-6 text-[#3f3e3e]">
                        {description}
                    </p>

                </div>

            </div>

        </Link>
    );
}