"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Search,
    Star,
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
    source: string | null;
    featured: boolean | null;

    recommendationScore?: number | null;
    adminRecommended?: boolean | null;

    thumbnailUrl?: string | null;
    youtubeUrl?: string | null;

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
   NORMALIZE TEXT
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

/* =========================================================
   NORMALIZE LANGUAGE
========================================================= */

function normalizeLanguage(
    value: string | null | undefined
): string {
    return normalizeText(value);
}

/* =========================================================
   COURSE SUBJECT KEYWORDS
========================================================= */

const programmingKeywords = [
    "python",
    "java",
    " c ",
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
    "ml ",
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

   IMPORTANT:
   The database currently may contain:

   Python
   Java
   C++
   React
   SQL
   etc.

   But the UI has only:

   Programming
   Computer Science
   AI & ML
   Web Development
   Databases

   This function converts both old and new values
   into the correct UI category.
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

    /*
     * First handle categories that are already
     * canonical.
     */

    if (
        rawCategory ===
        "programming"
    ) {
        return "Programming";
    }

    if (
        rawCategory ===
        "computer science"
    ) {
        return "Computer Science";
    }

    if (
        rawCategory ===
        "ai ml" ||
        rawCategory ===
        "ai and ml" ||
        rawCategory ===
        "artificial intelligence and machine learning"
    ) {
        return "AI & ML";
    }

    if (
        rawCategory ===
        "web development"
    ) {
        return "Web Development";
    }

    if (
        rawCategory ===
        "databases" ||
        rawCategory ===
        "database"
    ) {
        return "Databases";
    }

    /*
     * =====================================================
     * OLD DATABASE CATEGORY VALUES
     * =====================================================
     */

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
        rawCategory === "programming languages" ||
        rawCategory === "coding"
    ) {
        return "Programming";
    }

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

    /*
     * =====================================================
     * TITLE-BASED FALLBACK
     *
     * This is important for YouTube courses because
     * some existing records may have an unexpected
     * category value.
     * =====================================================
     */

    const combined =
        ` ${title} ${rawCategory} ${description} `;

    /*
     * Web-specific technologies are checked before
     * generic programming so React/Node/MERN are
     * classified correctly.
     */

    if (
        webDevelopmentKeywords.some(
            (keyword) =>
                combined.includes(
                    keyword
                )
        )
    ) {
        return "Web Development";
    }

    /*
     * Databases.
     */

    if (
        databaseKeywords.some(
            (keyword) =>
                combined.includes(
                    keyword
                )
        )
    ) {
        return "Databases";
    }

    /*
     * AI / ML.
     */

    if (
        aiMlKeywords.some(
            (keyword) =>
                combined.includes(
                    keyword
                )
        )
    ) {
        return "AI & ML";
    }

    /*
     * Computer Science.
     */

    if (
        computerScienceKeywords.some(
            (keyword) =>
                combined.includes(
                    keyword
                )
        )
    ) {
        return "Computer Science";
    }

    /*
     * Programming.
     */

    if (
        programmingKeywords.some(
            (keyword) =>
                combined.includes(
                    keyword
                )
        )
    ) {
        return "Programming";
    }

    /*
     * Unknown category.
     */

    return course.category?.trim() || "";
}

/* =========================================================
   DURATION TO MINUTES
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

    /*
     * HH:MM:SS
     */

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
   STUDENT COUNT
========================================================= */

function parseStudentCount(
    value: string | null | undefined
): number {
    if (!value) {
        return 0;
    }

    const normalized =
        value
            .toLowerCase()
            .replace(/,/g, "")
            .trim();

    const match =
        normalized.match(
            /(\d+(?:\.\d+)?)\s*([km])?/
        );

    if (!match) {
        return 0;
    }

    const number =
        Number(match[1]);

    if (
        match[2] === "k"
    ) {
        return number * 1000;
    }

    if (
        match[2] === "m"
    ) {
        return number * 1000000;
    }

    return number;
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
            params.get(
                "language"
            )?.trim();

        const urlCategory =
            params.get(
                "category"
            )?.trim();

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
                    params.get(
                        "language"
                    )?.trim() ||
                    "English";

                let response: Response;

                /*
                 * SEARCH API
                 */

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
                }

                /*
                 * NORMAL COURSE API
                 */

                else {
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

                /*
                 * HARD LANGUAGE FILTER
                 */

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

            /*
             * LANGUAGE
             */

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

            /*
             * CATEGORY
             *
             * IMPORTANT:
             * We compare getCourseCategory(course)
             * instead of course.category directly.
             *
             * Therefore:
             *
             * Python -> Programming
             * Java -> Programming
             * C++ -> Programming
             * React -> Web Development
             * SQL -> Databases
             */

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

            /*
             * SEARCH
             */

            const searchTerm =
                search
                    .trim()
                    .toLowerCase();

            if (searchTerm) {
                result =
                    result.filter(
                        (course) => {
                            const title =
                                (
                                    course.title ||
                                    ""
                                ).toLowerCase();

                            const category =
                                (
                                    course.category ||
                                    ""
                                ).toLowerCase();

                            const description =
                                (
                                    course.description ||
                                    ""
                                ).toLowerCase();

                            return (
                                title.includes(
                                    searchTerm
                                ) ||
                                category.includes(
                                    searchTerm
                                ) ||
                                description.includes(
                                    searchTerm
                                )
                            );
                        }
                    );
            }

            /*
             * SORT
             */

            result.sort(
                (a, b) => {
                    if (
                        sortBy ===
                        "Recommended"
                    ) {
                        return (
                            (
                                b.recommendationScore ??
                                0
                            ) -
                            (
                                a.recommendationScore ??
                                0
                            )
                        );
                    }

                    if (
                        sortBy ===
                        "Highest rated"
                    ) {
                        return (
                            Number(
                                b.rating ??
                                    0
                            ) -
                            Number(
                                a.rating ??
                                    0
                            )
                        );
                    }

                    if (
                        sortBy ===
                        "Most popular"
                    ) {
                        return (
                            parseStudentCount(
                                b.students
                            ) -
                            parseStudentCount(
                                a.students
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
            `/courses${
                queryString
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
        event: React.FormEvent<HTMLFormElement>
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
        setLanguage(
            newLanguage
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
        setSearch("");

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
       RESET FILTERS
    ===================================================== */

    function resetFilters() {
        setActiveCategory(
            "All"
        );

        setSearch("");

        window.location.href =
            `/courses?language=${encodeURIComponent(
                language
            )}`;
    }

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-10">
                {/* =================================================
                    HEADER
                ================================================= */}

                <div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        COURSE DISCOVERY
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                        Find something worth learning.
                    </h1>

                    <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
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
                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                    <div className="flex h-12 flex-1 items-center rounded-xl border border-zinc-200 bg-white px-4 shadow-sm transition focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
                        <Search
                            size={19}
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
                                className="mr-2 text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
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

                    <button
                        type="submit"
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
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

                <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-3">
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
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                            language ===
                                            item.value
                                                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                                : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
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
                </div>

                {/* =================================================
                    ACTIVE FILTER STATUS
                ================================================= */}

                {(search.trim() ||
                    activeCategory !==
                        "All") && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {search.trim() && (
                            <>
                                <Search
                                    size={
                                        15
                                    }
                                />

                                <span>
                                    Results for{" "}
                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                        "{search.trim()}"
                                    </span>
                                </span>
                            </>
                        )}

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            Preferred:{" "}
                            {language}
                        </span>

                        {activeCategory !==
                            "All" && (
                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                                Category:{" "}
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
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
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
                    className="mt-6 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 lg:hidden"
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
                    CONTENT
                ================================================= */}

                <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside
                        className={`${
                            showFilters
                                ? "block"
                                : "hidden"
                        } lg:block`}
                    >
                        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-zinc-900 dark:text-white">
                                    Filters
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters(
                                            false
                                        )
                                    }
                                    className="text-zinc-500 lg:hidden"
                                >
                                    <X
                                        size={
                                            17
                                        }
                                    />
                                </button>
                            </div>

                            {/* CATEGORY */}

                            <div className="mt-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Category
                                </p>

                                <div className="mt-3 space-y-1">
                                    {categories.map(
                                        (
                                            category
                                        ) => {
                                            const isActive =
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
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                        isActive
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

                                                    {isActive && (
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
                                    className="mt-5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-900 dark:text-white">
                                    {
                                        filteredCourses.length
                                    }
                                </span>{" "}
                                courses found

                                {activeCategory !==
                                    "All" && (
                                    <>
                                        {" "}
                                        in{" "}
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {
                                                activeCategory
                                            }
                                        </span>
                                    </>
                                )}
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
                                    Highest rated
                                </option>

                                <option>
                                    Most popular
                                </option>

                                <option>
                                    Shortest
                                </option>
                            </select>
                        </div>

                        {/* LOADING */}

                        {loading && (
                            <div className="mt-5">
                                <LogoLoader />
                            </div>
                        )}

                        {/* COURSE GRID */}

                        {!loading &&
                            filteredCourses.length >
                                0 && (
                                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredCourses.map(
                                        (
                                            course
                                        ) => {
                                            const displayCategory =
                                                getCourseCategory(
                                                    course
                                                );

                                            return (
                                                <article
                                                    key={
                                                        course.id
                                                    }
                                                    className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                                                >
                                                    {/* IMAGE */}

                                                    <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                        {course.thumbnailUrl ? (
                                                            <img
                                                                src={
                                                                    course.thumbnailUrl
                                                                }
                                                                alt={
                                                                    course.title
                                                                }
                                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400">
                                                                    <BookOpen
                                                                        size={
                                                                            26
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* CATEGORY */}

                                                        <div className="absolute left-3 top-3">
                                                            <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                                                                {
                                                                    displayCategory
                                                                }
                                                            </span>
                                                        </div>

                                                        {/* LANGUAGE */}

                                                        <div className="absolute right-3 top-3">
                                                            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-200">
                                                                {
                                                                    course.language
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* CONTENT */}

                                                    <div className="p-5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                                {
                                                                    displayCategory
                                                                }
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-zinc-400">
                                                                    {
                                                                        course.level
                                                                    }
                                                                </span>

                                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                                    {course.language ||
                                                                        "Unknown"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <h3 className="mt-3 line-clamp-2 font-bold text-zinc-950 dark:text-white">
                                                            {
                                                                course.title
                                                            }
                                                        </h3>

                                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                                            {
                                                                course.description
                                                            }
                                                        </p>

                                                        {/* META */}

                                                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                                                            <div className="flex items-center gap-1">
                                                                <BookOpen
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                <span>
                                                                    {
                                                                        course.lessonsCount
                                                                    }{" "}
                                                                    lessons
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Clock3
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                <span>
                                                                    {
                                                                        course.duration
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* RATING */}

                                                        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Star
                                                                    size={
                                                                        14
                                                                    }
                                                                    fill="currentColor"
                                                                    className="text-amber-500"
                                                                />

                                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                    {course.rating ??
                                                                        "0"}
                                                                </span>

                                                                <span className="text-zinc-400">
                                                                    (
                                                                    {course.students ??
                                                                        "0"}
                                                                    )
                                                                </span>
                                                            </div>

                                                            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                                                {course.source ||
                                                                    "YouTube"}
                                                            </span>
                                                        </div>

                                                        {/* BUTTON */}

                                                        <Link
                                                            href={`/courses/${course.slug}`}
                                                            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                                        >
                                                            View
                                                            course

                                                            <ArrowRight
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                        {/* EMPTY */}

                        {!loading &&
                            filteredCourses.length ===
                                0 && (
                                <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
                                    <Search
                                        size={
                                            30
                                        }
                                        className="mx-auto text-zinc-300 dark:text-zinc-600"
                                    />

                                    <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                                        No courses found
                                    </h3>

                                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        No{" "}
                                        {
                                            language
                                        }{" "}
                                        courses are
                                        available
                                        {activeCategory !==
                                            "All" &&
                                            ` in ${activeCategory}`}
                                        {search &&
                                            ` for "${search}"`}
                                        .
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="mt-5 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
                                    >
                                        Reset
                                        filters
                                    </button>
                                </div>
                            )}
                    </section>
                </div>
            </div>
        </main>
    );
}