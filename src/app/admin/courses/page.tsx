"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Eye,
    ExternalLink,
    Filter,
    Heart,
    ListVideo,
    Loader2,
    Search,
    Star,
    Trash2,
    Video,
    X,
} from "lucide-react";

import AdminNavbar from "@/components/admin-navbar";

type Course = {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    level: string;

    courseType: "VIDEO" | "PLAYLIST" | string;

    language: string | null;

    youtubeUrl?: string | null;
    youtubeId?: string | null;
    youtubePlaylistId?: string | null;

    channelName?: string | null;
    thumbnailUrl?: string | null;

    views?: number | null;
    likes?: number | null;

    duration: string;
    lessonsCount: number;

    rating?: string | null;
    students?: string | null;

    source?: string | null;

    recommendationScore?: number | null;

    adminRecommended?: boolean | null;
    featured?: boolean | null;

    createdAt: string;
    updatedAt: string;
};

type TypeFilter = "ALL" | "VIDEO" | "PLAYLIST";

type StatusFilter =
    | "ALL"
    | "FEATURED"
    | "RECOMMENDED";

export default function AdminCoursesPage() {
    const [courses, setCourses] =
        useState<Course[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState<TypeFilter>("ALL");

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("ALL");

    const [updatingId, setUpdatingId] =
        useState<number | null>(null);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    /* =========================================================
       LOAD COURSES
    ========================================================= */

    async function loadCourses() {
        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    "/api/admin/courses",
                    {
                        cache: "no-store",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to load courses"
                );
            }

            setCourses(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load admin courses:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load courses"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCourses();
    }, []);

    /* =========================================================
       FILTER
    ========================================================= */

    const filteredCourses =
        useMemo(() => {
            const query =
                search
                    .toLowerCase()
                    .trim();

            return courses.filter(
                (course) => {
                    const matchesSearch =
                        !query ||
                        course.title
                            .toLowerCase()
                            .includes(query) ||
                        (
                            course.category ||
                            ""
                        )
                            .toLowerCase()
                            .includes(query) ||
                        (
                            course.channelName ||
                            ""
                        )
                            .toLowerCase()
                            .includes(query) ||
                        (
                            course.language ||
                            ""
                        )
                            .toLowerCase()
                            .includes(query);

                    const matchesType =
                        typeFilter === "ALL" ||
                        course.courseType ===
                        typeFilter;

                    const matchesStatus =
                        statusFilter ===
                        "ALL" ||
                        (
                            statusFilter ===
                            "FEATURED" &&
                            Boolean(
                                course.featured
                            )
                        ) ||
                        (
                            statusFilter ===
                            "RECOMMENDED" &&
                            Boolean(
                                course.adminRecommended
                            )
                        );

                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesStatus
                    );
                }
            );
        }, [
            courses,
            search,
            typeFilter,
            statusFilter,
        ]);

    /* =========================================================
       UPDATE COURSE
    ========================================================= */

    async function updateCourse(
        id: number,
        field:
            | "featured"
            | "adminRecommended",
        value: boolean
    ) {
        try {
            setUpdatingId(id);

            const response =
                await fetch(
                    "/api/admin/courses",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            id,
                            [field]: value,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to update course"
                );
            }

            setCourses(
                (current) =>
                    current.map(
                        (course) =>
                            course.id === id
                                ? {
                                    ...course,
                                    [field]:
                                        value,
                                }
                                : course
                    )
            );
        } catch (error) {
            console.error(
                "Failed to update course:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update course"
            );
        } finally {
            setUpdatingId(null);
        }
    }

    /* =========================================================
       DELETE COURSE
    ========================================================= */

    async function deleteCourse(
        course: Course
    ) {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${course.title}"?\n\nThis will permanently remove the course and its lessons.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(course.id);

            const response =
                await fetch(
                    `/api/admin/courses?id=${course.id}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to delete course"
                );
            }

            setCourses(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            course.id
                    )
            );
        } catch (error) {
            console.error(
                "Failed to delete course:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete course"
            );
        } finally {
            setDeletingId(null);
        }
    }

    /* =========================================================
       RESET FILTERS
    ========================================================= */

    function resetFilters() {
        setSearch("");
        setTypeFilter("ALL");
        setStatusFilter("ALL");
    }

    /* =========================================================
       STATS
    ========================================================= */

    const totalCourses =
        courses.length;

    const videoCourses =
        courses.filter(
            (course) =>
                course.courseType ===
                "VIDEO"
        ).length;

    const playlistCourses =
        courses.filter(
            (course) =>
                course.courseType ===
                "PLAYLIST"
        ).length;

    const featuredCourses =
        courses.filter(
            (course) =>
                Boolean(course.featured)
        ).length;

    const recommendedCourses =
        courses.filter(
            (course) =>
                Boolean(
                    course.adminRecommended
                )
        ).length;

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
            <AdminNavbar
                name="Admin"
                email=""
            />

            <div className="mx-auto max-w-7xl px-6 py-10">
                {/* =================================================
                    HEADER
                ================================================= */}

                <div>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                        <ArrowLeft
                            size={16}
                        />

                        Back to Admin
                    </Link>

                    <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                ADMINISTRATION
                            </p>

                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                                Course Management
                            </h1>

                            <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
                                Manage your course
                                library, YouTube
                                content, featured
                                courses and
                                recommendations.
                            </p>
                        </div>

                        <Link
                            href="/courses"
                            target="_blank"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            View Courses
                            <ExternalLink
                                size={16}
                            />
                        </Link>
                    </div>
                </div>

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        label="Total Courses"
                        value={totalCourses}
                    />

                    <StatCard
                        label="Video Courses"
                        value={videoCourses}
                    />

                    <StatCard
                        label="Playlists"
                        value={playlistCourses}
                    />

                    <StatCard
                        label="Featured"
                        value={featuredCourses}
                    />

                    <StatCard
                        label="Recommended"
                        value={
                            recommendedCourses
                        }
                    />
                </div>

                {/* =================================================
                    SEARCH + FILTERS
                ================================================= */}

                <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
                    <div className="flex flex-col gap-4">
                        {/* SEARCH */}

                        <div className="flex h-12 items-center rounded-xl border border-zinc-200 bg-white px-4 transition focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950">
                            <Search
                                size={18}
                                className="shrink-0 text-zinc-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search courses, categories or channels..."
                                className="ml-3 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch(
                                            ""
                                        )
                                    }
                                    className="ml-2 text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X
                                        size={
                                            17
                                        }
                                    />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* TYPE */}

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="mr-1 inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    <Filter
                                        size={
                                            15
                                        }
                                    />
                                    Type
                                </span>

                                {(
                                    [
                                        "ALL",
                                        "VIDEO",
                                        "PLAYLIST",
                                    ] as TypeFilter[]
                                ).map(
                                    (
                                        type
                                    ) => {
                                        const active =
                                            typeFilter ===
                                            type;

                                        return (
                                            <button
                                                key={
                                                    type
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setTypeFilter(
                                                        type
                                                    )
                                                }
                                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active
                                                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                                                    }`}
                                            >
                                                {type ===
                                                    "ALL"
                                                    ? "All"
                                                    : type ===
                                                        "VIDEO"
                                                        ? "Videos"
                                                        : "Playlists"}
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {/* STATUS */}

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="mr-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Status
                                </span>

                                {(
                                    [
                                        {
                                            value: "ALL",
                                            label: "All",
                                        },
                                        {
                                            value: "FEATURED",
                                            label: "Featured",
                                        },
                                        {
                                            value: "RECOMMENDED",
                                            label: "Recommended",
                                        },
                                    ] as {
                                        value: StatusFilter;
                                        label: string;
                                    }[]
                                ).map(
                                    (
                                        item
                                    ) => {
                                        const active =
                                            statusFilter ===
                                            item.value;

                                        return (
                                            <button
                                                key={
                                                    item.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setStatusFilter(
                                                        item.value
                                                    )
                                                }
                                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active
                                                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                                                    }`}
                                            >
                                                {
                                                    item.label
                                                }
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* =================================================
                    RESULT COUNT
                ================================================= */}

                <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Showing{" "}
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {
                                filteredCourses.length
                            }
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {courses.length}
                        </span>{" "}
                        courses
                    </p>

                    {(search ||
                        typeFilter !==
                        "ALL" ||
                        statusFilter !==
                        "ALL") && (
                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Clear filters
                                <X
                                    size={14}
                                />
                            </button>
                        )}
                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (
                    <div className="mt-5 flex min-h-[380px] items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                            <Loader2
                                size={19}
                                className="animate-spin"
                            />

                            Loading courses...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* =================================================
                            COURSE GRID
                        ================================================= */}

                        {filteredCourses.length >
                            0 && (
                                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredCourses.map(
                                        (
                                            course
                                        ) => (
                                            <article
                                                key={
                                                    course.id
                                                }
                                                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                                            >
                                                {/* THUMBNAIL */}

                                                <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                    {course.thumbnailUrl ? (
                                                        <img
                                                            src={
                                                                course.thumbnailUrl
                                                            }
                                                            alt=""
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400">
                                                                {course.courseType ===
                                                                    "PLAYLIST" ? (
                                                                    <ListVideo
                                                                        size={
                                                                            25
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Video
                                                                        size={
                                                                            25
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* TYPE */}

                                                    <div className="absolute left-3 top-3">
                                                        <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                                                            {course.courseType ===
                                                                "PLAYLIST"
                                                                ? "Playlist"
                                                                : "Video"}
                                                        </span>
                                                    </div>

                                                    {/* FEATURED */}

                                                    {course.featured && (
                                                        <div className="absolute right-3 top-3">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-amber-600 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-amber-400">
                                                                <Star
                                                                    size={
                                                                        11
                                                                    }
                                                                    fill="currentColor"
                                                                />
                                                                Featured
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* CONTENT */}

                                                <div className="p-5">
                                                    {/* CATEGORY + LEVEL */}

                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                            {course.category ||
                                                                "Course"}
                                                        </span>

                                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                                            {course.level ||
                                                                "All Levels"}
                                                        </span>
                                                    </div>

                                                    {/* TITLE */}

                                                    <h2 className="mt-3 line-clamp-2 font-bold leading-6 text-zinc-950 dark:text-white">
                                                        {
                                                            course.title
                                                        }
                                                    </h2>

                                                    {/* CHANNEL */}

                                                    {course.channelName && (
                                                        <p className="mt-2 truncate text-xs text-zinc-400">
                                                            {
                                                                course.channelName
                                                            }
                                                        </p>
                                                    )}

                                                    {/* DESCRIPTION */}

                                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                                        {
                                                            course.description
                                                        }
                                                    </p>

                                                    {/* META */}

                                                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                                                        <span>
                                                            {course.language ||
                                                                "English"}
                                                        </span>

                                                        <span>
                                                            {
                                                                course.lessonsCount
                                                            }{" "}
                                                            lessons
                                                        </span>

                                                        <span>
                                                            {
                                                                course.duration
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* YOUTUBE STATS */}

                                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <Heart
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="text-indigo-500"
                                                                />

                                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                    {formatNumber(
                                                                        course.likes
                                                                    )}
                                                                </span>

                                                                <span className="text-zinc-400">
                                                                    likes
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Eye
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="text-zinc-400"
                                                                />

                                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                    {formatNumber(
                                                                        course.views
                                                                    )}
                                                                </span>

                                                                <span className="text-zinc-400">
                                                                    views
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                                            {course.source ||
                                                                "YouTube"}
                                                        </span>
                                                    </div>

                                                    {/* ADMIN ACTIONS */}

                                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingId ===
                                                                course.id
                                                            }
                                                            onClick={() =>
                                                                updateCourse(
                                                                    course.id,
                                                                    "featured",
                                                                    !Boolean(
                                                                        course.featured
                                                                    )
                                                                )
                                                            }
                                                            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${course.featured
                                                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                                                                : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                                                                }`}
                                                        >
                                                            {updatingId ===
                                                                course.id ? (
                                                                <Loader2
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Star
                                                                    size={
                                                                        14
                                                                    }
                                                                    fill={
                                                                        course.featured
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                />
                                                            )}

                                                            {course.featured
                                                                ? "Featured"
                                                                : "Feature"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingId ===
                                                                course.id
                                                            }
                                                            onClick={() =>
                                                                updateCourse(
                                                                    course.id,
                                                                    "adminRecommended",
                                                                    !Boolean(
                                                                        course.adminRecommended
                                                                    )
                                                                )
                                                            }
                                                            className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${course.adminRecommended
                                                                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-400"
                                                                : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                                                                }`}
                                                        >
                                                            {updatingId ===
                                                                course.id ? (
                                                                <Loader2
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <CheckCircle2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )}

                                                            {course.adminRecommended
                                                                ? "Recommended"
                                                                : "Recommend"}
                                                        </button>
                                                    </div>

                                                    {/* FOOTER ACTIONS */}

                                                    <div className="mt-3 flex items-center gap-2">
                                                        <Link
                                                            href={`/courses/${course.slug}`}
                                                            target="_blank"
                                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                                        >
                                                            View
                                                            course

                                                            <ArrowRight
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                deletingId ===
                                                                course.id
                                                            }
                                                            onClick={() =>
                                                                deleteCourse(
                                                                    course
                                                                )
                                                            }
                                                            aria-label={`Delete ${course.title}`}
                                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/20"
                                                        >
                                                            {deletingId ===
                                                                course.id ? (
                                                                <Loader2
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    )}
                                </div>
                            )}

                        {/* =================================================
                            EMPTY
                        ================================================= */}

                        {filteredCourses.length ===
                            0 && (
                                <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
                                    <Search
                                        size={30}
                                        className="mx-auto text-zinc-300 dark:text-zinc-600"
                                    />

                                    <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                                        No courses found
                                    </h3>

                                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        Try changing
                                        your search
                                        or filters.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="mt-5 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                    >
                                        Reset
                                        filters
                                    </button>
                                </div>
                            )}
                    </>
                )}
            </div>
        </main>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {value.toLocaleString()}
            </p>
        </div>
    );
}

/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value: number | null | undefined
) {
    const number =
        Number(value) || 0;

    if (number >= 1_000_000_000) {
        return `${(
            number / 1_000_000_000
        ).toFixed(1)}B`;
    }

    if (number >= 1_000_000) {
        return `${(
            number / 1_000_000
        ).toFixed(1)}M`;
    }

    if (number >= 1_000) {
        return `${(
            number / 1_000
        ).toFixed(
            number >= 100_000
                ? 0
                : 1
        )}K`;
    }

    return number.toLocaleString();
}