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

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);

    const [activeCategory, setActiveCategory] =
        useState("All");

    const [search, setSearch] = useState("");

    const [language, setLanguage] = useState("English");

    const [showFilters, setShowFilters] = useState(false);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sortBy, setSortBy] = useState("Recommended");

    /*
     * =====================================================
     * NORMALIZE LANGUAGE
     * =====================================================
     */

    function normalizeLanguage(
        value: string | null | undefined
    ): string {
        return value?.trim().toLowerCase() || "";
    }

    /*
     * =====================================================
     * GET INITIAL VALUES FROM URL
     * =====================================================
     */

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const urlSearch =
            params.get("q")?.trim() || "";

        const urlLanguage =
            params.get("language")?.trim();

        setSearch(urlSearch);

        if (urlLanguage) {
            const matchedLanguage = languages.find(
                (item) =>
                    normalizeLanguage(item.value) ===
                    normalizeLanguage(urlLanguage)
            );

            if (matchedLanguage) {
                setLanguage(matchedLanguage.value);
            }
        }
    }, []);

    /*
     * =====================================================
     * LOAD COURSES
     * =====================================================
     */

    useEffect(() => {
        async function loadCourses() {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams(
                    window.location.search
                );

                const query =
                    params.get("q")?.trim() || "";

                const selectedLanguage =
                    params.get("language")?.trim() ||
                    "English";

                let response: Response;

                /*
                 * SEARCH API
                 */

                if (query) {
                    const searchParams =
                        new URLSearchParams();

                    searchParams.set("q", query);

                    searchParams.set(
                        "language",
                        selectedLanguage
                    );

                    response = await fetch(
                        `/api/courses/search?${searchParams.toString()}`,
                        {
                            cache: "no-store",
                        }
                    );
                }

                /*
                 * NORMAL COURSE LIST
                 */

                else {
                    const courseParams =
                        new URLSearchParams();

                    courseParams.set(
                        "language",
                        selectedLanguage
                    );

                    response = await fetch(
                        `/api/courses?${courseParams.toString()}`,
                        {
                            cache: "no-store",
                        }
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch courses"
                    );
                }

                const data = await response.json();

                let loadedCourses: Course[] = [];

                if (Array.isArray(data)) {
                    loadedCourses = data;
                } else if (
                    Array.isArray(data.courses)
                ) {
                    loadedCourses = data.courses;
                }

                /*
                 * =================================================
                 * HARD LANGUAGE FILTER
                 *
                 * Never allow a different language
                 * to reach the UI.
                 * =================================================
                 */

                const normalizedSelectedLanguage =
                    normalizeLanguage(selectedLanguage);

                loadedCourses =
                    loadedCourses.filter(
                        (course) =>
                            normalizeLanguage(
                                course.language
                            ) ===
                            normalizedSelectedLanguage
                    );

                console.log(
                    "Selected language:",
                    selectedLanguage
                );

                console.log(
                    "Courses after frontend language filter:",
                    loadedCourses.length
                );

                setCourses(loadedCourses);
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

    /*
     * =====================================================
     * FILTER + SORT
     * =====================================================
     */

    const filteredCourses = useMemo(() => {
        let result = [...courses];

        /*
         * LANGUAGE HARD FILTER
         */

        const preferredLanguage =
            normalizeLanguage(language);

        result = result.filter(
            (course) =>
                normalizeLanguage(course.language) ===
                preferredLanguage
        );

        /*
         * CATEGORY FILTER
         */

        if (activeCategory !== "All") {
            result = result.filter((course) =>
                course.category
                    ?.toLowerCase()
                    .includes(
                        activeCategory.toLowerCase()
                    )
            );
        }

        /*
         * LOCAL SEARCH
         */

        const searchTerm = search
            .trim()
            .toLowerCase();

        if (searchTerm) {
            result = result.filter((course) => {
                const title =
                    course.title?.toLowerCase() || "";

                const category =
                    course.category?.toLowerCase() || "";

                const description =
                    course.description?.toLowerCase() ||
                    "";

                return (
                    title.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    description.includes(searchTerm)
                );
            });
        }

        /*
         * SORT
         */

        result.sort((a, b) => {
            /*
             * RECOMMENDED
             */

            if (sortBy === "Recommended") {
                return (
                    (b.recommendationScore ?? 0) -
                    (a.recommendationScore ?? 0)
                );
            }

            /*
             * HIGHEST RATED
             */

            if (sortBy === "Highest rated") {
                return (
                    Number(b.rating ?? 0) -
                    Number(a.rating ?? 0)
                );
            }

            /*
             * MOST POPULAR
             */

            if (sortBy === "Most popular") {
                const getStudentCount = (
                    value: string | null
                ) => {
                    if (!value) return 0;

                    const cleaned =
                        value.replace(
                            /[^0-9.]/g,
                            ""
                        );

                    return Number(cleaned) || 0;
                };

                return (
                    getStudentCount(b.students) -
                    getStudentCount(a.students)
                );
            }

            /*
             * SHORTEST
             */

            if (sortBy === "Shortest") {
                const getMinutes = (
                    duration: string
                ) => {
                    if (!duration) return 0;

                    const hoursMatch =
                        duration.match(
                            /(\d+)\s*h/i
                        );

                    const minutesMatch =
                        duration.match(
                            /(\d+)\s*m/i
                        );

                    const hours = Number(
                        hoursMatch?.[1] || 0
                    );

                    const minutes = Number(
                        minutesMatch?.[1] || 0
                    );

                    return (
                        hours * 60 + minutes
                    );
                };

                return (
                    getMinutes(a.duration) -
                    getMinutes(b.duration)
                );
            }

            return 0;
        });

        return result;
    }, [
        courses,
        activeCategory,
        search,
        language,
        sortBy,
    ]);

    /*
     * =====================================================
     * PERFORM SEARCH
     * =====================================================
     */

    function handleSearchSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const query = search.trim();

        if (!query) {
            window.location.href =
                `/courses?language=${encodeURIComponent(
                    language
                )}`;

            return;
        }

        window.location.href =
            `/courses?q=${encodeURIComponent(
                query
            )}&language=${encodeURIComponent(
                language
            )}`;
    }

    /*
     * =====================================================
     * CHANGE LANGUAGE
     * =====================================================
     */

    function handleLanguageChange(
        newLanguage: string
    ) {
        setLanguage(newLanguage);

        const query = search.trim();

        if (query) {
            window.location.href =
                `/courses?q=${encodeURIComponent(
                    query
                )}&language=${encodeURIComponent(
                    newLanguage
                )}`;
        } else {
            window.location.href =
                `/courses?language=${encodeURIComponent(
                    newLanguage
                )}`;
        }
    }

    /*
     * =====================================================
     * CLEAR SEARCH
     * =====================================================
     */

    function clearSearch() {
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
                        Explore carefully selected courses
                        and find the right learning path
                        for your goals.
                    </p>
                </div>

                {/* =================================================
                    SEARCH
                ================================================= */}

                <form
                    onSubmit={handleSearchSubmit}
                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                    <div className="flex h-12 flex-1 items-center rounded-xl border border-zinc-200 bg-white px-4 shadow-sm transition focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
                        <Search
                            size={19}
                            className="shrink-0 text-zinc-400"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search Python, Java, C++, React, SQL..."
                            className="ml-3 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mr-2 text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
                                aria-label="Clear search"
                            >
                                <X size={17} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                        <Search size={17} />
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
                            {languages.map((item) => (
                                <button
                                    key={item.value}
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
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* =================================================
                    SEARCH STATUS
                ================================================= */}

                {(search.trim() || language) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {search.trim() && (
                            <>
                                <Search size={15} />

                                <span>
                                    Results for{" "}
                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                        "{search.trim()}"
                                    </span>
                                </span>
                            </>
                        )}

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            Preferred: {language}
                        </span>
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
                    MAIN CONTENT
                ================================================= */}

                <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
                    {/* =================================================
                        FILTERS
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
                                    className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white lg:hidden"
                                    aria-label="Close filters"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            <div className="mt-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Category
                                </p>

                                <div className="mt-3 space-y-1">
                                    {categories.map(
                                        (category) => (
                                            <button
                                                key={
                                                    category
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setActiveCategory(
                                                        category
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                    activeCategory ===
                                                    category
                                                        ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                }`}
                                            >
                                                {category}

                                                {activeCategory ===
                                                    category && (
                                                    <CheckCircle2
                                                        size={
                                                            15
                                                        }
                                                    />
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
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
                            </p>

                            <select
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value
                                    )
                                }
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 outline-none transition focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
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

                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading && (
                            <div className="mt-5">
                                <LogoLoader />
                            </div>
                        )}

                        {/* =================================================
                            COURSE GRID
                        ================================================= */}

                        {!loading &&
                            filteredCourses.length >
                                0 && (
                                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredCourses.map(
                                        (course) => (
                                            <article
                                                key={
                                                    course.id
                                                }
                                                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-2xl"
                                            >
                                                {/* COURSE IMAGE */}

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
                                                                        23
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* RECOMMENDED */}

                                                    {course.adminRecommended && (
                                                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                                                            Recommended
                                                        </span>
                                                    )}

                                                    {/* LANGUAGE */}

                                                    <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                        {course.language ||
                                                            "Unknown"}
                                                    </span>
                                                </div>

                                                {/* COURSE CONTENT */}

                                                <div className="p-5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                            {
                                                                course.category
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
                                                        View course

                                                        <ArrowRight
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </Link>
                                                </div>
                                            </article>
                                        )
                                    )}
                                </div>
                            )}

                        {/* =================================================
                            EMPTY STATE
                        ================================================= */}

                        {!loading &&
                            filteredCourses.length ===
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
                                        No{" "}
                                        {language}{" "}
                                        courses are
                                        available for this
                                        search.
                                    </p>

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={
                                                clearSearch
                                            }
                                            className="mt-5 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}
                    </section>
                </div>
            </div>
        </main>
    );
}