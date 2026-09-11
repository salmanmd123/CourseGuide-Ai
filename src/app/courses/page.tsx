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
        totalMinutes +=
            Number(
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

    if (
        featured &&
        recommended
    ) {
        return 3;
    }

    if (featured) {
        return 2;
    }

    if (recommended) {
        return 1;
    }

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
                    group
                    overflow-hidden
                    rounded-[24px]
                    bg-[#e0e5ec]
                    shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    ${
                        isFeatured &&
                        isRecommended
                            ? "ring-1 ring-[orangered]/40"
                            : ""
                    }
                `}
            >

                {/* =================================================
                   THUMBNAIL
                ================================================= */}

                <div className="relative aspect-video overflow-hidden rounded-t-[24px] bg-[#e0e5ec]">

                    {course.thumbnailUrl ? (
                        <img
                            src={
                                course.thumbnailUrl
                            }
                            alt={
                                course.title
                            }
                            loading="lazy"
                            className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-500
                                group-hover:scale-[1.04]
                            "
                        />
                    ) : (
                        <div
                            className="
                                flex
                                h-full
                                items-center
                                justify-center
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-[18px]
                                    bg-[#e0e5ec]
                                    text-[orangered]
                                    shadow-[inset_4px_4px_8px_rgba(163,177,198,0.65),inset_-4px_-4px_8px_rgba(255,255,255,0.85)]
                                "
                            >
                                <BookOpen
                                    size={26}
                                />
                            </div>
                        </div>
                    )}

                    {/* IMAGE OVERLAY */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-black/45
                            via-transparent
                            to-black/10
                        "
                    />

                    {/* STATUS */}

                    {isPriority && (
                        <div className="absolute left-3 top-3">

                            {isFeatured ? (
                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-[#e0e5ec]/95
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        text-[orangered]
                                        shadow-[4px_4px_8px_rgba(0,0,0,0.18),-3px_-3px_8px_rgba(255,255,255,0.55)]
                                        backdrop-blur-sm
                                    "
                                >
                                    <Star
                                        size={12}
                                        fill="currentColor"
                                    />

                                    Featured
                                </span>
                            ) : (
                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-[orangered]
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        text-white
                                        shadow-[4px_4px_8px_rgba(0,0,0,0.22)]
                                    "
                                >
                                    <Sparkles
                                        size={12}
                                    />

                                    Recommended
                                </span>
                            )}

                        </div>
                    )}

                    {/* LANGUAGE */}

                    <div className="absolute right-3 top-3">

                        <span
                            className="
                                rounded-full
                                bg-black/50
                                px-2.5
                                py-1
                                text-[11px]
                                font-semibold
                                text-white
                                backdrop-blur-md
                            "
                        >
                            {
                                course.language ||
                                "English"
                            }
                        </span>

                    </div>

                    {/* BOTH INDICATOR */}

                    {isFeatured &&
                        isRecommended && (
                            <div className="absolute bottom-3 left-3">

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-full
                                        bg-black/55
                                        px-2.5
                                        py-1
                                        text-[10px]
                                        font-semibold
                                        text-white
                                        backdrop-blur-md
                                    "
                                >
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

                    {/* CATEGORY + LEVEL */}

                    <div className="flex items-center justify-between gap-3">

                        <span
                            className="
                                truncate
                                text-xs
                                font-bold
                                text-[orangered]
                            "
                        >
                            {
                                displayCategory
                            }
                        </span>

                        <span
                            className="
                                shrink-0
                                rounded-full
                                bg-[#e0e5ec]
                                px-3
                                py-1
                                text-[10px]
                                font-semibold
                                text-[#3f3e3e]
                                shadow-[inset_2px_2px_5px_rgba(163,177,198,0.55),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]
                            "
                        >
                            {
                                course.level
                            }
                        </span>

                    </div>

                    {/* TITLE */}

                    <h3
                        className="
                            mt-3
                            line-clamp-2
                            min-h-[48px]
                            text-[17px]
                            font-extrabold
                            leading-6
                            tracking-tight
                            text-black
                        "
                    >
                        {
                            course.title
                        }
                    </h3>

                    {/* DESCRIPTION */}

                    <p
                        className="
                            mt-2
                            line-clamp-2
                            min-h-[44px]
                            text-sm
                            leading-[22px]
                            text-[#3f3e3e]
                        "
                    >
                        {
                            course.description
                        }
                    </p>

                    {/* =================================================
                       YOUTUBE CHANNEL
                    ================================================= */}

                    <div
                        className="
                            mt-4
                            flex
                            items-center
                            gap-3
                            rounded-[16px]
                            bg-[#e0e5ec]
                            px-3
                            py-2.5
                            shadow-[inset_3px_3px_6px_rgba(163,177,198,0.55),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                        "
                    >

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[#e0e5ec]
                                text-red-600
                                shadow-[3px_3px_6px_rgba(163,177,198,0.45),-3px_-3px_6px_rgba(255,255,255,0.75)]
                            "
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-[18px] w-[18px] fill-current"
                                aria-hidden="true"
                            >
                                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z" />
                            </svg>
                        </div>

                        <div className="min-w-0 flex-1">

                            <p
                                className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-[#3f3e3e]
                                    opacity-70
                                "
                            >
                                YouTube Channel
                            </p>

                            <p
                                className="
                                    truncate
                                    text-sm
                                    font-bold
                                    text-black
                                "
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

                    <div
                        className="
                            mt-4
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-[#3f3e3e]
                            "
                        >
                            <BookOpen
                                size={14}
                                className="text-[orangered]"
                            />

                            <span>
                                {
                                    course.lessonsCount
                                }{" "}
                                lessons
                            </span>
                        </div>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                text-[#3f3e3e]
                            "
                        >
                            <Clock3
                                size={14}
                                className="text-[orangered]"
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

                    <div
                        className="
                            mt-4
                            border-t
                            border-white/50
                            pt-4
                        "
                    >

                        <div className="flex items-center justify-between">

                            {/* LIKES */}

                            <div className="flex items-center gap-2">

                                <div
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#e0e5ec]
                                        text-[orangered]
                                        shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)]
                                    "
                                >
                                    <ThumbsUp
                                        size={14}
                                    />
                                </div>

                                <div className="flex flex-row items-baseline gap-x-[3px]">

                                    <p
                                        className="
                                            text-xs
                                            font-extrabold
                                            text-black
                                        "
                                    >
                                        {formatNumber(
                                            course.likes
                                        )}
                                    </p>

                                    <p
                                        className="
                                            text-[10px]
                                            text-[#3f3e3e]
                                        "
                                    >
                                        likes
                                    </p>

                                </div>

                            </div>

                            {/* VIEWS */}

                            <div className="flex items-center gap-2">

                                <div
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#e0e5ec]
                                        text-[#3f3e3e]
                                        shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)]
                                    "
                                >
                                    <span className="text-xs font-bold">
                                        ▶
                                    </span>
                                </div>

                                <div className="flex flex-row items-baseline gap-x-[3px]">

                                    <p
                                        className="
                                            text-xs
                                            font-extrabold
                                            text-black
                                        "
                                    >
                                        {formatNumber(
                                            course.views
                                        )}
                                    </p>

                                    <p
                                        className="
                                            text-[10px]
                                            text-[#3f3e3e]
                                        "
                                    >
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
                        className="
                            mt-5
                            flex
                            h-11
                            items-center
                            justify-center
                            gap-2
                            rounded-full
                            bg-[orangered]
                            text-sm
                            font-bold
                            text-white
                            shadow-[5px_5px_12px_rgba(255,69,0,0.28),-5px_-5px_12px_rgba(255,255,255,0.8)]
                            transition-all
                            duration-200
                            hover:-translate-y-[1px]
                            hover:bg-[red]
                            active:translate-y-[1px]
                        "
                    >
                        View course

                        <ArrowRight
                            size={16}
                            className="
                                transition-transform
                                group-hover:translate-x-0.5
                            "
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
        <main className="min-h-screen bg-[#e0e5ec] text-black">

            <Navbar />

            <div
                className="
                    mx-auto
                    max-w-7xl
                    px-5
                    py-10
                    sm:px-6
                    sm:py-12
                "
            >

                {/* =================================================
                   HEADER
                ================================================= */}

                <div>

                    <p
                        className="
                            text-[11px]
                            font-extrabold
                            uppercase
                            tracking-[1.6px]
                            text-[orangered]
                        "
                    >
                        Course Discovery
                    </p>

                    <h1
                        className="
                            mt-2
                            text-3xl
                            font-extrabold
                            tracking-tight
                            text-black
                            sm:text-4xl
                        "
                    >
                        Find something worth learning.
                    </h1>

                    <p
                        className="
                            mt-3
                            max-w-2xl
                            text-sm
                            leading-6
                            text-[#3f3e3e]
                            sm:text-base
                        "
                    >
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
                    className="
                        mt-7
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                    "
                >

                    <div
                        className="
                            flex
                            h-12
                            flex-1
                            items-center
                            rounded-full
                            bg-[#e0e5ec]
                            px-4
                            shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]
                            transition-all
                            focus-within:shadow-[inset_7px_7px_12px_rgba(163,177,198,0.75),inset_-7px_-7px_12px_rgba(255,255,255,0.95)]
                        "
                    >

                        <Search
                            size={18}
                            className="
                                shrink-0
                                text-[#3f3e3e]
                            "
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
                            className="
                                ml-3
                                w-full
                                bg-transparent
                                text-sm
                                font-medium
                                text-black
                                outline-none
                                placeholder:text-[#3f3e3e]
                            "
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={
                                    clearSearch
                                }
                                className="
                                    flex
                                    h-7
                                    w-7
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#3f3e3e]
                                    transition
                                    hover:text-[orangered]
                                "
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
                        className="
                            flex
                            h-12
                            items-center
                            justify-center
                            gap-2
                            rounded-full
                            bg-[orangered]
                            px-7
                            text-sm
                            font-bold
                            text-white
                            shadow-[5px_5px_12px_rgba(255,69,0,0.3),-5px_-5px_12px_rgba(255,255,255,0.8)]
                            transition-all
                            duration-200
                            hover:-translate-y-[1px]
                            hover:bg-[red]
                            active:translate-y-[1px]
                        "
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

                <div
                    className="
                        mt-6
                        flex
                        flex-wrap
                        items-center
                        gap-3
                    "
                >

                    <span
                        className="
                            text-sm
                            font-bold
                            text-[#3f3e3e]
                        "
                    >
                        Preferred language:
                    </span>

                    <div className="flex flex-wrap gap-3">

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
                                    className={`
                                        rounded-full
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        transition-all
                                        duration-200
                                        ${
                                            language ===
                                            item.value
                                                ? "bg-[orangered] text-white shadow-[4px_4px_9px_rgba(255,69,0,0.25),-4px_-4px_9px_rgba(255,255,255,0.8)]"
                                                : "bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                                        }
                                    `}
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
                    <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        "
                    >

                        {search.trim() && (
                            <span
                                className="
                                    rounded-full
                                    bg-[#e0e5ec]
                                    px-4
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-[#3f3e3e]
                                    shadow-[inset_3px_3px_6px_rgba(163,177,198,0.55),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                                "
                            >
                                Search: "
                                {
                                    search.trim()
                                }
                                "
                            </span>
                        )}

                        {activeCategory !==
                            "All" && (
                            <span
                                className="
                                    rounded-full
                                    bg-[#e0e5ec]
                                    px-4
                                    py-2
                                    text-xs
                                    font-bold
                                    text-[orangered]
                                    shadow-[inset_3px_3px_6px_rgba(163,177,198,0.55),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                                "
                            >
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
                    <div
                        className="
                            mt-5
                            rounded-[18px]
                            bg-[#e0e5ec]
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-red-600
                            shadow-[inset_4px_4px_8px_rgba(163,177,198,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
                        "
                    >
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
                    className="
                        mt-6
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[#e0e5ec]
                        px-5
                        py-2.5
                        text-sm
                        font-bold
                        text-[#3f3e3e]
                        shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
                        transition-all
                        hover:text-[orangered]
                        lg:hidden
                    "
                >

                    {showFilters
                        ? "Hide filters"
                        : "Show filters"}

                    {activeCategory !==
                        "All" && (
                        <span
                            className="
                                flex
                                h-5
                                min-w-5
                                items-center
                                justify-center
                                rounded-full
                                bg-[orangered]
                                px-1.5
                                text-[10px]
                                font-bold
                                text-white
                            "
                        >
                            1
                        </span>
                    )}

                </button>

                {/* =================================================
                   MAIN
                ================================================= */}

                <div
                    className="
                        mt-8
                        grid
                        gap-8
                        lg:grid-cols-[220px_1fr]
                    "
                >

                    {/* =================================================
                       SIDEBAR
                    ================================================= */}

                    <aside
                        className={`
                            ${
                                showFilters
                                    ? "block"
                                    : "hidden"
                            }
                            lg:block
                        `}
                    >

                        <div
                            className="
                                sticky
                                top-24
                                rounded-[24px]
                                bg-[#e0e5ec]
                                p-5
                                shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                            "
                        >

                            <div className="flex items-center justify-between">

                                <h2
                                    className="
                                        text-base
                                        font-extrabold
                                        text-black
                                    "
                                >
                                    Filters
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters(
                                            false
                                        )
                                    }
                                    className="
                                        flex
                                        h-7
                                        w-7
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-[#3f3e3e]
                                        lg:hidden
                                    "
                                >
                                    <X
                                        size={17}
                                    />
                                </button>

                            </div>

                            <div className="mt-7">

                                <p
                                    className="
                                        text-[10px]
                                        font-extrabold
                                        uppercase
                                        tracking-[1.2px]
                                        text-[#3f3e3e]
                                    "
                                >
                                    Category
                                </p>

                                <div className="mt-3 space-y-2">

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
                                                    className={`
                                                        flex
                                                        w-full
                                                        items-center
                                                        justify-between
                                                        rounded-full
                                                        px-4
                                                        py-2.5
                                                        text-left
                                                        text-sm
                                                        transition-all
                                                        duration-200
                                                        ${
                                                            active
                                                                ? "bg-[#e0e5ec] font-bold text-[orangered] shadow-[inset_4px_4px_7px_rgba(163,177,198,0.6),inset_-4px_-4px_7px_rgba(255,255,255,0.85)]"
                                                                : "text-[#3f3e3e] hover:text-[orangered] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.45),-5px_-5px_10px_rgba(255,255,255,0.75)]"
                                                        }
                                                    `}
                                                >

                                                    <span className="flex items-center gap-2">

                                                        {
                                                            category
                                                        }

                                                        <span
                                                            className={`
                                                                text-[10px]
                                                                ${
                                                                    active
                                                                        ? "text-[orangered]"
                                                                        : "text-[#3f3e3e]"
                                                                }
                                                            `}
                                                        >
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
                                    className="
                                        mt-6
                                        w-full
                                        rounded-full
                                        bg-[#e0e5ec]
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-[#3f3e3e]
                                        shadow-[inset_3px_3px_6px_rgba(163,177,198,0.55),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]
                                        transition-all
                                        hover:text-[orangered]
                                    "
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

                        {/* TOOLBAR */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    text-[#3f3e3e]
                                "
                            >
                                <span
                                    className="
                                        font-extrabold
                                        text-black
                                    "
                                >
                                    {
                                        filteredCourses.length
                                    }
                                </span>{" "}
                                courses found
                            </p>

                            <div className="relative">

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
                                    className="
                                        appearance-none
                                        rounded-full
                                        bg-[#e0e5ec]
                                        px-4
                                        py-2.5
                                        pr-9
                                        text-sm
                                        font-semibold
                                        text-[#3f3e3e]
                                        outline-none
                                        shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
                                    "
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

                                <div
                                    className="
                                        pointer-events-none
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-[#3f3e3e]
                                    "
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                    >
                                        <path
                                            d="M3 4.5L6 7.5L9 4.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                            </div>

                        </div>

                        {/* LOADING */}

                        {loading && (
                            <div className="mt-8">
                                <LogoLoader />
                            </div>
                        )}

                        {/* COURSE GRID */}

                        {!loading &&
                            filteredCourses.length >
                            0 && (
                                <div
                                    className="
                                        mt-6
                                        grid
                                        gap-6
                                        sm:grid-cols-2
                                        xl:grid-cols-3
                                    "
                                >

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

                        {/* EMPTY */}

                        {!loading &&
                            filteredCourses.length ===
                            0 && (
                                <div
                                    className="
                                        mt-6
                                        rounded-[28px]
                                        bg-[#e0e5ec]
                                        px-6
                                        py-20
                                        text-center
                                        shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                                    "
                                >

                                    <div
                                        className="
                                            mx-auto
                                            flex
                                            h-14
                                            w-14
                                            items-center
                                            justify-center
                                            rounded-[18px]
                                            bg-[#e0e5ec]
                                            text-[#3f3e3e]
                                            shadow-[inset_5px_5px_9px_rgba(163,177,198,0.65),inset_-5px_-5px_9px_rgba(255,255,255,0.85)]
                                        "
                                    >
                                        <Search
                                            size={22}
                                        />
                                    </div>

                                    <h3
                                        className="
                                            mt-5
                                            font-extrabold
                                            text-black
                                        "
                                    >
                                        No courses found
                                    </h3>

                                    <p
                                        className="
                                            mx-auto
                                            mt-2
                                            max-w-md
                                            text-sm
                                            leading-6
                                            text-[#3f3e3e]
                                        "
                                    >
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
                                        className="
                                            mt-6
                                            rounded-full
                                            bg-[orangered]
                                            px-6
                                            py-3
                                            text-sm
                                            font-bold
                                            text-white
                                            shadow-[5px_5px_12px_rgba(255,69,0,0.28),-5px_-5px_12px_rgba(255,255,255,0.8)]
                                            transition-all
                                            duration-200
                                            hover:-translate-y-[1px]
                                            hover:bg-[red]
                                        "
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