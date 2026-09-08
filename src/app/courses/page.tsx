"use client";

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from "react";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Search,
    Sparkles,
    Star,
    ThumbsUp,
    X,
} from "lucide-react";

import Navbar from "@/components/navbar";
import LogoLoader from "@/components/LogoLoader";

type Course = {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    lessonsCount: number;

    rating: string | null;
    students: string | null;

    views?: number | null;
    likes?: number | null;

    source: string | null;

    featured: boolean | null;
    adminRecommended?: boolean | null;
    recommendationScore?: number | null;

    thumbnailUrl?: string | null;
    youtubeUrl?: string | null;

    // YouTube channel name
    channelName?: string | null;

    language?: string | null;
};

const categories = [
    "All",
    "Programming",
    "Computer Science",
    "AI & ML",
    "Web Development",
    "Databases",
];

const languages = [
    {
        value: "English",
        label: "🇬🇧 English",
    },
    {
        value: "Hindi",
        label: "🇮🇳 Hindi",
    },
];

/* =========================================================
   TEXT HELPERS
========================================================= */

function normalizeText(
    value: string | null | undefined
): string {
    return (value || "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[\/_-]/g, " ")
        .replace(/[.]/g, " ")
        .replace(/\+/g, " plus ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeLanguage(
    value: string | null | undefined
): string {
    return normalizeText(value);
}

/* =========================================================
   CATEGORY KEYWORDS
========================================================= */

const programmingKeywords = [
    "python",
    "java",
    " c ",
    "c plus plus",
    "cpp",
    "c programming",
    "javascript",
    "java script",
    "typescript",
    "type script",
    "golang",
    "go programming",
    "rust",
    "kotlin",
    "swift",
    "ruby",
    "programming",
    "coding",
];

const webDevelopmentKeywords = [
    "react",
    "reactjs",
    "nextjs",
    "next js",
    "html",
    "css",
    "php",
    "mern",
    "mean stack",
    "node",
    "nodejs",
    "node js",
    "express",
    "expressjs",
    "express js",
    "frontend",
    "front end",
    "backend",
    "back end",
    "full stack",
    "web development",
];

const databaseKeywords = [
    "sql",
    "mysql",
    "postgresql",
    "postgres",
    "mongodb",
    "mongo db",
    "database",
    "databases",
    "dbms",
    "oracle database",
    "redis",
    "sqlite",
    "firebase",
];

const aiMlKeywords = [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "ai",
    " ml ",
    "natural language processing",
    "nlp",
    "computer vision",
    "generative ai",
    "gen ai",
    "tensorflow",
    "pytorch",
    "neural network",
    "neural networks",
];

const computerScienceKeywords = [
    "data structures",
    "data structure",
    "algorithms",
    "algorithm",
    "dsa",
    "operating systems",
    "operating system",
    "computer networks",
    "computer network",
    "networking",
    "database management",
    "software engineering",
    "computer science",
    "discrete mathematics",
    "discrete math",
    "theory of computation",
    "compiler design",
    "computer architecture",
];

/* =========================================================
   CATEGORY NORMALIZATION
========================================================= */

function getCourseCategory(
    course: Course
): string {
    const rawCategory =
        normalizeText(course.category);

    const title =
        normalizeText(course.title);

    const description =
        normalizeText(course.description);

    if (
        rawCategory === "programming"
    ) {
        return "Programming";
    }

    if (
        rawCategory === "computer science"
    ) {
        return "Computer Science";
    }

    if (
        rawCategory === "ai ml" ||
        rawCategory === "ai and ml" ||
        rawCategory ===
        "artificial intelligence and machine learning"
    ) {
        return "AI & ML";
    }

    if (
        rawCategory === "web development"
    ) {
        return "Web Development";
    }

    if (
        rawCategory === "database" ||
        rawCategory === "databases"
    ) {
        return "Databases";
    }

    /* Programming */

    if (
        rawCategory === "python" ||
        rawCategory === "java" ||
        rawCategory === "c" ||
        rawCategory === "c plus plus" ||
        rawCategory === "cpp" ||
        rawCategory === "javascript" ||
        rawCategory === "java script" ||
        rawCategory === "typescript" ||
        rawCategory === "type script" ||
        rawCategory ===
        "programming languages" ||
        rawCategory === "coding"
    ) {
        return "Programming";
    }

    /* Web */

    if (
        rawCategory === "react" ||
        rawCategory === "reactjs" ||
        rawCategory === "php" ||
        rawCategory === "mern" ||
        rawCategory === "node" ||
        rawCategory === "nodejs" ||
        rawCategory === "express" ||
        rawCategory === "html" ||
        rawCategory === "css" ||
        rawCategory === "web dev"
    ) {
        return "Web Development";
    }

    /* Database */

    if (
        rawCategory === "sql" ||
        rawCategory === "mysql" ||
        rawCategory === "postgresql" ||
        rawCategory === "postgres" ||
        rawCategory === "mongodb" ||
        rawCategory === "mongo db" ||
        rawCategory === "dbms"
    ) {
        return "Databases";
    }

    /* AI / ML */

    if (
        rawCategory === "ai" ||
        rawCategory === "ml" ||
        rawCategory === "machine learning" ||
        rawCategory ===
        "artificial intelligence" ||
        rawCategory === "deep learning" ||
        rawCategory === "nlp"
    ) {
        return "AI & ML";
    }

    /* Computer Science */

    if (
        rawCategory === "dsa" ||
        rawCategory ===
        "data structures" ||
        rawCategory === "algorithms" ||
        rawCategory ===
        "operating systems" ||
        rawCategory ===
        "computer networks"
    ) {
        return "Computer Science";
    }

    /* Fallback based on title */

    const combined =
        ` ${title} ${rawCategory} ${description} `;

    if (
        webDevelopmentKeywords.some(
            (keyword) =>
                combined.includes(keyword)
        )
    ) {
        return "Web Development";
    }

    if (
        databaseKeywords.some(
            (keyword) =>
                combined.includes(keyword)
        )
    ) {
        return "Databases";
    }

    if (
        aiMlKeywords.some(
            (keyword) =>
                combined.includes(keyword)
        )
    ) {
        return "AI & ML";
    }

    if (
        computerScienceKeywords.some(
            (keyword) =>
                combined.includes(keyword)
        )
    ) {
        return "Computer Science";
    }

    if (
        programmingKeywords.some(
            (keyword) =>
                combined.includes(keyword)
        )
    ) {
        return "Programming";
    }

    return course.category?.trim() || "";
}

/* =========================================================
   DURATION
========================================================= */

function durationToMinutes(
    duration: string | null | undefined
): number {
    if (!duration) {
        return 0;
    }

    const value =
        duration
            .toLowerCase()
            .trim();

    let totalMinutes = 0;

    const hoursMatch =
        value.match(
            /(\d+(?:\.\d+)?)\s*h/
        );

    const minutesMatch =
        value.match(
            /(\d+(?:\.\d+)?)\s*m/
        );

    const secondsMatch =
        value.match(
            /(\d+(?:\.\d+)?)\s*s/
        );

    if (hoursMatch) {
        totalMinutes +=
            Number(
                hoursMatch[1]
            ) * 60;
    }

    if (minutesMatch) {
        totalMinutes += Number(
            minutesMatch[1]
        );
    }

    if (secondsMatch) {
        totalMinutes +=
            Number(
                secondsMatch[1]
            ) / 60;
    }

    if (
        !hoursMatch &&
        !minutesMatch &&
        !secondsMatch &&
        /^\d+:\d{2}(:\d{2})?$/.test(
            value
        )
    ) {
        const parts =
            value
                .split(":")
                .map(Number);

        if (parts.length === 3) {
            totalMinutes =
                parts[0] * 60 +
                parts[1] +
                parts[2] / 60;
        } else if (
            parts.length === 2
        ) {
            totalMinutes =
                parts[0] +
                parts[1] / 60;
        }
    }

    return totalMinutes;
}

/* =========================================================
   ADMIN PRIORITY
========================================================= */

function getAdminPriority(
    course: Course
): number {
    const featured =
        Boolean(course.featured);

    const recommended =
        Boolean(
            course.adminRecommended
        );

    /*
     * Highest:
     * Featured + Recommended
     */
    if (
        featured &&
        recommended
    ) {
        return 3;
    }

    /*
     * Second:
     * Featured
     */
    if (featured) {
        return 2;
    }

    /*
     * Third:
     * Recommended
     */
    if (recommended) {
        return 1;
    }

    /*
     * Normal
     */
    return 0;
}

/* =========================================================
   FORMAT LARGE NUMBERS
========================================================= */

function formatNumber(
    value: number | null | undefined
): string {
    const number =
        Number(value ?? 0);

    if (number >= 1000000) {
        const formatted =
            number / 1000000;

        return `${formatted
            .toFixed(
                formatted >= 10
                    ? 0
                    : 1
            )
            .replace(
                /\.0$/,
                ""
            )}M`;
    }

    if (number >= 1000) {
        const formatted =
            number / 1000;

        return `${formatted
            .toFixed(
                formatted >= 100
                    ? 0
                    : formatted >= 10
                        ? 1
                        : 1
            )
            .replace(
                /\.0$/,
                ""
            )}K`;
    }

    return number.toLocaleString();
}

/* =========================================================
   PAGE
========================================================= */

export default function CoursesPage() {
    const [courses, setCourses] =
        useState<Course[]>([]);

    const [activeCategory, setActiveCategory] =
        useState("All");

    const [search, setSearch] =
        useState("");

    const [language, setLanguage] =
        useState("English");

    const [showFilters, setShowFilters] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [sortBy, setSortBy] =
        useState("Recommended");

    /* =====================================================
       READ URL
    ===================================================== */

    useEffect(() => {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const urlSearch =
            params.get("q")?.trim() ||
            "";

        const urlLanguage =
            params
                .get("language")
                ?.trim();

        const urlCategory =
            params
                .get("category")
                ?.trim();

        setSearch(urlSearch);

        if (urlLanguage) {
            const matchedLanguage =
                languages.find(
                    (item) =>
                        normalizeLanguage(
                            item.value
                        ) ===
                        normalizeLanguage(
                            urlLanguage
                        )
                );

            if (matchedLanguage) {
                setLanguage(
                    matchedLanguage.value
                );
            }
        }

        if (urlCategory) {
            const normalizedCategory =
                normalizeText(
                    urlCategory
                );

            const matchedCategory =
                categories.find(
                    (category) =>
                        normalizeText(
                            category
                        ) ===
                        normalizedCategory
                );

            if (matchedCategory) {
                setActiveCategory(
                    matchedCategory
                );
            }
        }
    }, []);

    /* =====================================================
       LOAD COURSES
    ===================================================== */

    useEffect(() => {
        async function loadCourses() {
            try {
                setLoading(true);
                setError("");

                const params =
                    new URLSearchParams(
                        window.location.search
                    );

                const query =
                    params.get("q")?.trim() ||
                    "";

                const selectedLanguage =
                    params
                        .get("language")
                        ?.trim() ||
                    "English";

                let response: Response;

                if (query) {
                    const searchParams =
                        new URLSearchParams();

                    searchParams.set(
                        "q",
                        query
                    );

                    searchParams.set(
                        "language",
                        selectedLanguage
                    );

                    response =
                        await fetch(
                            `/api/courses/search?${searchParams.toString()}`,
                            {
                                cache:
                                    "no-store",
                            }
                        );
                } else {
                    const courseParams =
                        new URLSearchParams();

                    courseParams.set(
                        "language",
                        selectedLanguage
                    );

                    response =
                        await fetch(
                            `/api/courses?${courseParams.toString()}`,
                            {
                                cache:
                                    "no-store",
                            }
                        );
                }

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch courses"
                    );
                }

                const data =
                    await response.json();

                let loadedCourses: Course[] =
                    [];

                if (
                    Array.isArray(data)
                ) {
                    loadedCourses =
                        data;
                } else if (
                    Array.isArray(
                        data.courses
                    )
                ) {
                    loadedCourses =
                        data.courses;
                }

                const selected =
                    normalizeLanguage(
                        selectedLanguage
                    );

                loadedCourses =
                    loadedCourses.filter(
                        (course) =>
                            normalizeLanguage(
                                course.language
                            ) === selected
                    );

                setCourses(
                    loadedCourses
                );
            } catch (err) {
                console.error(
                    "Failed to load courses:",
                    err
                );

                setError(
                    "Unable to load courses. Please try again."
                );

                setCourses([]);
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    /* =====================================================
       CATEGORY COUNTS
    ===================================================== */

    const categoryCounts =
        useMemo(() => {
            const counts: Record<
                string,
                number
            > = {
                All: 0,
                Programming: 0,
                "Computer Science": 0,
                "AI & ML": 0,
                "Web Development": 0,
                Databases: 0,
            };

            const selectedLanguage =
                normalizeLanguage(
                    language
                );

            const languageCourses =
                courses.filter(
                    (course) =>
                        normalizeLanguage(
                            course.language
                        ) ===
                        selectedLanguage
                );

            counts.All =
                languageCourses.length;

            for (
                const course of
                languageCourses
            ) {
                const category =
                    getCourseCategory(
                        course
                    );

                if (
                    Object.prototype.hasOwnProperty.call(
                        counts,
                        category
                    )
                ) {
                    counts[category]++;
                }
            }

            return counts;
        }, [
            courses,
            language,
        ]);

    /* =====================================================
       FILTER + SORT
    ===================================================== */

    const filteredCourses =
        useMemo(() => {
            let result =
                [...courses];

            /* LANGUAGE */

            const selectedLanguage =
                normalizeLanguage(
                    language
                );

            result =
                result.filter(
                    (course) =>
                        normalizeLanguage(
                            course.language
                        ) ===
                        selectedLanguage
                );

            /* CATEGORY */

            if (
                activeCategory !==
                "All"
            ) {
                result =
                    result.filter(
                        (course) =>
                            getCourseCategory(
                                course
                            ) ===
                            activeCategory
                    );
            }

            /* SEARCH */

            const searchTerm =
                normalizeText(
                    search
                );

            if (searchTerm) {
                result =
                    result.filter(
                        (course) => {
                            const title =
                                normalizeText(
                                    course.title
                                );

                            const category =
                                normalizeText(
                                    course.category
                                );

                            const description =
                                normalizeText(
                                    course.description
                                );

                            const channel =
                                normalizeText(
                                    course.channelName
                                );

                            return (
                                title.includes(
                                    searchTerm
                                ) ||
                                category.includes(
                                    searchTerm
                                ) ||
                                description.includes(
                                    searchTerm
                                ) ||
                                channel.includes(
                                    searchTerm
                                )
                            );
                        }
                    );
            }

            /* =================================================
               ADMIN PRIORITY FIRST
            ================================================= */

            result.sort(
                (a, b) => {
                    const priorityA =
                        getAdminPriority(
                            a
                        );

                    const priorityB =
                        getAdminPriority(
                            b
                        );

                    if (
                        priorityA !==
                        priorityB
                    ) {
                        return (
                            priorityB -
                            priorityA
                        );
                    }

                    /* Selected sorting */

                    if (
                        sortBy ===
                        "Recommended"
                    ) {
                        return (
                            Number(
                                b.recommendationScore ??
                                0
                            ) -
                            Number(
                                a.recommendationScore ??
                                0
                            )
                        );
                    }

                    if (
                        sortBy ===
                        "Most liked"
                    ) {
                        return (
                            Number(
                                b.likes ??
                                0
                            ) -
                            Number(
                                a.likes ??
                                0
                            )
                        );
                    }

                    if (
                        sortBy ===
                        "Most popular"
                    ) {
                        return (
                            Number(
                                b.views ??
                                0
                            ) -
                            Number(
                                a.views ??
                                0
                            )
                        );
                    }

                    if (
                        sortBy ===
                        "Shortest"
                    ) {
                        return (
                            durationToMinutes(
                                a.duration
                            ) -
                            durationToMinutes(
                                b.duration
                            )
                        );
                    }

                    return 0;
                }
            );

            return result;
        }, [
            courses,
            activeCategory,
            search,
            language,
            sortBy,
        ]);

    /* =====================================================
       CATEGORY CHANGE
    ===================================================== */

    function handleCategoryChange(
        category: string
    ) {
        setActiveCategory(
            category
        );

        const params =
            new URLSearchParams();

        if (search.trim()) {
            params.set(
                "q",
                search.trim()
            );
        }

        params.set(
            "language",
            language
        );

        if (
            category !==
            "All"
        ) {
            params.set(
                "category",
                category
            );
        }

        const queryString =
            params.toString();

        window.history.replaceState(
            null,
            "",
            `/courses${queryString
                ? `?${queryString}`
                : ""
            }`
        );

        setShowFilters(false);
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    function handleSearchSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const query =
            search.trim();

        const params =
            new URLSearchParams();

        if (query) {
            params.set(
                "q",
                query
            );
        }

        params.set(
            "language",
            language
        );

        if (
            activeCategory !==
            "All"
        ) {
            params.set(
                "category",
                activeCategory
            );
        }

        const queryString =
            params.toString();

        window.location.href =
            `/courses?${queryString}`;
    }

    /* =====================================================
       LANGUAGE CHANGE
    ===================================================== */

    function handleLanguageChange(
        newLanguage: string
    ) {
        const params =
            new URLSearchParams();

        if (search.trim()) {
            params.set(
                "q",
                search.trim()
            );
        }

        params.set(
            "language",
            newLanguage
        );

        if (
            activeCategory !==
            "All"
        ) {
            params.set(
                "category",
                activeCategory
            );
        }

        window.location.href =
            `/courses?${params.toString()}`;
    }

    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {
        const params =
            new URLSearchParams();

        params.set(
            "language",
            language
        );

        if (
            activeCategory !==
            "All"
        ) {
            params.set(
                "category",
                activeCategory
            );
        }

        window.location.href =
            `/courses?${params.toString()}`;
    }

    /* =====================================================
       RESET
    ===================================================== */

    function resetFilters() {
        window.location.href =
            `/courses?language=${encodeURIComponent(
                language
            )}`;
    }

    /* =====================================================
       COURSE CARD
    ===================================================== */

    function CourseCard({
        course,
    }: {
        course: Course;
    }) {
        const displayCategory =
            getCourseCategory(
                course
            );

        const isFeatured =
            Boolean(
                course.featured
            );

        const isRecommended =
            Boolean(
                course.adminRecommended
            );

        const isPriority =
            isFeatured ||
            isRecommended;

        return (
            <article
                className={`
                    group overflow-hidden rounded-2xl border
                    bg-white transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                    dark:bg-zinc-900
                    ${isFeatured &&
                        isRecommended
                        ? "border-amber-300 shadow-md shadow-amber-500/10 dark:border-amber-700"
                        : isFeatured
                            ? "border-amber-200 dark:border-amber-800"
                            : isRecommended
                                ? "border-indigo-200 dark:border-indigo-800"
                                : "border-zinc-200 dark:border-zinc-800"
                    }
                `}
            >

                {/* =================================================
                   THUMBNAIL
                ================================================= */}

                <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">

                    {course.thumbnailUrl ? (
                        <img
                            src={
                                course.thumbnailUrl
                            }
                            alt={
                                course.title
                            }
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400">
                                <BookOpen
                                    size={26}
                                />
                            </div>
                        </div>
                    )}

                    {/* Image overlay */}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

                    {/* =================================================
                       STATUS BADGE
                    ================================================= */}

                    {isPriority && (
                        <div className="absolute left-3 top-3">

                            {isFeatured ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-md backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:text-amber-400">

                                    <Star
                                        size={12}
                                        fill="currentColor"
                                    />

                                    Featured

                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">

                                    <Sparkles
                                        size={12}
                                    />

                                    Recommended

                                </span>
                            )}

                        </div>
                    )}

                    {/* Language */}

                    <div className="absolute right-3 top-3">

                        <span className="rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                            {
                                course.language ||
                                "English"
                            }
                        </span>

                    </div>

                    {/* Both indicator */}

                    {isFeatured &&
                        isRecommended && (
                            <div className="absolute bottom-3 left-3">

                                <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">

                                    <Sparkles
                                        size={10}
                                    />

                                    Recommended

                                </span>

                            </div>
                        )}

                </div>

                {/* =================================================
                   CARD CONTENT
                ================================================= */}

                <div className="p-5">

                    {/* Category + Level */}

                    <div className="flex items-center justify-between gap-3">

                        <span className="truncate text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {
                                displayCategory
                            }
                        </span>

                        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {
                                course.level
                            }
                        </span>

                    </div>

                    {/* Title */}

                    <h3 className="mt-3 line-clamp-2 min-h-[48px] text-[17px] font-bold leading-6 tracking-tight text-zinc-950 dark:text-white">
                        {
                            course.title
                        }
                    </h3>

                    {/* Description */}

                    <p className="mt-2 line-clamp-2 min-h-[44px] text-sm leading-[22px] text-zinc-500 dark:text-zinc-400">
                        {
                            course.description
                        }
                    </p>

                    {/* =================================================
                       YOUTUBE CHANNEL
                    ================================================= */}

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">

                        {/* YouTube icon */}

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">

                            <svg
                                viewBox="0 0 24 24"
                                className="h-[18px] w-[18px] fill-current"
                                aria-hidden="true"
                            >
                                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z" />
                            </svg>

                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                YouTube Channel
                            </p>

                            <p
                                className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                                title={
                                    course.channelName ||
                                    "YouTube"
                                }
                            >
                                {
                                    course.channelName ||
                                    "YouTube"
                                }
                            </p>

                        </div>

                    </div>

                    {/* =================================================
                       LESSONS + DURATION
                    ================================================= */}

                    <div className="mt-4 flex items-center justify-between">

                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">

                            <BookOpen
                                size={14}
                                className="text-zinc-400"
                            />

                            <span>
                                {
                                    course.lessonsCount
                                }{" "}
                                lessons
                            </span>

                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">

                            <Clock3
                                size={14}
                                className="text-zinc-400"
                            />

                            <span>
                                {
                                    course.duration
                                }
                            </span>

                        </div>

                    </div>

                    {/* =================================================
                       STATS
                    ================================================= */}

                    <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">

                        <div className="flex items-center justify-between">

                            {/* Likes */}

                            <div className="flex items-center gap-2">

                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400">

                                    <ThumbsUp
                                        size={14}
                                    />

                                </div>

                                <div className="flex flex-row gap-x-[3px]">

                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                        {formatNumber(
                                            course.likes
                                        )}
                                    </p>

                                    <p className="text-[10px] text-zinc-400">
                                        likes
                                    </p>

                                </div>

                            </div>

                            {/* Views */}

                            <div className="flex items-center gap-2">

                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">

                                    <span className="text-xs font-bold">
                                        ▶
                                    </span>

                                </div>

                                <div className="flex flex-row gap-x-[3px]">

                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                        {formatNumber(
                                            course.views
                                        )}
                                    </p>

                                    <p className="text-[10px] text-zinc-400">
                                        views
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                       BUTTON
                    ================================================= */}

                    <Link
                        href={`/courses/${course.slug}`}
                        className={`
                            mt-5 flex h-11 items-center
                            justify-center gap-2 rounded-xl
                            text-sm font-semibold
                            transition-all
                            ${isFeatured
                                ? "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                : isRecommended
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                    : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            }
                        `}
                    >
                        View course

                        <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                        />

                    </Link>

                </div>
            </article>
        );
    }

    /* =========================================================
       PAGE
    ========================================================= */

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">

            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

                {/* =================================================
                   HEADER
                ================================================= */}

                <div>

                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                        Course Discovery
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                        Find something worth learning.
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-base">
                        Explore carefully selected
                        courses and find the right
                        learning path for your goals.
                    </p>

                </div>

                {/* =================================================
                   SEARCH
                ================================================= */}

                <form
                    onSubmit={
                        handleSearchSubmit
                    }
                    className="mt-7 flex flex-col gap-3 sm:flex-row"
                >

                    <div className="flex h-12 flex-1 items-center rounded-xl border border-zinc-200 bg-white px-4 shadow-sm transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900">

                        <Search
                            size={18}
                            className="shrink-0 text-zinc-400"
                        />

                        <input
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search Python, Java, C++, React, SQL..."
                            className="ml-3 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={
                                    clearSearch
                                }
                                className="text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
                                aria-label="Clear search"
                            >
                                <X
                                    size={17}
                                />
                            </button>
                        )}

                    </div>

                    <button
                        type="submit"
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >

                        <Search
                            size={17}
                        />

                        Search

                    </button>

                </form>

                {/* =================================================
                   LANGUAGE
                ================================================= */}

                <div className="mt-5 flex flex-wrap items-center gap-3">

                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Preferred language:
                    </span>

                    <div className="flex flex-wrap gap-2">

                        {languages.map(
                            (item) => (
                                <button
                                    key={
                                        item.value
                                    }
                                    type="button"
                                    onClick={() =>
                                        handleLanguageChange(
                                            item.value
                                        )
                                    }
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${language ===
                                            item.value
                                            ? "border-indigo-600 bg-indigo-600 text-white"
                                            : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                                        }`}
                                >
                                    {
                                        item.label
                                    }
                                </button>
                            )
                        )}

                    </div>

                </div>

                {/* =================================================
                   ACTIVE FILTERS
                ================================================= */}

                {(search.trim() ||
                    activeCategory !==
                    "All") && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">

                            {search.trim() && (
                                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                    Search: "
                                    {
                                        search.trim()
                                    }
                                    "
                                </span>
                            )}

                            {activeCategory !==
                                "All" && (
                                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                        {
                                            activeCategory
                                        }
                                    </span>
                                )}

                        </div>
                    )}

                {/* =================================================
                   ERROR
                ================================================= */}

                {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* =================================================
                   MOBILE FILTER
                ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        setShowFilters(
                            (previous) =>
                                !previous
                        )
                    }
                    className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 lg:hidden"
                >

                    {showFilters
                        ? "Hide filters"
                        : "Show filters"}

                    {activeCategory !==
                        "All" && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                                1
                            </span>
                        )}

                </button>

                {/* =================================================
                   MAIN
                ================================================= */}

                <div className="mt-7 grid gap-7 lg:grid-cols-[220px_1fr]">

                    {/* =================================================
                       SIDEBAR
                    ================================================= */}

                    <aside
                        className={`${showFilters
                                ? "block"
                                : "hidden"
                            } lg:block`}
                    >

                        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

                            <div className="flex items-center justify-between">

                                <h2 className="font-semibold">
                                    Filters
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters(
                                            false
                                        )
                                    }
                                    className="text-zinc-400 lg:hidden"
                                >
                                    <X
                                        size={17}
                                    />
                                </button>

                            </div>

                            <div className="mt-6">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                    Category
                                </p>

                                <div className="mt-3 space-y-1">

                                    {categories.map(
                                        (
                                            category
                                        ) => {
                                            const active =
                                                activeCategory ===
                                                category;

                                            return (
                                                <button
                                                    key={
                                                        category
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleCategoryChange(
                                                            category
                                                        )
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${active
                                                            ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                            : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                        }`}
                                                >

                                                    <span className="flex items-center gap-2">

                                                        {
                                                            category
                                                        }

                                                        <span className="text-xs text-zinc-400">
                                                            {
                                                                categoryCounts[
                                                                category
                                                                ]
                                                            }
                                                        </span>

                                                    </span>

                                                    {active && (
                                                        <CheckCircle2
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    )}

                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                            {(activeCategory !==
                                "All" ||
                                search.trim()) && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="mt-5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Reset filters
                                    </button>
                                )}

                        </div>

                    </aside>

                    {/* =================================================
                       RESULTS
                    ================================================= */}

                    <section>

                        {/* Toolbar */}

                        <div className="flex items-center justify-between gap-4">

                            <p className="text-sm text-zinc-500 dark:text-zinc-400">

                                <span className="font-bold text-zinc-900 dark:text-white">
                                    {
                                        filteredCourses.length
                                    }
                                </span>{" "}
                                courses found

                            </p>

                            <select
                                value={
                                    sortBy
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSortBy(
                                        event.target
                                            .value
                                    )
                                }
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                            >

                                <option>
                                    Recommended
                                </option>

                                <option>
                                    Most liked
                                </option>

                                <option>
                                    Most popular
                                </option>

                                <option>
                                    Shortest
                                </option>

                            </select>

                        </div>

                        {/* Loading */}

                        {loading && (
                            <div className="mt-5">
                                <LogoLoader />
                            </div>
                        )}

                        {/* =================================================
                           SINGLE GRID
                        ================================================= */}

                        {!loading &&
                            filteredCourses.length >
                            0 && (
                                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

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
                                <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">

                                        <Search
                                            size={22}
                                        />

                                    </div>

                                    <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                                        No courses found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                        No{" "}
                                        {
                                            language
                                        }{" "}
                                        courses match
                                        your current
                                        search and
                                        filters.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="mt-5 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                    >
                                        Reset filters
                                    </button>

                                </div>
                            )}

                    </section>

                </div>

            </div>

        </main>
    );
}