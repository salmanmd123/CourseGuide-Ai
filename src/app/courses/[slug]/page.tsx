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
      <main className="flex min-h-screen items-center justify-center bg-[#e0e5ec] px-6 text-black">
        <div className="w-full max-w-md rounded-[30px] bg-[#e0e5ec] p-8 text-center shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
            <BookOpen size={28} />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-black">
            Course not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#3f3e3e]">
            The course you're looking for doesn't exist or may have been
            removed.
          </p>

          <Link
            href="/courses"
            className="mt-7 inline-flex items-center gap-2 rounded-[20px] bg-[#e0e5ec] px-5 py-3 text-sm font-semibold text-black shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[#e0e5ec] hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
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

  const lessonsCount = Number(
    course.lessonsCount ?? courseLessons.length
  );

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
    <main className="min-h-screen overflow-x-hidden bg-[#e0e5ec] text-black">

      {/* =======================================================
          TOP NAVIGATION
      ======================================================= */}

      <header className="sticky top-0 z-40 bg-[#e0e5ec]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Link
            href="/courses"
            className="group flex items-center gap-2 text-sm font-semibold text-[#3f3e3e] transition-all duration-200 hover:text-[orangered]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 group-hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
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

      <section className="bg-[#e0e5ec]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">

            {/* =================================================
                LEFT HERO
            ================================================= */}

            <div className="min-w-0">

              {/* Status */}

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-semibold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                  {course.category}
                </span>

                <span className="rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-medium text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                  {course.level}
                </span>

                {course.language && (
                  <span className="rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-medium text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    {course.language}
                  </span>
                )}

                {isFeatured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-bold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                    <Star
                      size={12}
                      fill="currentColor"
                    />
                    Featured
                  </span>
                )}

                {!isFeatured && isRecommended && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0e5ec] px-3 py-1.5 text-xs font-bold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                    <Sparkles size={12} />
                    Recommended
                  </span>
                )}
              </div>

              {/* Title */}

              <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>

              {/* Description */}

              <p className="mt-5 max-w-3xl text-base leading-7 text-[#3f3e3e] sm:text-lg sm:leading-8">
                {course.description}
              </p>

              {/* =================================================
                  YOUTUBE CREATOR
              ================================================= */}

              <div className="mt-7 inline-flex items-center gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                  <YouTubeIcon size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f3e3e]/60">
                    YouTube Channel
                  </p>

                  <p className="truncate text-sm font-bold text-black">
                    {course.channelName || "YouTube"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  STATS
              ================================================= */}

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">

                {/* Likes */}

                <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    <ThumbsUp size={15} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-black">
                    {formatNumber(likes)}
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#3f3e3e]/70">
                    YouTube likes
                  </p>
                </div>

                {/* Views */}

                <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    <Eye size={15} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-black">
                    {formatNumber(views)}
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#3f3e3e]/70">
                    YouTube views
                  </p>
                </div>

                {/* Duration */}

                <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    <Clock3 size={15} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-black">
                    {course.duration}
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#3f3e3e]/70">
                    Total duration
                  </p>
                </div>

                {/* Lessons */}

                <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    <BookOpen size={15} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-black">
                    {lessonsCount}
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#3f3e3e]/70">
                    Lessons
                  </p>
                </div>
              </div>

              {/* CourseGuide */}

              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0e5ec] text-xs font-bold text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  CG
                </div>

                <div>
                  <p className="text-sm font-semibold text-black">
                    CourseGuide Selection
                  </p>

                  <p className="text-xs text-[#3f3e3e]/70">
                    Carefully selected for learners
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                START LEARNING CARD
            ================================================= */}

            <div className="overflow-hidden rounded-[30px] bg-[#e0e5ec] p-2 shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)]">

              {/* Thumbnail */}

              <div className="relative aspect-video overflow-hidden rounded-[24px] bg-[#e0e5ec] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]">

                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#e0e5ec]">
                    <BookOpen
                      size={42}
                      className="text-[#3f3e3e]/40"
                    />
                  </div>
                )}

                {/* Overlay */}

                <div className="absolute inset-0 bg-black/20" />

                {/* YouTube badge */}

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#e0e5ec]/90 px-3 py-1.5 text-xs font-semibold text-[orangered] shadow-[5px_5px_10px_rgba(0,0,0,0.15)] backdrop-blur-md">
                  <YouTubeIcon size={14} />
                  YouTube Course
                </div>

                {/* Play */}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[9px_9px_16px_rgba(0,0,0,0.25),-5px_-5px_12px_rgba(255,255,255,0.45)] transition-all duration-200 hover:scale-105 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
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
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[orangered]">
                  Start learning
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight text-black">
                  Ready to start?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#3f3e3e]">
                  Learn at your own pace and track your progress as you go.
                </p>

                {/* Quick information */}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-[#e0e5ec] p-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    <p className="text-[10px] uppercase tracking-wider text-[#3f3e3e]/60">
                      Lessons
                    </p>

                    <p className="mt-1 text-sm font-bold text-black">
                      {lessonsCount}
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-[#e0e5ec] p-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                    <p className="text-[10px] uppercase tracking-wider text-[#3f3e3e]/60">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-bold text-black">
                      {course.duration}
                    </p>
                  </div>
                </div>

                {/* Start */}

                <Link
                  href={`/learn/${course.slug}`}
                  className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[20px] bg-[orangered] text-sm font-bold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)]"
                >
                  Start learning
                  <ArrowRight size={17} />
                </Link>

                <p className="mt-4 text-center text-xs text-[#3f3e3e]/60">
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
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[orangered]">
                Learning path
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-black">
                Course curriculum
              </h2>

              <p className="mt-2 text-sm text-[#3f3e3e]/70">
                {courseLessons.length} lessons • {course.duration} total
                learning time
              </p>
            </div>
          </div>

          {/* Curriculum */}

          <div className="mt-6 overflow-hidden rounded-[30px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

            {/* Header */}

            <div className="flex items-center justify-between px-5 py-5 sm:px-6">
              <div>
                <p className="font-semibold text-black">
                  {course.title}
                </p>

                <p className="mt-1 text-xs text-[#3f3e3e]/60">
                  {courseLessons.length} lessons
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-[20px] bg-[#e0e5ec] px-3 py-2 text-xs font-medium text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] sm:flex">
                <Clock3 size={13} />
                {course.duration}
              </div>
            </div>

            {/* Lessons */}

            <div className="px-3 pb-3 sm:px-4">
              {courseLessons.length > 0 ? (
                courseLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="group flex items-center gap-3 rounded-[20px] px-3 py-4 transition-all duration-200 hover:bg-[#e0e5ec] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] sm:gap-4 sm:px-4"
                  >
                    {/* Number */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-xs font-bold text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] transition-all duration-200 group-hover:text-[orangered]">
                      {index + 1}
                    </div>

                    {/* Lesson */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-black">
                        {lesson.title}
                      </p>

                      <p className="mt-1 text-xs text-[#3f3e3e]/60">
                        Lesson {index + 1}
                        {lesson.duration
                          ? ` • ${lesson.duration}`
                          : ""}
                      </p>
                    </div>

                    {/* Play */}

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e]/40 shadow-[5px_5px_10px_rgba(163,177,198,0.35),-5px_-5px_10px_rgba(255,255,255,0.7)] transition-all duration-200 group-hover:text-[orangered] group-hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                      <Play
                        size={14}
                        fill="currentColor"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <BookOpen
                    size={24}
                    className="mx-auto text-[#3f3e3e]/40"
                  />

                  <p className="mt-3 text-sm font-medium text-[#3f3e3e]">
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

          <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[orangered]">
              Your outcome
            </p>

            <h3 className="mt-2 font-bold text-black">
              What you'll learn
            </h3>

            <div className="mt-5 space-y-4">
              {learningPoints.map((item) => (
                <div
                  key={item}
                  className="flex gap-3"
                >
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[orangered]"
                  />

                  <p className="text-sm leading-5 text-[#3f3e3e]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ===================================================
              COURSE DETAILS
          =================================================== */}

          <div className="mt-6 rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] sm:p-6">
            <h3 className="font-bold text-black">
              Course details
            </h3>

            <div className="mt-5 space-y-3">

              {/* Channel */}

              <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#e0e5ec] px-3 py-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.75)]">
                <span className="text-sm text-[#3f3e3e]/75">
                  YouTube channel
                </span>

                <span className="max-w-[170px] truncate text-right text-sm font-semibold text-black">
                  {course.channelName || "YouTube"}
                </span>
              </div>

              {/* Language */}

              <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#e0e5ec] px-3 py-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.75)]">
                <span className="text-sm text-[#3f3e3e]/75">
                  Language
                </span>

                <span className="text-sm font-semibold text-black">
                  {course.language || "English"}
                </span>
              </div>

              {/* Level */}

              <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#e0e5ec] px-3 py-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.75)]">
                <span className="text-sm text-[#3f3e3e]/75">
                  Level
                </span>

                <span className="text-sm font-semibold text-black">
                  {course.level}
                </span>
              </div>

              {/* Lessons */}

              <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#e0e5ec] px-3 py-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.75)]">
                <span className="text-sm text-[#3f3e3e]/75">
                  Lessons
                </span>

                <span className="text-sm font-semibold text-black">
                  {lessonsCount}
                </span>
              </div>

              {/* Duration */}

              <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#e0e5ec] px-3 py-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.75)]">
                <span className="text-sm text-[#3f3e3e]/75">
                  Duration
                </span>

                <span className="text-sm font-semibold text-black">
                  {course.duration}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              YOUTUBE STATS
          =================================================== */}

          <div className="mt-6 rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <YouTubeIcon size={15} />
              </div>

              <h3 className="font-bold text-black">
                YouTube stats
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">

              {/* Likes */}

              <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-1.5 text-[orangered]">
                  <ThumbsUp size={14} />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Likes
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-black">
                  {formatNumber(likes)}
                </p>
              </div>

              {/* Views */}

              <div className="rounded-[20px] bg-[#e0e5ec] p-4 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-1.5 text-[#3f3e3e]">
                  <Eye size={14} />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Views
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-black">
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