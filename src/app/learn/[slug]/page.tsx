import LearningClient from "@/components/learning-client";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  MessageCircle,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";

import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, progress } from "@/db/schema";

type LearningPageProps = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    lesson?: string;
  }>;
};

/* =========================================================
   CONVERT STORED DURATION TO SECONDS
========================================================= */

function durationToSeconds(
  duration: string | null | undefined
): number {
  if (!duration) {
    return 0;
  }

  const text = duration.toLowerCase().trim();

  const hoursMatch = text.match(/(\d+)\s*h/);
  const minutesMatch = text.match(/(\d+)\s*m/);
  const secondsMatch = text.match(/(\d+)\s*s/);

  const hours = Number(hoursMatch?.[1] || 0);
  const minutes = Number(minutesMatch?.[1] || 0);
  const seconds = Number(secondsMatch?.[1] || 0);

  return (
    hours * 60 * 60 +
    minutes * 60 +
    seconds
  );
}

export default async function LearningPage({
  params,
  searchParams,
}: LearningPageProps) {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // PARAMETERS
  // =========================================================

  const { slug } = await params;
  const { lesson } = await searchParams;

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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            Course not found
          </h1>

          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            The course you're looking for doesn't exist.
          </p>

          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // GET COURSE LESSONS
  // =========================================================

  const courseLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.order));

  // =========================================================
  // NO LESSONS
  // =========================================================

  if (courseLessons.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
            <Link
              href={`/courses/${course.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to course
            </Link>
          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <BookOpen
              size={40}
              className="mx-auto text-zinc-300 dark:text-zinc-700"
            />

            <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
              No lessons available
            </h1>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This course doesn't have any lessons yet.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // FIND CURRENT LESSON
  // =========================================================

  const requestedLessonId = lesson
    ? Number.parseInt(lesson, 10)
    : courseLessons[0].id;

  const foundLessonIndex = courseLessons.findIndex(
    (item) => item.id === requestedLessonId
  );

  const currentLessonIndex =
    foundLessonIndex >= 0
      ? foundLessonIndex
      : 0;

  const currentLesson =
    courseLessons[currentLessonIndex];

  // =========================================================
  // PREVIOUS / NEXT
  // =========================================================

  const previousLesson =
    currentLessonIndex > 0
      ? courseLessons[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex <
    courseLessons.length - 1
      ? courseLessons[currentLessonIndex + 1]
      : null;

  // =========================================================
  // GET USER PROGRESS
  // =========================================================

  const userProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, user.id));

  // =========================================================
  // COMPLETED LESSON IDS
  // =========================================================

  const completedLessonIds = new Set(
    userProgress
      .filter(
        (item) => item.completed
      )
      .map(
        (item) => item.lessonId
      )
  );

  // =========================================================
  // CURRENT LESSON PROGRESS
  // =========================================================

  const currentLessonProgress =
    userProgress.find(
      (item) =>
        item.lessonId ===
        currentLesson.id
    );

  // =========================================================
  // WATCH-TIME BASED COURSE PROGRESS
  // =========================================================

  let totalCourseSeconds = 0;
  let totalWatchedSeconds = 0;

  for (const lessonItem of courseLessons) {
    const lessonDuration =
      durationToSeconds(
        lessonItem.duration
      );

    totalCourseSeconds +=
      lessonDuration;

    const lessonProgress =
      userProgress.find(
        (item) =>
          item.lessonId ===
          lessonItem.id
      );

    const watchedSeconds =
      lessonProgress?.watchedSeconds ??
      0;

    /*
     * Never allow watched time to exceed
     * the lesson's actual stored duration.
     */
    if (lessonDuration > 0) {
      totalWatchedSeconds += Math.min(
        watchedSeconds,
        lessonDuration
      );
    }
  }

  const progressPercentage =
    totalCourseSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (totalWatchedSeconds /
                totalCourseSeconds) *
                100
            )
          )
        )
      : 0;

  // =========================================================
  // CURRENT LESSON COMPLETION
  // =========================================================

  const currentLessonCompleted =
    completedLessonIds.has(
      currentLesson.id
    );

  // Keep this variable because the page may use it later.
  void currentLessonCompleted;

  // =========================================================
  // LESSON NUMBER
  // =========================================================

  const lessonNumber =
    currentLessonIndex + 1;

  // =========================================================
  // INITIAL WATCHED VALUE FOR CURRENT LESSON
  // =========================================================

  const currentLessonInitialSeconds =
    currentLessonProgress?.watchedSeconds ??
    0;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex h-16 items-center justify-between px-5">

          {/* LEFT */}

          <div className="flex items-center gap-5">

            <Link
              href={`/courses/${course.slug}`}
              className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft size={17} />

              <span className="hidden sm:block">
                Course
              </span>
            </Link>

            <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                C
              </div>

              <div>

                <p className="max-w-[280px] truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {course.title}
                </p>

                <p className="text-[11px] text-zinc-400">
                  Lesson {lessonNumber} of{" "}
                  {courseLessons.length}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              LIVE PROGRESS
          ================================================= */}

          <div className="flex items-center gap-3">

            <span className="hidden text-xs text-zinc-400 sm:block">
              Course progress
            </span>

            <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">

              <div
                id="course-progress-bar"
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

            <span
              id="course-progress-text"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-300"
            >
              {progressPercentage}%
            </span>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_330px]">

        {/* ===================================================
            MAIN AREA
        =================================================== */}

        <section className="min-w-0">

          {/* =================================================
              VIDEO
          ================================================= */}

          <div className="w-full bg-zinc-900 dark:bg-black">

            {currentLesson.videoUrl ? (

              <LearningClient
                lessonId={currentLesson.id}
                videoUrl={
                  currentLesson.videoUrl
                }
                startSeconds={
                  currentLessonInitialSeconds
                }
                totalCourseSeconds={
                  totalCourseSeconds
                }
                initialTotalWatchedSeconds={
                  totalWatchedSeconds
                }
                currentLessonInitialSeconds={
                  currentLessonInitialSeconds
                }
              />

            ) : (

              <div className="flex aspect-video items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-zinc-950 shadow-2xl transition hover:scale-105 dark:bg-zinc-100">

                    <Play
                      size={30}
                      fill="currentColor"
                      className="ml-1"
                    />

                  </div>

                  <p className="mt-5 text-sm font-medium text-zinc-200">
                    Video coming soon
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Video content will appear here.
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              LESSON CONTENT
          ================================================= */}

          <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

            {/* =================================================
                LESSON HEADING
            ================================================= */}

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  LESSON{" "}
                  {String(
                    lessonNumber
                  ).padStart(
                    2,
                    "0"
                  )}
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                  {currentLesson.title}
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {currentLesson.description ||
                    `Learn ${currentLesson.title.toLowerCase()} with practical examples and simple explanations.`}
                </p>

              </div>

            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="mt-8 flex gap-6 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">

              {[
                {
                  label: "Overview",
                  icon: BookOpen,
                },
                {
                  label: "AI Notes",
                  icon: FileText,
                },
                {
                  label: "Quiz",
                  icon: Trophy,
                },
                {
                  label: "AI Tutor",
                  icon: MessageCircle,
                },
              ].map(
                ({
                  label,
                  icon: Icon,
                }, index) => (

                  <button
                    key={label}
                    type="button"
                    className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium ${
                      index === 0
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>

                )
              )}

            </div>

            {/* =================================================
                OVERVIEW
            ================================================= */}

            <div className="py-8">

              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                About this lesson
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {currentLesson.description ||
                  `This lesson covers ${currentLesson.title.toLowerCase()} and helps you build a strong understanding through practical examples and structured learning.`}
              </p>

              {/* =================================================
                  AI FEATURES
              ================================================= */}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                {/* AI NOTES */}

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-xl">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Sparkles size={19} />
                  </div>

                  <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                    AI Notes
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    Get automatically generated notes for this lesson.
                  </p>

                  <button
                    type="button"
                    className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Generate notes →
                  </button>

                </div>

                {/* QUIZ */}

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-xl">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <Trophy size={19} />
                  </div>

                  <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                    Test yourself
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    Take a short quiz to check your understanding.
                  </p>

                  <button
                    type="button"
                    className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Start quiz →
                  </button>

                </div>

              </div>

              {/* =================================================
                  LESSON NAVIGATION
              ================================================= */}

              <div className="mt-10 flex justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">

                {previousLesson ? (

                  <Link
                    href={`/learn/${course.slug}?lesson=${previousLesson.id}`}
                    className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Previous lesson
                  </Link>

                ) : (

                  <span className="flex items-center gap-2 text-sm text-zinc-300 dark:text-zinc-700">
                    <ArrowLeft size={16} />
                    Previous lesson
                  </span>

                )}

                {nextLesson ? (

                  <Link
                    href={`/learn/${course.slug}?lesson=${nextLesson.id}`}
                    className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Next lesson
                    <ArrowRight size={16} />
                  </Link>

                ) : (

                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Finish course
                    <CheckCircle2 size={16} />
                  </Link>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

          {/* =================================================
              SIDEBAR HEADER
          ================================================= */}

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

            <div>

              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Course content
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                {courseLessons.length} lessons •{" "}
                {course.duration}
              </p>

            </div>

            <ChevronDown
              size={17}
              className="text-zinc-400"
            />

          </div>

          {/* =================================================
              SIDEBAR PROGRESS
          ================================================= */}

          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

            <div className="flex items-center justify-between text-xs">

              <span className="text-zinc-400">
                Your progress
              </span>

              <span
                id="sidebar-course-progress-text"
                className="font-semibold text-indigo-600 dark:text-indigo-400"
              >
                {progressPercentage}%
              </span>

            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">

              <div
                id="sidebar-course-progress-bar"
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

          </div>

          {/* =================================================
              LESSON LIST
          ================================================= */}

          <div className="max-h-[calc(100vh-150px)] overflow-y-auto">

            {courseLessons.map(
              (lessonItem, index) => {

                const current =
                  lessonItem.id ===
                  currentLesson.id;

                const completed =
                  completedLessonIds.has(
                    lessonItem.id
                  );

                return (
                  <Link
                    key={lessonItem.id}
                    href={`/learn/${course.slug}?lesson=${lessonItem.id}`}
                    className={`flex w-full items-center gap-3 border-b border-zinc-100 px-5 py-4 text-left transition dark:border-zinc-900 ${
                      current
                        ? "bg-indigo-50 dark:bg-indigo-950/40"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >

                    {/* NUMBER */}

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                        completed
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : current
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500"
                      }`}
                    >

                      {completed ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        index + 1
                      )}

                    </div>

                    {/* DETAILS */}

                    <div className="min-w-0 flex-1">

                      <p
                        className={`truncate text-sm ${
                          current
                            ? "font-semibold text-indigo-700 dark:text-indigo-400"
                            : completed
                              ? "text-zinc-500 dark:text-zinc-500"
                              : "text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {lessonItem.title}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">

                        <Clock3 size={11} />

                        {lessonItem.duration ||
                          "20 min"}

                      </p>

                    </div>

                    {/* CURRENT PLAY ICON */}

                    {current && (
                      <Play
                        size={14}
                        fill="currentColor"
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    )}

                  </Link>
                );
              }
            )}

          </div>

        </aside>

      </div>

    </main>
  );
}