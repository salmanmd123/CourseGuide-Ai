import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Play,
  Sparkles,
  Star,
  ThumbsUp,
  Eye,
} from "lucide-react";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons } from "@/db/schema";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // =========================================================
  // GET COURSE
  // =========================================================

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug));

  // =========================================================
  // COURSE NOT FOUND
  // =========================================================

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
            <BookOpen size={28} />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Course not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            The course you're looking for doesn't exist
            or may have been removed.
          </p>

          <Link
            href="/courses"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // GET LESSONS
  // =========================================================

  const courseLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id));

  // =========================================================
  // VALUES
  // =========================================================

  const likes = Number(course.likes ?? 0);
  const views = Number(course.views ?? 0);

  const lessonsCount =
    Number(course.lessonsCount ?? courseLessons.length);

  const isFeatured = Boolean(course.featured);
  const isRecommended = Boolean(course.adminRecommended);

  // =========================================================
  // WHAT YOU'LL LEARN
  // =========================================================

  const learningPoints = [
    `Understand ${course.title} fundamentals`,
    "Learn concepts through practical examples",
    "Build a strong foundation step by step",
    "Practice important concepts and techniques",
    "Apply what you learn to real problems",
    "Build confidence through structured learning",
  ];

  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  function formatNumber(value: number) {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000)
        .toFixed(value >= 10_000_000 ? 0 : 1)
        .replace(/\.0$/, "")}M`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000)
        .toFixed(value >= 100_000 ? 0 : 1)
        .replace(/\.0$/, "")}K`;
    }

    return value.toLocaleString();
  }

  // =========================================================
  // YOUTUBE ICON
  // =========================================================

  function YouTubeIcon({
    size = 18,
  }: {
    size?: number;
  }) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="fill-current"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z" />
      </svg>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">

      {/* =======================================================
          TOP NAVIGATION
      ======================================================= */}

      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">

          <Link
            href="/courses"
            className="group flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white transition group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
              <ArrowLeft size={15} />
            </span>

            <span className="hidden sm:inline">
              Back to courses
            </span>

            <span className="sm:hidden">
              Courses
            </span>
          </Link>

        </div>
      </header>

      {/* =======================================================
          HERO
      ======================================================= */}

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">

            {/* =================================================
                LEFT HERO
            ================================================= */}

            <div className="min-w-0">

              {/* Status */}

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  {course.category}
                </span>

                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  {course.level}
                </span>

                {course.language && (
                  <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {course.language}
                  </span>
                )}

                {isFeatured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    <Star
                      size={12}
                      fill="currentColor"
                    />
                    Featured
                  </span>
                )}

                {!isFeatured &&
                  isRecommended && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                      <Sparkles size={12} />
                      Recommended
                    </span>
                  )}

              </div>

              {/* Title */}

              <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-zinc-950 dark:text-white sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>

              {/* Description */}

              <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-8">
                {course.description}
              </p>

              {/* =================================================
                  YOUTUBE CREATOR
              ================================================= */}

              <div className="mt-7 flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <YouTubeIcon size={20} />
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                    YouTube Channel
                  </p>

                  <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                    {course.channelName ||
                      "YouTube"}
                  </p>

                </div>

              </div>

              {/* =================================================
                  STATS
              ================================================= */}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">

                {/* Likes */}

                <div className="flex items-center gap-2.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                    <ThumbsUp size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {formatNumber(likes)}
                    </p>

                    <p className="text-[11px] text-zinc-400">
                      YouTube likes
                    </p>
                  </div>

                </div>

                {/* Views */}

                <div className="flex items-center gap-2.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <Eye size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {formatNumber(views)}
                    </p>

                    <p className="text-[11px] text-zinc-400">
                      YouTube views
                    </p>
                  </div>

                </div>

                {/* Duration */}

                <div className="flex items-center gap-2.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <Clock3 size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {course.duration}
                    </p>

                    <p className="text-[11px] text-zinc-400">
                      Total duration
                    </p>
                  </div>

                </div>

                {/* Lessons */}

                <div className="flex items-center gap-2.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <BookOpen size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {lessonsCount}
                    </p>

                    <p className="text-[11px] text-zinc-400">
                      Lessons
                    </p>
                  </div>

                </div>

              </div>

              {/* CourseGuide */}

              <div className="mt-7 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-xs font-bold text-white dark:bg-white dark:text-zinc-950">
                  CG
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    CourseGuide Selection
                  </p>

                  <p className="text-xs text-zinc-400">
                    Carefully selected for learners
                  </p>
                </div>

              </div>

            </div>

            {/* =================================================
                START LEARNING CARD
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">

              {/* Thumbnail */}

              <div className="relative aspect-video overflow-hidden bg-zinc-950">

                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <BookOpen
                      size={42}
                      className="text-zinc-700"
                    />
                  </div>
                )}

                {/* Overlay */}

                <div className="absolute inset-0 bg-black/25" />

                {/* YouTube badge */}

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  <YouTubeIcon size={14} />
                  YouTube Course
                </div>

                {/* Play */}

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-zinc-950 shadow-2xl transition-transform hover:scale-105">
                    <Play
                      size={24}
                      fill="currentColor"
                      className="ml-1"
                    />
                  </div>

                </div>

              </div>

              {/* Card body */}

              <div className="p-5 sm:p-6">

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                  Start learning
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Ready to start?
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Learn at your own pace and track your
                  progress as you go.
                </p>

                {/* Quick information */}

                <div className="mt-5 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">

                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Lessons
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      {lessonsCount}
                    </p>

                  </div>

                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">

                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                      {course.duration}
                    </p>

                  </div>

                </div>

                {/* Start */}

                <Link
                  href={`/learn/${course.slug}`}
                  className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Start learning
                  <ArrowRight size={17} />
                </Link>

                <p className="mt-4 text-center text-xs text-zinc-400">
                  Free to learn • No credit card required
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =======================================================
          MAIN CONTENT
      ======================================================= */}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_330px]">

        {/* =====================================================
            CURRICULUM
        ===================================================== */}

        <section>

          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                Learning path
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Course curriculum
              </h2>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {courseLessons.length} lessons •{" "}
                {course.duration} total learning time
              </p>

            </div>

          </div>

          {/* Curriculum */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">

              <div>

                <p className="font-semibold text-zinc-900 dark:text-white">
                  {course.title}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  {courseLessons.length} lessons
                </p>

              </div>

              <div className="hidden items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:flex">
                <Clock3 size={13} />
                {course.duration}
              </div>

            </div>

            {/* Lessons */}

            <div>

              {courseLessons.length > 0 ? (
                courseLessons.map(
                  (lesson, index) => (
                    <div
                      key={lesson.id}
                      className="group flex items-center gap-3 border-b border-zinc-100 px-4 py-4 transition last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 sm:gap-4 sm:px-5"
                    >

                      {/* Number */}

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-indigo-950/30 dark:group-hover:text-indigo-400">
                        {index + 1}
                      </div>

                      {/* Lesson */}

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                          {lesson.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-400">
                          Lesson {index + 1}
                          {lesson.duration
                            ? ` • ${lesson.duration}`
                            : ""}
                        </p>

                      </div>

                      {/* Play */}

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-300 transition group-hover:bg-zinc-100 group-hover:text-indigo-600 dark:text-zinc-600 dark:group-hover:bg-zinc-800 dark:group-hover:text-indigo-400">
                        <Play
                          size={14}
                          fill="currentColor"
                        />
                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="px-6 py-12 text-center">

                  <BookOpen
                    size={24}
                    className="mx-auto text-zinc-300 dark:text-zinc-600"
                  />

                  <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Curriculum will be available soon.
                  </p>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside>

          {/* ===================================================
              WHAT YOU'LL LEARN
          =================================================== */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">

            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
              Your outcome
            </p>

            <h3 className="mt-2 font-bold text-zinc-900 dark:text-white">
              What you'll learn
            </h3>

            <div className="mt-5 space-y-4">

              {learningPoints.map(
                (item) => (
                  <div
                    key={item}
                    className="flex gap-3"
                  >

                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                      {item}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* ===================================================
              COURSE DETAILS
          =================================================== */}

          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">

            <h3 className="font-bold text-zinc-900 dark:text-white">
              Course details
            </h3>

            <div className="mt-5 space-y-4">

              {/* Channel */}

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  YouTube channel
                </span>

                <span className="max-w-[170px] truncate text-right text-sm font-semibold text-zinc-900 dark:text-white">
                  {course.channelName ||
                    "YouTube"}
                </span>

              </div>

              {/* Language */}

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Language
                </span>

                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {course.language ||
                    "English"}
                </span>

              </div>

              {/* Level */}

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Level
                </span>

                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {course.level}
                </span>

              </div>

              {/* Lessons */}

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Lessons
                </span>

                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {lessonsCount}
                </span>

              </div>

              {/* Duration */}

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Duration
                </span>

                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {course.duration}
                </span>

              </div>

            </div>

          </div>

          {/* ===================================================
              YOUTUBE STATS
          =================================================== */}

          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <YouTubeIcon size={15} />
              </div>

              <h3 className="font-bold text-zinc-900 dark:text-white">
                YouTube stats
              </h3>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">

              {/* Likes */}

              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">

                <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
                  <ThumbsUp size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Likes
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">
                  {formatNumber(likes)}
                </p>

              </div>

              {/* Views */}

              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/70">

                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Eye size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Views
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">
                  {formatNumber(views)}
                </p>

              </div>

            </div>

          </div>

        </aside>

      </div>

    </main>
  );
}