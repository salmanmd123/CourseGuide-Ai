import LessonContentTabs from "@/components/lesson-content-tabs";
import LessonDescription from "@/components/lesson-description";
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
  Play,
} from "lucide-react";

import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  lessons,
  progress,
} from "@/db/schema";

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

  const text = duration
    .toLowerCase()
    .trim();

  const hoursMatch =
    text.match(/(\d+)\s*h/);

  const minutesMatch =
    text.match(/(\d+)\s*m/);

  const secondsMatch =
    text.match(/(\d+)\s*s/);

  const hours = Number(
    hoursMatch?.[1] || 0
  );

  const minutes = Number(
    minutesMatch?.[1] || 0
  );

  const seconds = Number(
    secondsMatch?.[1] || 0
  );

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
      <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-zinc-50 px-6 dark:bg-zinc-950">
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
      <main className="min-h-screen w-full overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">

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

  const foundLessonIndex =
    courseLessons.findIndex(
      (item) =>
        item.id === requestedLessonId
    );

  const currentLessonIndex =
    foundLessonIndex >= 0
      ? foundLessonIndex
      : 0;

  const currentLesson =
    courseLessons[currentLessonIndex];

  // =========================================================
  // PREVIOUS / NEXT LESSON
  // =========================================================

  const previousLesson =
    currentLessonIndex > 0
      ? courseLessons[
          currentLessonIndex - 1
        ]
      : null;

  const nextLesson =
    currentLessonIndex <
      courseLessons.length - 1
      ? courseLessons[
          currentLessonIndex + 1
        ]
      : null;

  // =========================================================
  // GET USER PROGRESS
  // =========================================================

  const userProgress = await db
    .select()
    .from(progress)
    .where(
      eq(
        progress.userId,
        user.id
      )
    );

  // =========================================================
  // COMPLETED LESSON IDS
  // =========================================================

  const completedLessonIds =
    new Set(
      userProgress
        .filter(
          (item) =>
            item.completed
        )
        .map(
          (item) =>
            item.lessonId
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

  for (
    const lessonItem of courseLessons
  ) {
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

    if (lessonDuration > 0) {
      totalWatchedSeconds +=
        Math.min(
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
  // LESSON NUMBER
  // =========================================================

  const lessonNumber =
    currentLessonIndex + 1;

  // =========================================================
  // INITIAL WATCHED VALUE
  // =========================================================

  const currentLessonInitialSeconds =
    currentLessonProgress?.watchedSeconds ??
    0;

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-50 w-full min-w-0 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

        <div className="flex h-16 min-w-0 items-center justify-between px-5">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-5">

            <Link
              href={`/courses/${course.slug}`}
              className="flex shrink-0 items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft size={17} />

              <span className="hidden sm:block">
                Course
              </span>
            </Link>

            <div className="hidden h-6 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800 sm:block" />

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                C
              </div>

              <div className="min-w-0">

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

          {/* RIGHT - COURSE PROGRESS */}

          <div className="ml-4 flex shrink-0 items-center gap-3">

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
          VIDEO + COURSE SIDEBAR

          Sidebar belongs ONLY to the video area.
          Everything below this grid is full width.
      ===================================================== */}

      <div className="grid w-full min-w-0 max-w-full lg:grid-cols-[minmax(0,1fr)_330px]">

        {/* ===================================================
            VIDEO AREA
        =================================================== */}

        <section className="min-w-0 max-w-full overflow-hidden">

          <div className="w-full max-w-full overflow-hidden bg-zinc-900 dark:bg-black">

            {currentLesson.videoUrl ? (

              <LearningClient
                lessonId={
                  currentLesson.id
                }
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

              <div className="flex aspect-video w-full items-center justify-center">

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

        </section>

        {/* ===================================================
            COURSE CONTENT SIDEBAR

            Fixed on desktop.
            Only lesson list scrolls.
        =================================================== */}

        <aside className="min-w-0 max-w-full overflow-hidden border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">

          {/* SIDEBAR HEADER */}

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

            <div className="min-w-0">

              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Course content
              </p>

              <p className="mt-1 truncate text-xs text-zinc-400">
                {courseLessons.length}{" "}
                lessons •{" "}
                {course.duration}
              </p>

            </div>

            <ChevronDown
              size={17}
              className="shrink-0 text-zinc-400"
            />

          </div>

          {/* SIDEBAR PROGRESS */}

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

              This is the ONLY scrollable part.
          ================================================= */}

          <div className="min-h-0 overflow-y-auto overflow-x-hidden lg:h-[calc(100%-111px)]">

            {courseLessons.map(
              (
                lessonItem,
                index
              ) => {

                const current =
                  lessonItem.id ===
                  currentLesson.id;

                const completed =
                  completedLessonIds.has(
                    lessonItem.id
                  );

                return (
                  <Link
                    key={
                      lessonItem.id
                    }
                    href={`/learn/${course.slug}?lesson=${lessonItem.id}`}
                    className={`flex w-full min-w-0 items-center gap-3 border-b border-zinc-100 px-5 py-4 text-left transition dark:border-zinc-900 ${
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
                        <CheckCircle2
                          size={15}
                        />
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
                        {
                          lessonItem.title
                        }
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">

                        <Clock3
                          size={11}
                        />

                        {lessonItem.duration ||
                          "20 min"}

                      </p>

                    </div>

                    {/* CURRENT PLAY ICON */}

                    {current && (
                      <Play
                        size={14}
                        fill="currentColor"
                        className="shrink-0 text-indigo-600 dark:text-indigo-400"
                      />
                    )}

                  </Link>
                );
              }
            )}

          </div>

        </aside>

      </div>

      {/* =====================================================
          FULL WIDTH LESSON CONTENT

          IMPORTANT:
          This section is OUTSIDE the video/sidebar grid.
          Therefore AI Notes, Quiz and AI Tutor receive
          the complete page width.
      ===================================================== */}

      <section className="w-full min-w-0 max-w-full overflow-hidden border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">

        <div className="mx-auto w-full max-w-7xl min-w-0 px-5 py-8 sm:px-8 lg:px-10">

          {/* =================================================
              LESSON INFORMATION
          ================================================= */}

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              LESSON{" "}
              {String(
                lessonNumber
              ).padStart(2, "0")}
            </p>

            <h1 className="mt-2 max-w-full break-words text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl lg:text-4xl">
              {currentLesson.title}
            </h1>

            {/* DESCRIPTION ONLY ONCE */}

            <LessonDescription
              description={
                currentLesson.description
              }
              fallback={`Learn ${currentLesson.title.toLowerCase()} with practical examples and simple explanations.`}
            />

          </div>

          {/* =================================================
              AI NOTES / QUIZ / AI TUTOR
              
              LessonContentTabs controls which section
              is displayed.
          ================================================= */}

          <div className="mt-8 w-full min-w-0 max-w-full overflow-hidden">

            <LessonContentTabs
              lessonId={
                currentLesson.id
              }
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          BOTTOM LESSON NAVIGATION
      ===================================================== */}

      <div className="w-full min-w-0 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">

          {/* PREVIOUS */}

          {previousLesson ? (

            <Link
              href={`/learn/${course.slug}?lesson=${previousLesson.id}`}
              className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft
                size={14}
              />

              Previous lesson
            </Link>

          ) : (
            <div />
          )}

          {/* NEXT */}

          {nextLesson ? (

            <Link
              href={`/learn/${course.slug}?lesson=${nextLesson.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Next lesson

              <ArrowRight
                size={14}
              />

            </Link>

          ) : (

            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Finish course

              <CheckCircle2
                size={14}
              />

            </Link>

          )}

        </div>

      </div>

    </main>
  );
}