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
      <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#e0e5ec] dark:bg-[#1a1d23] px-6 text-black dark:text-[#f5f7fa]">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e0e5ec] dark:bg-[#1e2229] text-[orangered] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
            <BookOpen size={32} />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-black dark:text-[#f5f7fa]">
            Course not found
          </h1>

          <p className="mt-3 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
            The course you're looking for doesn't exist.
          </p>

          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-[20px] bg-[orangered] px-5 py-3 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
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
      <main className="min-h-screen w-full overflow-x-hidden bg-[#e0e5ec] dark:bg-[#1a1d23] text-black dark:text-[#f5f7fa]">
        <header className="sticky top-0 z-50 w-full bg-[#e0e5ec] dark:bg-[#1e2229] px-5 py-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1e2229] px-4 py-2.5 text-sm font-medium text-[#3f3e3e] dark:text-[#a8adb7] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
            >
              <ArrowLeft size={16} />
              Back to course
            </Link>
          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="rounded-[30px] bg-[#e0e5ec] dark:bg-[#1e2229] p-10 text-center shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)] dark:shadow-[14px_14px_28px_rgba(5,7,10,0.8),-14px_-14px_28px_rgba(43,48,58,0.8)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e0e5ec] dark:bg-[#1e2229] text-[orangered] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]">
              <BookOpen size={32} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-black dark:text-[#f5f7fa]">
              No lessons available
            </h1>

            <p className="mt-2 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
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
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#e0e5ec] dark:bg-[#1a1d23] text-black dark:text-[#f5f7fa]">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-50 w-full min-w-0 bg-[#e0e5ec] dark:bg-[#1e2229] px-3 py-3 sm:px-5">
        <div className="flex h-14 min-w-0 items-center justify-between rounded-[20px] bg-[#e0e5ec] dark:bg-[#1e2229] px-3 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:px-5">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link
              href={`/courses/${course.slug}`}
              className="flex shrink-0 items-center gap-2 rounded-[12px] bg-[#e0e5ec] dark:bg-[#1e2229] px-2.5 py-2 text-sm text-[#3f3e3e] dark:text-[#a8adb7] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)] sm:px-3"
            >
              <ArrowLeft size={17} />

              <span className="hidden sm:block">
                Course
              </span>
            </Link>

            <div className="hidden h-7 w-px shrink-0 bg-[#c7cdd5] dark:bg-[#343a45] sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[#e0e5ec] dark:bg-[#1e2229] text-xs font-bold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                C
              </div>

              <div className="min-w-0">
                <p className="max-w-[180px] truncate text-sm font-semibold text-black dark:text-[#f5f7fa] sm:max-w-[280px]">
                  {course.title}
                </p>

                <p className="text-[11px] text-[#3f3e3e] dark:text-[#a8adb7]/60">
                  Lesson {lessonNumber} of{" "}
                  {courseLessons.length}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT - COURSE PROGRESS */}

          <div className="ml-3 flex shrink-0 items-center gap-2 sm:ml-4 sm:gap-3">
            <span className="hidden text-xs text-[#3f3e3e] dark:text-[#a8adb7]/60 sm:block">
              Course progress
            </span>

            <div className="h-2 w-16 overflow-hidden rounded-full bg-[#e0e5ec] dark:bg-[#1e2229] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)] sm:w-24">
              <div
                id="course-progress-bar"
                className="h-full rounded-full bg-[orangered] transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            <span
              id="course-progress-text"
              className="text-xs font-semibold text-[orangered]"
            >
              {progressPercentage}%
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          VIDEO + COURSE SIDEBAR
      ===================================================== */}

      <div className="grid w-full min-w-0 max-w-full gap-4 px-3 pb-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* ===================================================
            VIDEO AREA
        =================================================== */}

        <section className="min-w-0 max-w-full overflow-hidden rounded-[30px] bg-[#e0e5ec] dark:bg-[#1e2229] p-2 shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)] dark:shadow-[14px_14px_28px_rgba(5,7,10,0.8),-14px_-14px_28px_rgba(43,48,58,0.8)] sm:p-3">
          <div className="w-full max-w-full overflow-hidden rounded-[24px] bg-[#e0e5ec] dark:bg-[#1e2229] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]">
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
              <div className="flex aspect-video w-full items-center justify-center rounded-[24px] bg-[#e0e5ec] dark:bg-[#1e2229]">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e0e5ec] dark:bg-[#1e2229] text-[orangered] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] transition-all duration-200 hover:shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:hover:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]">
                    <Play
                      size={30}
                      fill="currentColor"
                      className="ml-1"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-black dark:text-[#f5f7fa]">
                    Video coming soon
                  </p>

                  <p className="mt-1 text-xs text-[#3f3e3e] dark:text-[#a8adb7]/60">
                    Video content will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            COURSE CONTENT SIDEBAR
        =================================================== */}

        <aside className="min-w-0 max-w-full overflow-hidden rounded-[30px] bg-[#e0e5ec] dark:bg-[#1e2229] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] lg:sticky lg:top-[76px] lg:h-[calc(100vh-92px)]">
          {/* SIDEBAR HEADER */}

          <div className="flex items-center justify-between px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-black dark:text-[#f5f7fa]">
                Course content
              </p>

              <p className="mt-1 truncate text-xs text-[#3f3e3e] dark:text-[#a8adb7]/60">
                {courseLessons.length}{" "}
                lessons •{" "}
                {course.duration}
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] dark:bg-[#1e2229] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
              <ChevronDown size={17} />
            </div>
          </div>

          {/* SIDEBAR PROGRESS */}

          <div className="mx-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1e2229] px-4 py-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#3f3e3e] dark:text-[#a8adb7]/60">
                Your progress
              </span>

              <span
                id="sidebar-course-progress-text"
                className="font-semibold text-[orangered]"
              >
                {progressPercentage}%
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e0e5ec] dark:bg-[#1e2229] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
              <div
                id="sidebar-course-progress-bar"
                className="h-full rounded-full bg-[orangered] transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          {/* =================================================
              LESSON LIST
          ================================================= */}

          <div className="min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-3 lg:h-[calc(100%-125px)]">
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
                    className={`mt-2 flex w-full min-w-0 items-center gap-3 rounded-[20px] px-4 py-3 text-left transition-all duration-200 ${
                      current
                        ? "bg-[#e0e5ec] dark:bg-[#1e2229] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
                        : "hover:bg-[#e0e5ec] dark:hover:bg-[#252a32] hover:shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:hover:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]"
                    }`}
                  >
                    {/* NUMBER */}

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        completed
                          ? "bg-[#e0e5ec] dark:bg-[#1e2229] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
                          : current
                            ? "bg-[orangered] text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]"
                            : "bg-[#e0e5ec] dark:bg-[#1e2229] text-[#3f3e3e] dark:text-[#a8adb7]/50 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
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
                            ? "font-semibold text-[orangered]"
                            : completed
                              ? "text-[#3f3e3e] dark:text-[#a8adb7]/50"
                              : "text-[#3f3e3e] dark:text-[#a8adb7]"
                        }`}
                      >
                        {
                          lessonItem.title
                        }
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-[10px] text-[#3f3e3e] dark:text-[#a8adb7]/50">
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
                        className="shrink-0 text-[orangered]"
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
      ===================================================== */}

      <section className="w-full min-w-0 max-w-full overflow-hidden border-t border-[#d2d7df] dark:border-[#303640] bg-[#e0e5ec] dark:bg-[#1a1d23]">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-5 py-8 sm:px-8 lg:px-10">
          {/* =================================================
              LESSON INFORMATION
          ================================================= */}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[orangered]">
              LESSON{" "}
              {String(
                lessonNumber
              ).padStart(2, "0")}
            </p>

            <h1 className="mt-2 max-w-full break-words text-2xl font-bold tracking-tight text-black dark:text-[#f5f7fa] sm:text-3xl lg:text-4xl">
              {currentLesson.title}
            </h1>

            <LessonDescription
              description={
                currentLesson.description
              }
              fallback={`Learn ${currentLesson.title.toLowerCase()} with practical examples and simple explanations.`}
            />
          </div>

          {/* =================================================
              AI NOTES / QUIZ / AI TUTOR
          ================================================= */}

          <div className="mt-8 w-full min-w-0 max-w-full overflow-hidden rounded-[30px] bg-[#e0e5ec] dark:bg-[#1e2229] p-2 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-3">
            <LessonContentTabs
              courseId={course.id}
              lessonId={currentLesson.id}
              courseTitle={course.title}
              lessonTitle={currentLesson.title}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM LESSON NAVIGATION
      ===================================================== */}

      <div className="w-full min-w-0 border-t border-[#d2d7df] dark:border-[#303640] bg-[#e0e5ec] dark:bg-[#1a1d23] px-3 py-4 sm:px-5">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1e2229] px-4 py-3 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:px-5">
          {/* PREVIOUS */}

          {previousLesson ? (
            <Link
              href={`/learn/${course.slug}?lesson=${previousLesson.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-[20px] bg-[#e0e5ec] dark:bg-[#1e2229] px-3 py-2 text-xs font-semibold text-[#3f3e3e] dark:text-[#a8adb7] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
            >
              <ArrowLeft size={14} />

              Previous lesson
            </Link>
          ) : (
            <div />
          )}

          {/* NEXT */}

          {nextLesson ? (
            <Link
              href={`/learn/${course.slug}?lesson=${nextLesson.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-[20px] bg-[orangered] px-4 py-2.5 text-xs font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
            >
              Next lesson

              <ArrowRight
                size={14}
              />
            </Link>
          ) : (
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-[20px] bg-[orangered] px-4 py-2.5 text-xs font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
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