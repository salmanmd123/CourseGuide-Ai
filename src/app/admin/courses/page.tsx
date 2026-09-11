"use client";

import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import Link from "next/link";

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Eye,
    Heart,
    ListVideo,
    Loader2,
    Play,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Trash2,
    Video,
    X,
} from "lucide-react";

import AdminNavbar from "@/components/admin-navbar";


/* =========================================================
   TYPES
========================================================= */

type Course = {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    level: string;
    courseType:
        | "VIDEO"
        | "PLAYLIST"
        | string;
    language:
        | string
        | null;
    youtubeUrl?:
        | string
        | null;
    youtubeId?:
        | string
        | null;
    youtubePlaylistId?:
        | string
        | null;
    channelName?:
        | string
        | null;
    thumbnailUrl?:
        | string
        | null;
    views?:
        | number
        | null;
    likes?:
        | number
        | null;
    duration: string;
    lessonsCount: number;
    rating?:
        | string
        | null;
    students?:
        | string
        | null;
    source?:
        | string
        | null;
    recommendationScore?:
        | number
        | null;
    adminRecommended?:
        | boolean
        | null;
    featured?:
        | boolean
        | null;
    createdAt: string;
    updatedAt: string;
};


type TypeFilter =
    | "ALL"
    | "VIDEO"
    | "PLAYLIST";


type StatusFilter =
    | "ALL"
    | "FEATURED"
    | "RECOMMENDED";


type CreateType =
    | "VIDEO"
    | "PLAYLIST";


/* =========================================================
   OPTIONS
========================================================= */

const categories = [
    "Programming",
    "Computer Science",
    "AI & ML",
    "Web Development",
    "Data Science",
    "Databases",
    "Cyber Security",
    "DevOps",
    "Other",
];

const levels = [
    "Beginner",
    "Intermediate",
    "Advanced",
];

const languages = [
    "English",
    "Hindi",
];


/* =========================================================
   PAGE
========================================================= */

export default function AdminCoursesPage() {
    const [courses, setCourses] =
        useState<Course[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
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

    const [addOpen, setAddOpen] =
        useState(false);


    /* =====================================================
       LOAD COURSES
    ===================================================== */

    async function loadCourses() {
        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    "/api/admin/courses",
                    {
                        cache:
                            "no-store",
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


    /* =====================================================
       FILTER COURSES
    ===================================================== */

    const filteredCourses =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return courses.filter(
                (course) => {
                    const matchesSearch =
                        !query ||
                        course.title
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        (
                            course.category ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        (
                            course.channelName ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        (
                            course.language ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            );

                    const matchesType =
                        typeFilter ===
                            "ALL" ||
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


    /* =====================================================
       STATS
    ===================================================== */

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
                Boolean(
                    course.featured
                )
        ).length;

    const recommendedCourses =
        courses.filter(
            (course) =>
                Boolean(
                    course.adminRecommended
                )
        ).length;


    /* =====================================================
       UPDATE COURSE
    ===================================================== */

    async function updateCourse(
        id: number,
        field:
            | "featured"
            | "adminRecommended",
        value: boolean
    ) {
        try {
            setUpdatingId(id);
            setError("");

            const response =
                await fetch(
                    "/api/admin/courses",
                    {
                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                id,
                                [field]:
                                    value,
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
                            course.id ===
                            id
                                ? {
                                      ...course,
                                      [field]:
                                          value,
                                  }
                                : course
                    )
            );

            setSuccess(
                field ===
                    "featured"
                    ? value
                        ? "Course marked as featured."
                        : "Course removed from featured."
                    : value
                        ? "Course added to recommendations."
                        : "Course removed from recommendations."
            );

            setTimeout(
                () =>
                    setSuccess(""),
                2500
            );
        } catch (error) {
            console.error(
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update course"
            );
        } finally {
            setUpdatingId(
                null
            );
        }
    }


    /* =====================================================
       DELETE COURSE
    ===================================================== */

    async function deleteCourse(
        course: Course
    ) {
        const confirmed =
            window.confirm(
                `Delete "${course.title}"?\n\nThis will permanently remove the course and its lessons.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(
                course.id
            );

            setError("");

            const response =
                await fetch(
                    `/api/admin/courses?id=${course.id}`,
                    {
                        method:
                            "DELETE",
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

            setSuccess(
                "Course deleted successfully."
            );

            setTimeout(
                () =>
                    setSuccess(""),
                2500
            );
        } catch (error) {
            console.error(
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete course"
            );
        } finally {
            setDeletingId(
                null
            );
        }
    }


    /* =====================================================
       RESET FILTERS
    ===================================================== */

    function resetFilters() {
        setSearch("");
        setTypeFilter(
            "ALL"
        );
        setStatusFilter(
            "ALL"
        );
    }


    const hasFilters =
        Boolean(
            search
        ) ||
        typeFilter !==
            "ALL" ||
        statusFilter !==
            "ALL";


    return (
        <main className="min-h-screen bg-[#e0e5ec] text-black dark:bg-[#1a1d23] dark:text-[#f5f7fa]">

            {/* =================================================
                ADMIN NAVBAR
            ================================================= */}

            <AdminNavbar
                name="Admin"
                email=""
            />


            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="relative overflow-hidden rounded-[30px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-8">

                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#e0e5ec] shadow-[inset_10px_10px_20px_rgba(163,177,198,0.3),inset_-10px_-10px_20px_rgba(255,255,255,0.7)] dark:bg-[#1e2229] dark:shadow-[inset_10px_10px_20px_rgba(5,7,10,0.55),inset_-10px_-10px_20px_rgba(43,48,58,0.55)]" />

                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#e0e5ec] shadow-[9px_9px_18px_rgba(163,177,198,0.35),-9px_-9px_18px_rgba(255,255,255,0.7)] dark:bg-[#1e2229] dark:shadow-[9px_9px_18px_rgba(5,7,10,0.5),-9px_-9px_18px_rgba(43,48,58,0.5)]" />

                    <div className="relative">

                        <Link
                            href="/admin"
                            className="group inline-flex items-center gap-2 rounded-[12px] bg-[#e0e5ec] px-3 py-2 text-sm font-medium text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        >
                            <ArrowLeft
                                size={16}
                                className="transition-transform group-hover:-translate-x-1"
                            />

                            Back to Admin
                        </Link>


                        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                            <div>

                                <div className="mb-3 inline-flex items-center gap-2 rounded-[50px] bg-[#e0e5ec] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]">

                                    <ShieldCheck
                                        size={13}
                                    />

                                    Administration
                                </div>


                                <h1 className="text-3xl font-bold tracking-tight text-black dark:text-[#f5f7fa] sm:text-4xl">
                                    Course Management
                                </h1>


                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7] sm:text-base">
                                    Add, organize and manage
                                    YouTube learning content
                                    across CourseGuide AI.
                                </p>

                            </div>


                            <div className="flex flex-col gap-2 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setAddOpen(
                                            true
                                        )
                                    }
                                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[orangered] px-5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:bg-[red] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(43,48,58,0.35)]"
                                >

                                    <Plus
                                        size={17}
                                        className="transition-transform group-hover:rotate-90"
                                    />

                                    Add Course
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {(error ||
                    success) && (
                    <div className="mt-5">

                        {error && (
                            <Alert
                                type="error"
                                message={
                                    error
                                }
                                onClose={() =>
                                    setError(
                                        ""
                                    )
                                }
                            />
                        )}

                        {success && (
                            <Alert
                                type="success"
                                message={
                                    success
                                }
                                onClose={() =>
                                    setSuccess(
                                        ""
                                    )
                                }
                            />
                        )}

                    </div>
                )}


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    <StatCard
                        label="Total Courses"
                        value={
                            totalCourses
                        }
                        icon={
                            <Video
                                size={19}
                            />
                        }
                        accent="indigo"
                    />

                    <StatCard
                        label="Video Courses"
                        value={
                            videoCourses
                        }
                        icon={
                            <Play
                                size={19}
                            />
                        }
                        accent="blue"
                    />

                    <StatCard
                        label="Playlists"
                        value={
                            playlistCourses
                        }
                        icon={
                            <ListVideo
                                size={19}
                            />
                        }
                        accent="violet"
                    />

                    <StatCard
                        label="Featured"
                        value={
                            featuredCourses
                        }
                        icon={
                            <Star
                                size={19}
                            />
                        }
                        accent="amber"
                    />

                    <StatCard
                        label="Recommended"
                        value={
                            recommendedCourses
                        }
                        icon={
                            <Sparkles
                                size={19}
                            />
                        }
                        accent="emerald"
                    />

                </div>


                {/* =================================================
                    SEARCH + FILTERS
                ================================================= */}

                <div className="mt-6 rounded-[20px] bg-[#e0e5ec] p-4 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        {/* SEARCH */}

                        <div className="group flex h-12 w-full items-center rounded-[12px] bg-[#e0e5ec] px-4 shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 focus-within:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus-within:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)] xl:max-w-xl">

                            <Search
                                size={18}
                                className="shrink-0 text-[#3f3e3e] transition-colors group-focus-within:text-[orangered] dark:text-[#a8adb7] dark:group-focus-within:text-[orangered]"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
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
                                className="ml-3 w-full bg-transparent text-sm text-black outline-none placeholder:text-[#777] dark:text-[#f5f7fa] dark:placeholder:text-[#6f7580]"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch(
                                            ""
                                        )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                >
                                    <X
                                        size={15}
                                    />
                                </button>
                            )}

                        </div>


                        {/* FILTERS */}

                        <div className="flex flex-wrap gap-2">

                            <FilterPill
                                active={
                                    typeFilter ===
                                    "ALL"
                                }
                                onClick={() => {
                                    setTypeFilter(
                                        "ALL"
                                    );
                                }}
                                icon={
                                    <Sparkles
                                        size={14}
                                    />
                                }
                            >
                                All
                            </FilterPill>


                            <FilterPill
                                active={
                                    typeFilter ===
                                    "VIDEO"
                                }
                                onClick={() => {
                                    setTypeFilter(
                                        "VIDEO"
                                    );
                                }}
                                icon={
                                    <Play
                                        size={14}
                                    />
                                }
                            >
                                Videos
                            </FilterPill>


                            <FilterPill
                                active={
                                    typeFilter ===
                                    "PLAYLIST"
                                }
                                onClick={() => {
                                    setTypeFilter(
                                        "PLAYLIST"
                                    );
                                }}
                                icon={
                                    <ListVideo
                                        size={14}
                                    />
                                }
                            >
                                Playlists
                            </FilterPill>


                            <div className="mx-1 hidden h-8 w-px bg-[#c8ced7] dark:bg-[#343943] sm:block" />


                            <FilterPill
                                active={
                                    statusFilter ===
                                    "FEATURED"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        statusFilter ===
                                            "FEATURED"
                                            ? "ALL"
                                            : "FEATURED"
                                    )
                                }
                                icon={
                                    <Star
                                        size={14}
                                    />
                                }
                            >
                                Featured
                            </FilterPill>


                            <FilterPill
                                active={
                                    statusFilter ===
                                    "RECOMMENDED"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        statusFilter ===
                                            "RECOMMENDED"
                                            ? "ALL"
                                            : "RECOMMENDED"
                                    )
                                }
                                icon={
                                    <Sparkles
                                        size={14}
                                    />
                                }
                            >
                                Recommended
                            </FilterPill>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RESULT BAR
                ================================================= */}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

                    <div className="flex items-center gap-2 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">

                        <span className="font-semibold text-black dark:text-[#f5f7fa]">
                            {
                                filteredCourses.length
                            }
                        </span>

                        {filteredCourses.length ===
                        1
                            ? "course"
                            : "courses"}

                        {hasFilters && (
                            <span className="text-[#8a8f98] dark:text-[#6f7580]">
                                /
                            </span>
                        )}

                        {hasFilters && (
                            <span>
                                filtered
                            </span>
                        )}

                    </div>


                    {hasFilters && (
                        <button
                            type="button"
                            onClick={
                                resetFilters
                            }
                            className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#e0e5ec] px-3 py-1.5 text-xs font-semibold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        >
                            <X
                                size={13}
                            />

                            Clear filters
                        </button>
                    )}

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {Array.from(
                            {
                                length: 6,
                            }
                        ).map(
                            (
                                _,
                                index
                            ) => (
                                <CourseSkeleton
                                    key={
                                        index
                                    }
                                />
                            )
                        )}

                    </div>
                )}


                {/* =================================================
                    COURSES
                ================================================= */}

                {!loading &&
                    filteredCourses.length >
                        0 && (
                        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                            {filteredCourses.map(
                                (
                                    course
                                ) => (
                                    <CourseCard
                                        key={
                                            course.id
                                        }
                                        course={
                                            course
                                        }
                                        updating={
                                            updatingId ===
                                            course.id
                                        }
                                        deleting={
                                            deletingId ===
                                            course.id
                                        }
                                        onUpdate={
                                            updateCourse
                                        }
                                        onDelete={
                                            deleteCourse
                                        }
                                    />
                                )
                            )}

                        </div>
                    )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    filteredCourses.length ===
                        0 && (
                        <div className="mt-5 overflow-hidden rounded-[30px] bg-[#e0e5ec] px-6 py-20 text-center shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)]">

                                <Search
                                    size={28}
                                />

                            </div>


                            <h3 className="mt-5 text-lg font-bold text-black dark:text-[#f5f7fa]">
                                No courses found
                            </h3>


                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                                No courses match
                                your current
                                search and
                                filters.
                            </p>


                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[orangered] px-5 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(43,48,58,0.35)]"
                            >
                                <X
                                    size={15}
                                />

                                Reset filters
                            </button>

                        </div>
                    )}

            </div>


            {/* =================================================
                ADD COURSE MODAL
            ================================================= */}

            {addOpen && (
                <AddCourseModal
                    onClose={() =>
                        setAddOpen(
                            false
                        )
                    }
                    onCreated={(
                        course
                    ) => {
                        setCourses(
                            (
                                current
                            ) => [
                                course,
                                ...current,
                            ]
                        );

                        setAddOpen(
                            false
                        );

                        setSuccess(
                            "Course added successfully."
                        );

                        setTimeout(
                            () =>
                                setSuccess(
                                    ""
                                ),
                            3000
                        );
                    }}
                />
            )}

        </main>
    );
}


/* =========================================================
   COURSE CARD
========================================================= */

function CourseCard({
    course,
    updating,
    deleting,
    onUpdate,
    onDelete,
}: {
    course: Course;
    updating: boolean;
    deleting: boolean;
    onUpdate: (
        id: number,
        field:
            | "featured"
            | "adminRecommended",
        value: boolean
    ) => void;
    onDelete: (
        course: Course
    ) => void;
}) {
    return (
        <article className="group overflow-hidden rounded-[20px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]">

            {/* =================================================
                THUMBNAIL
            ================================================= */}

            <div className="relative h-48 overflow-hidden rounded-t-[20px] bg-[#e0e5ec] dark:bg-[#1e2229]">

                {course.thumbnailUrl ? (
                    <img
                        src={
                            course.thumbnailUrl
                        }
                        alt={
                            course.title
                        }
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)]">

                        {course.courseType ===
                        "PLAYLIST" ? (
                            <ListVideo
                                size={
                                    42
                                }
                            />
                        ) : (
                            <Video
                                size={
                                    42
                                }
                            />
                        )}

                    </div>
                )}


                {/* IMAGE OVERLAY */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />


                {/* TYPE BADGE */}

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-[50px] bg-[#e0e5ec] px-3 py-1.5 text-xs font-bold text-black shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)]">

                        {course.courseType ===
                        "PLAYLIST" ? (
                            <ListVideo
                                size={
                                    13
                                }
                            />
                        ) : (
                            <Play
                                size={
                                    13
                                }
                                fill="currentColor"
                            />
                        )}

                        {course.courseType ===
                        "PLAYLIST"
                            ? "Playlist"
                            : "Video"}

                    </span>


                    {course.featured && (
                        <span className="inline-flex items-center gap-1.5 rounded-[50px] bg-[orangered] px-3 py-1.5 text-xs font-bold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)]">

                            <Star
                                size={12}
                                fill="currentColor"
                            />

                            Featured

                        </span>
                    )}

                </div>


                {/* PLAY BUTTON */}

                <div className="absolute inset-0 flex items-center justify-center">

                    <div className="flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] opacity-0 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.7),-9px_-9px_16px_rgba(43,48,58,0.7)]">

                        {course.courseType ===
                        "PLAYLIST" ? (
                            <ListVideo
                                size={
                                    21
                                }
                            />
                        ) : (
                            <Play
                                size={
                                    20
                                }
                                fill="currentColor"
                            />
                        )}

                    </div>

                </div>


                {/* BOTTOM INFO */}

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-xs text-white">

                    <span className="font-medium drop-shadow">
                        {
                            course.channelName ||
                            "YouTube"
                        }
                    </span>


                    {course.duration && (
                        <span className="inline-flex items-center gap-1 rounded-[12px] bg-black/60 px-2 py-1 font-semibold backdrop-blur-sm">

                            <Clock3
                                size={12}
                            />

                            {
                                course.duration
                            }

                        </span>
                    )}

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="p-5">

                {/* CATEGORY */}

                <div className="flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-[orangered]">

                        <span className="truncate">
                            {
                                course.category
                            }
                        </span>

                        <span className="text-[#8a8f98] dark:text-[#6f7580]">
                            •
                        </span>

                        <span className="shrink-0 font-medium text-[#3f3e3e] dark:text-[#a8adb7]">
                            {
                                course.level
                            }
                        </span>

                    </div>


                    {course.adminRecommended && (
                        <span
                            title="Admin recommended"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        >
                            <Sparkles
                                size={
                                    14
                                }
                            />
                        </span>
                    )}

                </div>


                {/* TITLE */}

                <h2 className="mt-2 line-clamp-2 min-h-[48px] text-lg font-bold leading-6 tracking-tight text-black transition-colors group-hover:text-[orangered] dark:text-[#f5f7fa] dark:group-hover:text-[orangered]">
                    {
                        course.title
                    }
                </h2>


                {/* DESCRIPTION */}

                <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-[#3f3e3e] dark:text-[#a8adb7]">
                    {
                        course.description ||
                        "No description available."
                    }
                </p>


                {/* CHANNEL */}

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#3f3e3e] dark:text-[#a8adb7]">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]">

                        <Play
                            size={
                                11
                            }
                            fill="currentColor"
                        />

                    </div>

                    <span className="truncate">
                        {
                            course.channelName ||
                            "YouTube"
                        }
                    </span>

                </div>


                {/* METADATA */}

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#c8ced7] py-3 dark:border-[#343943]">

                    <MetaItem
                        icon={
                            <Eye
                                size={
                                    14
                                }
                            />
                        }
                        value={formatNumber(
                            course.views
                        )}
                        label="views"
                    />

                    <MetaItem
                        icon={
                            <Heart
                                size={
                                    14
                                }
                            />
                        }
                        value={formatNumber(
                            course.likes
                        )}
                        label="likes"
                    />

                    <MetaItem
                        icon={
                            <ListVideo
                                size={
                                    14
                                }
                            />
                        }
                        value={String(
                            course.lessonsCount ||
                                0
                        )}
                        label="lessons"
                    />

                </div>


                {/* ADMIN CONTROLS */}

                <div className="mt-4 grid grid-cols-2 gap-2">

                    <button
                        type="button"
                        disabled={
                            updating
                        }
                        onClick={() =>
                            onUpdate(
                                course.id,
                                "featured",
                                !course.featured
                            )
                        }
                        className={`group/button inline-flex items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                            course.featured
                                ? "bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:bg-[red] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(43,48,58,0.35)]"
                                : "bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        }`}
                    >

                        {updating ? (
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
                                className="transition-transform group-hover/button:scale-110"
                            />
                        )}

                        {
                            course.featured
                                ? "Featured"
                                : "Feature"
                        }

                    </button>


                    <button
                        type="button"
                        disabled={
                            updating
                        }
                        onClick={() =>
                            onUpdate(
                                course.id,
                                "adminRecommended",
                                !course.adminRecommended
                            )
                        }
                        className={`group/button inline-flex items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                            course.adminRecommended
                                ? "bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:bg-[red] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(43,48,58,0.35)]"
                                : "bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        }`}
                    >

                        {updating ? (
                            <Loader2
                                size={
                                    14
                                }
                                className="animate-spin"
                            />
                        ) : (
                            <Sparkles
                                size={
                                    14
                                }
                                className="transition-transform group-hover/button:rotate-12"
                            />
                        )}

                        {
                            course.adminRecommended
                                ? "Recommended"
                                : "Recommend"
                        }

                    </button>

                </div>


                {/* FOOTER */}

                <div className="mt-3 flex gap-2">

                    <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="group/view flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[orangered] py-2.5 text-sm font-bold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:bg-[red] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(43,48,58,0.35)]"
                    >

                        View Course

                        <ArrowRight
                            size={
                                15
                            }
                            className="transition-transform group-hover/view:translate-x-1"
                        />

                    </Link>


                    {course.youtubeUrl && (
                        <a
                            href={
                                course.youtubeUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            title="Open on YouTube"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                        >
                            <ExternalLink
                                size={
                                    16
                                }
                            />
                        </a>
                    )}


                    <button
                        type="button"
                        disabled={
                            deleting
                        }
                        onClick={() =>
                            onDelete(
                                course
                            )
                        }
                        title="Delete course"
                        className="group/delete flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-red-500 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-red-600 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-red-400 dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                    >

                        {deleting ? (
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
                                className="transition-transform group-hover/delete:scale-110"
                            />
                        )}

                    </button>

                </div>

            </div>

        </article>
    );
}


/* =========================================================
   ADD COURSE MODAL
========================================================= */

function AddCourseModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (
        course: Course
    ) => void;
}) {
    const [
        courseType,
        setCourseType,
    ] =
        useState<CreateType>(
            "VIDEO"
        );

    const [
        url,
        setUrl,
    ] = useState("");

    const [
        title,
        setTitle,
    ] = useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        category,
        setCategory,
    ] =
        useState(
            "Programming"
        );

    const [
        level,
        setLevel,
    ] =
        useState(
            "Beginner"
        );

    const [
        language,
        setLanguage,
    ] =
        useState(
            "English"
        );

    const [
        featured,
        setFeatured,
    ] =
        useState(false);

    const [
        adminRecommended,
        setAdminRecommended,
    ] =
        useState(false);

    const [
        submitting,
        setSubmitting,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] = useState("");


    /* =====================================================
       SUBMIT
    ===================================================== */

    async function submit(
        event: React.FormEvent
    ) {
        event.preventDefault();

        if (!url.trim()) {
            setError(
                "YouTube URL is required."
            );

            return;
        }

        try {
            setSubmitting(
                true
            );

            setError("");

            const response =
                await fetch(
                    "/api/admin/courses",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                courseType,
                                url,
                                title,
                                description,
                                category,
                                level,
                                language,
                                featured,
                                adminRecommended,
                            }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        "Failed to add course"
                );
            }

            onCreated(
                data.course
            );
        } catch (error) {
            console.error(
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to add course"
            );
        } finally {
            setSubmitting(
                false
            );
        }
    }


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#e0e5ec]/90 p-4 backdrop-blur-md dark:bg-[#1a1d23]/90">

            <div className="flex min-h-full items-center justify-center py-6 sm:py-10">

                <div className="w-full max-w-2xl overflow-hidden rounded-[30px] bg-[#e0e5ec] shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[14px_14px_28px_rgba(5,7,10,0.8),-14px_-14px_28px_rgba(43,48,58,0.8)]">

                    {/* =================================================
                        MODAL HEADER
                    ================================================= */}

                    <div className="relative overflow-hidden border-b border-[#c8ced7] bg-[#e0e5ec] p-6 dark:border-[#343943] dark:bg-[#1e2229] sm:p-7">

                        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#e0e5ec] shadow-[inset_8px_8px_16px_rgba(163,177,198,0.35),inset_-8px_-8px_16px_rgba(255,255,255,0.7)] dark:bg-[#1e2229] dark:shadow-[inset_8px_8px_16px_rgba(5,7,10,0.55),inset_-8px_-8px_16px_rgba(43,48,58,0.55)]" />


                        <div className="relative flex items-start justify-between gap-5">

                            <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)]">

                                    <Plus
                                        size={
                                            22
                                        }
                                    />

                                </div>


                                <div>

                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[orangered]">
                                        Course Management
                                    </p>

                                    <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-black dark:text-[#f5f7fa]">
                                        Add New Course
                                    </h2>

                                    <p className="mt-1.5 max-w-lg text-sm leading-5 text-[#3f3e3e] dark:text-[#a8adb7]">
                                        Import learning
                                        content directly
                                        from YouTube.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                            >
                                <X
                                    size={
                                        19
                                    }
                                />
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={
                            submit
                        }
                        className="space-y-6 p-6 sm:p-7"
                    >

                        {error && (
                            <Alert
                                type="error"
                                message={
                                    error
                                }
                                onClose={() =>
                                    setError(
                                        ""
                                    )
                                }
                            />
                        )}


                        {/* =================================================
                            TYPE
                        ================================================= */}

                        <div>

                            <label className="mb-2.5 block text-sm font-bold text-black dark:text-[#f5f7fa]">
                                Course Type
                            </label>


                            <div className="grid gap-3 sm:grid-cols-2">

                                <TypeCard
                                    active={
                                        courseType ===
                                        "VIDEO"
                                    }
                                    icon={
                                        <Play
                                            size={
                                                19
                                            }
                                            fill="currentColor"
                                        />
                                    }
                                    title="Single Video"
                                    description="Create a course from one YouTube video"
                                    onClick={() =>
                                        setCourseType(
                                            "VIDEO"
                                        )
                                    }
                                />


                                <TypeCard
                                    active={
                                        courseType ===
                                        "PLAYLIST"
                                    }
                                    icon={
                                        <ListVideo
                                            size={
                                                20
                                            }
                                        />
                                    }
                                    title="YouTube Playlist"
                                    description="Import playlist videos as lessons"
                                    onClick={() =>
                                        setCourseType(
                                            "PLAYLIST"
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* =================================================
                            URL
                        ================================================= */}

                        <div>

                            <label className="mb-2 block text-sm font-bold text-black dark:text-[#f5f7fa]">

                                {courseType ===
                                "VIDEO"
                                    ? "YouTube Video URL"
                                    : "YouTube Playlist URL"}

                                <span className="ml-1 text-red-500">
                                    *
                                </span>

                            </label>


                            <div className="group relative">

                                <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]">

                                    <Play
                                        size={
                                            13
                                        }
                                        fill="currentColor"
                                    />

                                </div>


                                <input
                                    type="url"
                                    required
                                    value={
                                        url
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setUrl(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder={
                                        courseType ===
                                        "VIDEO"
                                            ? "https://www.youtube.com/watch?v=..."
                                            : "https://www.youtube.com/playlist?list=..."
                                    }
                                    className="h-12 w-full rounded-[12px] bg-[#e0e5ec] pl-14 pr-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:placeholder:text-[#6f7580] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                />

                            </div>


                            <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#3f3e3e] dark:text-[#a8adb7]">

                                <CheckCircle2
                                    size={
                                        14
                                    }
                                    className="mt-0.5 shrink-0 text-[orangered]"
                                />

                                <span>

                                    {courseType ===
                                    "VIDEO"
                                        ? "YouTube metadata will be imported automatically."
                                        : "Each accessible video in the playlist will become a lesson automatically."}

                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            TITLE + CATEGORY
                        ================================================= */}

                        <div className="grid gap-4 sm:grid-cols-2">

                            <FormField
                                label="Course Title"
                            >

                                <input
                                    value={
                                        title
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setTitle(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Auto-filled from YouTube"
                                    className="form-input h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:placeholder:text-[#6f7580] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                />

                            </FormField>


                            <FormField
                                label="Category"
                                required
                            >

                                <select
                                    value={
                                        category
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCategory(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="form-input h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                >

                                    {categories.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item
                                                }
                                                value={
                                                    item
                                                }
                                            >
                                                {
                                                    item
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </FormField>


                            <FormField
                                label="Level"
                                required
                            >

                                <select
                                    value={
                                        level
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setLevel(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="form-input h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                >

                                    {levels.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item
                                                }
                                                value={
                                                    item
                                                }
                                            >
                                                {
                                                    item
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </FormField>


                            <FormField
                                label="Language"
                                required
                            >

                                <select
                                    value={
                                        language
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setLanguage(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="form-input h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                                >

                                    {languages.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item
                                                }
                                                value={
                                                    item
                                                }
                                            >
                                                {
                                                    item
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </FormField>

                        </div>


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <FormField
                            label="Description"
                        >

                            <textarea
                                value={
                                    description
                                }
                                onChange={(
                                    event
                                ) =>
                                    setDescription(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                rows={3}
                                placeholder="Auto-filled from YouTube if left empty"
                                className="form-input h-auto w-full resize-none rounded-[12px] bg-[#e0e5ec] px-4 py-3 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:placeholder:text-[#6f7580] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                            />

                        </FormField>


                        {/* =================================================
                            OPTIONS
                        ================================================= */}

                        <div>

                            <label className="mb-2.5 block text-sm font-bold text-black dark:text-[#f5f7fa]">
                                Course Visibility
                            </label>


                            <div className="grid gap-3 sm:grid-cols-2">

                                <ToggleOption
                                    checked={
                                        featured
                                    }
                                    onChange={
                                        setFeatured
                                    }
                                    icon={
                                        <Star
                                            size={
                                                17
                                            }
                                            fill={
                                                featured
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    }
                                    title="Featured"
                                    description="Highlight this course"
                                />


                                <ToggleOption
                                    checked={
                                        adminRecommended
                                    }
                                    onChange={
                                        setAdminRecommended
                                    }
                                    icon={
                                        <Sparkles
                                            size={
                                                17
                                            }
                                        />
                                    }
                                    title="Recommended"
                                    description="Include in admin recommendations"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="flex flex-col-reverse gap-3 border-t border-[#c8ced7] pt-5 dark:border-[#343943] sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    submitting
                                }
                                className="h-11 rounded-[12px] bg-[#e0e5ec] px-5 text-sm font-bold text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] disabled:opacity-50 dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[orangered] px-6 text-sm font-bold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:bg-[red] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(43,48,58,0.35)]"
                            >

                                {submitting ? (
                                    <>
                                        <Loader2
                                            size={
                                                17
                                            }
                                            className="animate-spin"
                                        />

                                        {courseType ===
                                        "PLAYLIST"
                                            ? "Importing Playlist..."
                                            : "Adding Course..."}
                                    </>
                                ) : (
                                    <>
                                        <Plus
                                            size={
                                                17
                                            }
                                            className="transition-transform group-hover:rotate-90"
                                        />

                                        Add Course
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: number;
    icon: ReactNode;
    accent:
        | "indigo"
        | "blue"
        | "violet"
        | "amber"
        | "emerald";
}) {
    const accentClasses = {
        indigo:
            "text-[orangered]",
        blue:
            "text-[orangered]",
        violet:
            "text-[orangered]",
        amber:
            "text-[orangered]",
        emerald:
            "text-[orangered]",
    };


    return (
        <div className="group rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#777] dark:text-[#7f8590]">
                        {
                            label
                        }
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-[#f5f7fa]">
                        {
                            value.toLocaleString()
                        }
                    </p>

                </div>


                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] transition-transform duration-300 group-hover:scale-110 dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)] ${accentClasses[accent]}`}
                >
                    {
                        icon
                    }
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   FILTER PILL
========================================================= */

function FilterPill({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={`group inline-flex items-center gap-1.5 rounded-[50px] px-3.5 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
                active
                    ? "bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:bg-[red] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:bg-[red]"
                    : "bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:text-[orangered] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
            }`}
        >

            <span className="transition-transform group-hover:scale-110">
                {
                    icon
                }
            </span>

            {
                children
            }

        </button>
    );
}


/* =========================================================
   META ITEM
========================================================= */

function MetaItem({
    icon,
    value,
    label,
}: {
    icon: ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-1.5">

            <span className="shrink-0 text-[orangered]">
                {
                    icon
                }
            </span>

            <div className="min-w-0">

                <p className="truncate text-xs font-bold text-black dark:text-[#f5f7fa]">
                    {
                        value
                    }
                </p>

                <p className="text-[10px] text-[#777] dark:text-[#7f8590]">
                    {
                        label
                    }
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   TYPE CARD
========================================================= */

function TypeCard({
    active,
    icon,
    title,
    description,
    onClick,
}: {
    active: boolean;
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={`group relative overflow-hidden rounded-[20px] p-4 text-left transition-all duration-200 ${
                active
                    ? "bg-[#e0e5ec] text-black shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)]"
                    : "bg-[#e0e5ec] text-black shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
            }`}
        >

            {active && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[orangered] text-white shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(5,7,10,0.55),-3px_-3px_6px_rgba(43,48,58,0.55)]">

                    <Check
                        size={
                            13
                        }
                    />

                </div>
            )}


            <div
                className={`flex h-10 w-10 items-center justify-center rounded-[12px] transition-transform group-hover:scale-105 ${
                    active
                        ? "bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)]"
                        : "bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                }`}
            >
                {
                    icon
                }
            </div>


            <p className="mt-3 text-sm font-bold">
                {
                    title
                }
            </p>


            <p className="mt-1 pr-5 text-xs leading-5 text-[#3f3e3e] dark:text-[#a8adb7]">
                {
                    description
                }
            </p>

        </button>
    );
}


/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-bold text-black dark:text-[#f5f7fa]">

                {
                    label
                }

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            {
                children
            }

        </div>
    );
}


/* =========================================================
   TOGGLE OPTION
========================================================= */

function ToggleOption({
    checked,
    onChange,
    icon,
    title,
    description,
}: {
    checked: boolean;
    onChange: (
        value: boolean
    ) => void;
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <button
            type="button"
            onClick={() =>
                onChange(
                    !checked
                )
            }
            className={`group flex items-center gap-3 rounded-[20px] p-3.5 text-left transition-all ${
                checked
                    ? "bg-[#e0e5ec] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.65),inset_-6px_-6px_10px_rgba(43,48,58,0.65)]"
                    : "bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
            }`}
        >

            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] transition-transform group-hover:scale-105 ${
                    checked
                        ? "bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.6),-5px_-5px_10px_rgba(43,48,58,0.6)]"
                        : "bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)]"
                }`}
            >
                {
                    icon
                }
            </div>


            <div className="min-w-0 flex-1">

                <p className="text-sm font-bold text-black dark:text-[#f5f7fa]">
                    {
                        title
                    }
                </p>

                <p className="mt-0.5 text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                    {
                        description
                    }
                </p>

            </div>


            <div
                className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
                    checked
                        ? "bg-[orangered]"
                        : "bg-[#c8ced7] dark:bg-[#343943]"
                }`}
            >

                <div
                    className={`h-4 w-4 rounded-full bg-[#e0e5ec] shadow-[2px_2px_4px_rgba(163,177,198,0.5),-2px_-2px_4px_rgba(255,255,255,0.8)] transition-transform dark:bg-[#1e2229] dark:shadow-[2px_2px_4px_rgba(5,7,10,0.55),-2px_-2px_4px_rgba(43,48,58,0.55)] ${
                        checked
                            ? "translate-x-4"
                            : "translate-x-0"
                    }`}
                />

            </div>

        </button>
    );
}


/* =========================================================
   ALERT
========================================================= */

function Alert({
    type,
    message,
    onClose,
}: {
    type:
        | "error"
        | "success";
    message: string;
    onClose: () => void;
}) {
    const isSuccess =
        type ===
        "success";


    return (
        <div
            className={`flex items-start gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3.5 text-sm shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)] ${
                isSuccess
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
            }`}
        >

            <div className="mt-0.5 shrink-0">

                {isSuccess ? (
                    <CheckCircle2
                        size={
                            17
                        }
                    />
                ) : (
                    <X
                        size={
                            17
                        }
                    />
                )}

            </div>


            <span className="flex-1 leading-5">
                {
                    message
                }
            </span>


            <button
                type="button"
                onClick={
                    onClose
                }
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e0e5ec] transition-all hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.55),inset_-3px_-3px_6px_rgba(43,48,58,0.55)] dark:hover:text-[orangered]"
            >
                <X
                    size={
                        15
                    }
                />
            </button>

        </div>
    );
}


/* =========================================================
   COURSE SKELETON
========================================================= */

function CourseSkeleton() {
    return (
        <div className="overflow-hidden rounded-[20px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">

            <div className="h-48 animate-pulse bg-[#d4dae3] dark:bg-[#292e37]" />

            <div className="space-y-4 p-5">

                <div className="h-3 w-24 animate-pulse rounded-[12px] bg-[#d4dae3] dark:bg-[#292e37]" />

                <div className="space-y-2">

                    <div className="h-5 w-full animate-pulse rounded-[12px] bg-[#d4dae3] dark:bg-[#292e37]" />

                    <div className="h-5 w-3/4 animate-pulse rounded-[12px] bg-[#d4dae3] dark:bg-[#292e37]" />

                </div>

                <div className="h-10 animate-pulse rounded-[12px] bg-[#d4dae3] dark:bg-[#292e37]" />

                <div className="h-10 animate-pulse rounded-[12px] bg-[#d4dae3] dark:bg-[#292e37]" />

            </div>

        </div>
    );
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value:
        | number
        | null
        | undefined
) {
    const number =
        Number(value) ||
        0;

    if (
        number >=
        1_000_000_000
    ) {
        return `${(
            number /
            1_000_000_000
        ).toFixed(1)}B`;
    }

    if (
        number >=
        1_000_000
    ) {
        return `${(
            number /
            1_000_000
        ).toFixed(1)}M`;
    }

    if (
        number >=
        1_000
    ) {
        return `${(
            number /
            1_000
        ).toFixed(
            number >=
                100_000
                ? 0
                : 1
        )}K`;
    }

    return number.toLocaleString();
}