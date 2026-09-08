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
    Users,
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
        <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">

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

                <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">

                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />


                    <div className="relative">

                        <Link
                            href="/admin"
                            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                        >
                            <ArrowLeft
                                size={16}
                                className="transition-transform group-hover:-translate-x-1"
                            />

                            Back to Admin
                        </Link>


                        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                            <div>

                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-400">

                                    <ShieldCheck
                                        size={13}
                                    />

                                    Administration

                                </div>


                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

                                    Course Management

                                </h1>


                                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">

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
                                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-600/20 dark:bg-white dark:text-zinc-950 dark:hover:bg-indigo-500 dark:hover:text-white"
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

                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        {/* SEARCH */}

                        <div className="group flex h-12 w-full items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:bg-zinc-900 xl:max-w-xl">

                            <Search
                                size={18}
                                className="shrink-0 text-zinc-400 transition-colors group-focus-within:text-indigo-500"
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
                                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
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


                            <div className="hidden h-8 w-px bg-zinc-200 sm:block dark:bg-zinc-800" />


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

                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">

                        <span className="font-semibold text-zinc-950 dark:text-white">
                            {
                                filteredCourses.length
                            }
                        </span>

                        {filteredCourses.length ===
                        1
                            ? "course"
                            : "courses"}

                        {hasFilters && (
                            <span className="text-zinc-300 dark:text-zinc-700">
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
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
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
                        <div className="mt-5 overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">

                                <Search
                                    size={28}
                                />

                            </div>


                            <h3 className="mt-5 text-lg font-bold">
                                No courses found
                            </h3>


                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
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
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 dark:bg-white dark:text-zinc-950 dark:hover:bg-indigo-500 dark:hover:text-white"
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
        <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-900/60 dark:hover:shadow-black/30">

            {/* =================================================
                THUMBNAIL
            ================================================= */}

            <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">

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
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400 dark:from-zinc-800 dark:to-zinc-900">

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


                {/* DARK GRADIENT */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/20 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />


                {/* TYPE BADGE */}

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">

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
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-950 shadow-lg">

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

                    <div className="flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-white/95 text-zinc-950 opacity-0 shadow-2xl backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-zinc-950/95 dark:text-white">

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
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 font-semibold backdrop-blur-sm">

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

                    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">

                        <span className="truncate">
                            {
                                course.category
                            }
                        </span>

                        <span className="text-zinc-300 dark:text-zinc-700">
                            •
                        </span>

                        <span className="shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
                            {
                                course.level
                            }
                        </span>

                    </div>


                    {course.adminRecommended && (
                        <span
                            title="Admin recommended"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
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

                <h2 className="mt-2 line-clamp-2 min-h-[48px] text-lg font-bold leading-6 tracking-tight text-zinc-950 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">

                    {
                        course.title
                    }

                </h2>


                {/* DESCRIPTION */}

                <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-zinc-500 dark:text-zinc-400">

                    {
                        course.description ||
                        "No description available."
                    }

                </p>


                {/* CHANNEL */}

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">

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

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-zinc-100 py-3 dark:border-zinc-800">

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
                        className={`group/button inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                            course.featured
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                                : "border-zinc-200 bg-white text-zinc-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-amber-900/50 dark:hover:bg-amber-950/20 dark:hover:text-amber-400"
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
                        className={`group/button inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                            course.adminRecommended
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-400"
                                : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-900/50 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
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
                        className="group/view flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 dark:bg-white dark:text-zinc-950 dark:hover:bg-indigo-500 dark:hover:text-white"
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
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-all hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:hover:border-red-900/50 dark:hover:bg-red-950/20 dark:hover:text-red-400"
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
                        className="group/delete flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md hover:shadow-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/20"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 p-4 backdrop-blur-md">

            <div className="flex min-h-full items-center justify-center py-6 sm:py-10">

                <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-black/20 dark:border-zinc-800 dark:bg-zinc-900">

                    {/* =================================================
                        MODAL HEADER
                    ================================================= */}

                    <div className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-indigo-50 via-white to-white p-6 dark:border-zinc-800 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-zinc-900 sm:p-7">

                        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />


                        <div className="relative flex items-start justify-between gap-5">

                            <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">

                                    <Plus
                                        size={
                                            22
                                        }
                                    />

                                </div>


                                <div>

                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                                        Course Management
                                    </p>

                                    <h2 className="mt-1.5 text-2xl font-bold tracking-tight">
                                        Add New Course
                                    </h2>

                                    <p className="mt-1.5 max-w-lg text-sm leading-5 text-zinc-500 dark:text-zinc-400">
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
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
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

                            <label className="mb-2.5 block text-sm font-bold">
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

                            <label className="mb-2 block text-sm font-bold">

                                {courseType ===
                                "VIDEO"
                                    ? "YouTube Video URL"
                                    : "YouTube Playlist URL"}

                                <span className="ml-1 text-red-500">
                                    *
                                </span>

                            </label>


                            <div className="group relative">

                                <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">

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
                                    className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-14 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:bg-zinc-900"
                                />

                            </div>


                            <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-zinc-400">

                                <CheckCircle2
                                    size={
                                        14
                                    }
                                    className="mt-0.5 shrink-0 text-emerald-500"
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
                                    className="form-input"
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
                                    className="form-input"
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
                                    className="form-input"
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
                                    className="form-input"
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
                                className="form-input h-auto resize-none py-3"
                            />

                        </FormField>


                        {/* =================================================
                            OPTIONS
                        ================================================= */}

                        <div>

                            <label className="mb-2.5 block text-sm font-bold">
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

                        <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    submitting
                                }
                                className="h-11 rounded-xl border border-zinc-200 px-5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-sm font-bold text-white shadow-lg shadow-zinc-950/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-indigo-500 dark:hover:text-white"
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
            "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
        blue:
            "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
        violet:
            "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
        amber:
            "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
        emerald:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    };


    return (
        <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {
                            label
                        }
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight">
                        {
                            value.toLocaleString()
                        }
                    </p>

                </div>


                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${accentClasses[accent]}`}
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
            className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
                active
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "border-zinc-200 bg-white text-zinc-600 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-900/60 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
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

            <span className="shrink-0 text-zinc-400">
                {
                    icon
                }
            </span>

            <div className="min-w-0">

                <p className="truncate text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {
                        value
                    }
                </p>

                <p className="text-[10px] text-zinc-400">
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
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                active
                    ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10 dark:border-indigo-700 dark:bg-indigo-950/30"
                    : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-indigo-900"
            }`}
        >

            {active && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">

                    <Check
                        size={
                            13
                        }
                    />

                </div>
            )}


            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    active
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
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


            <p className="mt-1 pr-5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
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

            <label className="mb-2 block text-sm font-bold">

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
            className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                checked
                    ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            }`}
        >

            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    checked
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                }`}
            >
                {
                    icon
                }
            </div>


            <div className="min-w-0 flex-1">

                <p className="text-sm font-bold">
                    {
                        title
                    }
                </p>

                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {
                        description
                    }
                </p>

            </div>


            <div
                className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
                    checked
                        ? "bg-indigo-600"
                        : "bg-zinc-200 dark:bg-zinc-700"
                }`}
            >

                <div
                    className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
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
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-sm ${
                isSuccess
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
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
                className="rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/5"
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
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

            <div className="h-48 animate-pulse bg-zinc-200 dark:bg-zinc-800" />

            <div className="space-y-4 p-5">

                <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                <div className="space-y-2">

                    <div className="h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                    <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                </div>

                <div className="h-10 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />

                <div className="h-10 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />

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