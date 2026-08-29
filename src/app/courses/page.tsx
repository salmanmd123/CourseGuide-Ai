"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Filter,
    Search,
    Star,
    X,
} from "lucide-react";
import Navbar from "@/components/navbar";

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
};

const categories = [
    "All",
    "Programming",
    "Computer Science",
    "AI & ML",
    "Web Development",
    "Databases",
];

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCourses() {
            try {
                const response = await fetch("/api/courses");

                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }

                const data = await response.json();
                setCourses(data);
            } catch (error) {
                console.error("Failed to load courses:", error);
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    const filteredCourses = courses.filter((course) => {
        const matchesCategory =
            activeCategory === "All" ||
            course.category === activeCategory;

        const searchTerm = search.toLowerCase();

        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* HEADER */}
                <div>
                    <p className="text-sm font-semibold text-indigo-600">
                        COURSE DISCOVERY
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                        Find something worth learning.
                    </h1>

                    <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
                        Explore carefully selected courses and find the right
                        learning path for your goals.
                    </p>
                </div>

                {/* SEARCH */}
                <div className="mt-8 flex gap-3">

                    <div className="flex h-12 flex-1 items-center rounded-xl border border-zinc-200 bg-white px-4 shadow-sm transition focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">

                        <Search
                            size={19}
                            className="shrink-0 text-zinc-400"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Python, machine learning, databases..."
                            className="ml-3 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                        />

                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
                    >
                        <Filter size={17} />
                        Filters
                    </button>

                </div>

                {/* MAIN CONTENT */}
                <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">

                    {/* FILTERS */}
                    <aside
                        className={`${showFilters ? "block" : "hidden"} lg:block`}
                    >
                        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

                            <div className="flex items-center justify-between">

                                <h2 className="font-semibold text-zinc-900 dark:text-white">
                                    Filters
                                </h2>

                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white lg:hidden"
                                >
                                    <X size={17} />
                                </button>

                            </div>

                            {/* CATEGORY */}
                            <div className="mt-6">

                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Category
                                </p>

                                <div className="mt-3 space-y-1">

                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() =>
                                                setActiveCategory(category)
                                            }
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                activeCategory === category
                                                    ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                            }`}
                                        >
                                            {category}

                                            {activeCategory === category && (
                                                <CheckCircle2 size={15} />
                                            )}
                                        </button>
                                    ))}

                                </div>

                            </div>

                        </div>
                    </aside>

                    {/* RESULTS */}
                    <section>

                        {/* RESULT HEADER */}
                        <div className="flex items-center justify-between">

                            <p className="text-sm text-zinc-500 dark:text-zinc-400">

                                <span className="font-semibold text-zinc-900 dark:text-white">
                                    {filteredCourses.length}
                                </span>{" "}
                                courses found

                            </p>

                            <select
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 outline-none transition focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                            >
                                <option>Recommended</option>
                                <option>Highest rated</option>
                                <option>Most popular</option>
                                <option>Shortest</option>
                            </select>

                        </div>

                        {/* LOADING */}
                        {loading && (
                            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-[390px] animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                                    />
                                ))}

                            </div>
                        )}

                        {/* COURSE GRID */}
                        {!loading && filteredCourses.length > 0 && (
                            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {filteredCourses.map((course) => (
                                    <article
                                        key={course.id}
                                        className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-2xl"
                                    >

                                        {/* THUMBNAIL */}
                                        <div className="relative flex h-40 items-center justify-center bg-zinc-100 dark:bg-zinc-800">

                                            {course.featured && (
                                                <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm dark:bg-zinc-950 dark:text-indigo-400">
                                                    Recommended
                                                </span>
                                            )}

                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400">
                                                <BookOpen size={24} />
                                            </div>

                                        </div>

                                        {/* CONTENT */}
                                        <div className="p-5">

                                            {/* CATEGORY + LEVEL */}
                                            <div className="flex items-center justify-between">

                                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {course.category}
                                                </span>

                                                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                                    {course.level}
                                                </span>

                                            </div>

                                            {/* TITLE */}
                                            <h2 className="mt-3 line-clamp-1 text-lg font-bold text-zinc-900 dark:text-white">
                                                {course.title}
                                            </h2>

                                            {/* DESCRIPTION */}
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                                {course.description}
                                            </p>

                                            {/* STATS */}
                                            <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">

                                                <span className="flex items-center gap-1">
                                                    <Clock3 size={14} />
                                                    {course.duration}
                                                </span>

                                                <span>
                                                    {course.lessonsCount} lessons
                                                </span>

                                            </div>

                                            {/* RATING */}
                                            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">

                                                <div className="flex items-center gap-1 text-xs">

                                                    <Star
                                                        size={14}
                                                        fill="currentColor"
                                                        className="text-amber-500"
                                                    />

                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {course.rating ?? "0"}
                                                    </span>

                                                    <span className="text-zinc-400">
                                                        ({course.students ?? "0"})
                                                    </span>

                                                </div>

                                                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                                                    {course.source ?? "YouTube"}
                                                </span>

                                            </div>

                                            {/* BUTTON */}
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                            >
                                                View course
                                                <ArrowRight size={15} />
                                            </Link>

                                        </div>

                                    </article>
                                ))}

                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && filteredCourses.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">

                                <Search
                                    size={30}
                                    className="mx-auto text-zinc-300 dark:text-zinc-600"
                                />

                                <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                                    No courses found
                                </h3>

                                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                    Try another search term or category.
                                </p>

                            </div>
                        )}

                    </section>

                </div>

            </div>
        </main>
    );
}