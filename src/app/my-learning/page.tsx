import ProgressAutoRefresh from "@/components/progress-auto-refresh";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Play,
} from "lucide-react";

import Navbar from "@/components/navbar";

import { db } from "@/db";
import {
  courses,
  lessons,
  progress,
} from "@/db/schema";

import { eq } from "drizzle-orm";

/* =========================================================
   CONVERT DURATION TO SECONDS
========================================================= */

function durationToSeconds(
  duration: string | null | undefined
): number {
  if (!duration) {
    return 0;
  }

  const text =
    duration
      .toLowerCase()
      .trim();

  const hoursMatch =
    text.match(/(\d+)\s*h/);

  const minutesMatch =
    text.match(/(\d+)\s*m/);

  const secondsMatch =
    text.match(/(\d+)\s*s/);

  const hours =
    Number(
      hoursMatch?.[1] || 0
    );

  const minutes =
    Number(
      minutesMatch?.[1] || 0
    );

  const seconds =
    Number(
      secondsMatch?.[1] || 0
    );

  return (
    hours * 60 * 60 +
    minutes * 60 +
    seconds
  );
}

export default async function MyLearningPage() {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // GET COURSES
  // =========================================================

  const enrolledCourses =
    await db
      .select({
        courseId:
          courses.id,

        title:
          courses.title,

        slug:
          courses.slug,

        description:
          courses.description,

        category:
          courses.category,

        level:
          courses.level,

        duration:
          courses.duration,

        lessonsCount:
          courses.lessonsCount,
      })
      .from(courses);

  // =========================================================
  // GET ALL LESSONS
  // =========================================================

  const allLessons =
    await db
      .select()
      .from(lessons)
      .orderBy(
        lessons.order
      );

  // =========================================================
  // GET USER PROGRESS
  //
  // IMPORTANT:
  // watchedSeconds is required for
  // watch-time based progress.
  // =========================================================

  const userProgress =
    await db
      .select({
        lessonId:
          progress.lessonId,

        watchedSeconds:
          progress.watchedSeconds,

        watchPercentage:
          progress.watchPercentage,

        completed:
          progress.completed,

        completedAt:
          progress.completedAt,
      })
      .from(progress)
      .where(
        eq(
          progress.userId,
          user.id
        )
      );

  // =========================================================
  // COMPLETED LESSONS
  // =========================================================

  const completedLessons =
    userProgress.filter(
      (item) =>
        item.completed
    );

  // =========================================================
  // CALCULATE COURSE PROGRESS
  //
  // Progress is based on actual watch time,
  // NOT completed lesson count.
  // =========================================================

  const courseProgress =
    enrolledCourses
      .map(
        (course) => {

          const courseLessons =
            allLessons.filter(
              (lesson) =>
                lesson.courseId ===
                course.courseId
            );

          let totalCourseSeconds =
            0;

          let totalWatchedSeconds =
            0;

          // =================================================
          // TOTAL COURSE DURATION
          // =================================================

          for (
            const lessonItem
            of courseLessons
          ) {

            const lessonDuration =
              durationToSeconds(
                lessonItem.duration
              );

            totalCourseSeconds +=
              lessonDuration;

            // ===============================================
            // USER WATCH PROGRESS
            // ===============================================

            const lessonProgress =
              userProgress.find(
                (item) =>
                  item.lessonId ===
                  lessonItem.id
              );

            const watchedSeconds =
              lessonProgress
                ?.watchedSeconds ??
              0;

            /*
             * Never allow watched time
             * to exceed actual lesson duration.
             */

            if (
              lessonDuration > 0
            ) {

              totalWatchedSeconds +=
                Math.min(
                  watchedSeconds,
                  lessonDuration
                );

            }
          }

          // =================================================
          // COURSE PROGRESS %
          // =================================================

          const percentage =
            totalCourseSeconds > 0
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round(
                      (
                        totalWatchedSeconds /
                        totalCourseSeconds
                      ) *
                        100
                    )
                  )
                )
              : 0;

          // =================================================
          // COMPLETED LESSON COUNT
          // =================================================

          const completed =
            courseLessons.filter(
              (lesson) =>
                userProgress.some(
                  (item) =>
                    item.lessonId ===
                      lesson.id &&
                    item.completed
                )
            ).length;

          // =================================================
          // STARTED COURSE
          //
          // A course is considered started when:
          //
          // 1. User has watched at least 1 second
          // OR
          // 2. User has completed at least one lesson
          // =================================================

          const started =
            totalWatchedSeconds > 0 ||
            completed > 0;

          return {
            ...course,

            completed,

            total:
              courseLessons.length,

            percentage,

            totalCourseSeconds,

            totalWatchedSeconds,

            started,
          };
        }
      )

      // ======================================================
      // ONLY SHOW COURSES THE USER HAS STARTED
      // ======================================================

      .filter(
        (course) =>
          course.started
      );

  // =========================================================
  // AVERAGE PROGRESS
  //
  // Calculated only from started courses.
  // =========================================================

  const averageProgress =
    courseProgress.length > 0
      ? Math.round(
          courseProgress.reduce(
            (sum, course) =>
              sum +
              course.percentage,
            0
          ) /
            courseProgress.length
        )
      : 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-[#e0e5ec] text-black">

      {/* =====================================================
          AUTO REFRESH
      ===================================================== */}

      <ProgressAutoRefresh />

      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

          <div>

            <p className="text-sm font-semibold tracking-wide text-[orangered]">
              YOUR LEARNING
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My Learning
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#3f3e3e] sm:text-base">
              Continue your courses and track your progress.
            </p>

          </div>

          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 rounded-[12px] bg-[orangered] px-5 py-3 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.3)]"
          >
            <BookOpen size={17} />
            Browse courses
          </Link>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mt-8 grid gap-5 sm:grid-cols-3">

          {/* =================================================
              COURSES STARTED
          ================================================= */}

          <div className="rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
              <BookOpen size={19} />
            </div>

            <p className="mt-4 text-sm text-[#3f3e3e]">
              Courses started
            </p>

            <p className="mt-1 text-3xl font-bold">
              {courseProgress.length}
            </p>

          </div>

          {/* =================================================
              COMPLETED LESSONS
          ================================================= */}

          <div className="rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
              <CheckCircle2 size={19} />
            </div>

            <p className="mt-4 text-sm text-[#3f3e3e]">
              Lessons completed
            </p>

            <p className="mt-1 text-3xl font-bold">
              {completedLessons.length}
            </p>

          </div>

          {/* =================================================
              AVERAGE PROGRESS
          ================================================= */}

          <div className="rounded-[20px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">

            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
              <Clock3 size={19} />
            </div>

            <p className="mt-4 text-sm text-[#3f3e3e]">
              Average progress
            </p>

            <p className="mt-1 text-3xl font-bold">
              {averageProgress}%
            </p>

          </div>

        </div>

        {/* =================================================
            COURSE LIST
        ================================================= */}

        <section className="mt-10">

          <div>

            <h2 className="text-xl font-bold">
              Your courses
            </h2>

            <p className="mt-1 text-sm text-[#3f3e3e]">
              Courses you've started appear here.
            </p>

          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {courseProgress.length === 0 ? (

            <div className="mt-6 rounded-[20px] bg-[#e0e5ec] p-10 text-center shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] sm:p-12">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-5 font-bold">
                No courses started yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#3f3e3e]">
                Start watching a course and it will appear here automatically.
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-[12px] bg-[orangered] px-5 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.3)]"
              >
                Explore courses
                <ArrowRight size={15} />
              </Link>

            </div>

          ) : (

            <div className="mt-6 space-y-5">

              {courseProgress.map(
                (course) => (

                  <div
                    key={
                      course.courseId
                    }
                    className="overflow-hidden rounded-[20px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300"
                  >

                    <div className="grid md:grid-cols-[190px_1fr]">

                      {/* ===================================
                          COURSE VISUAL
                      =================================== */}

                      <div className="flex min-h-[190px] items-center justify-center bg-[#e0e5ec] p-6 shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]">

                        <div className="text-center">

                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[orangered] text-white shadow-[5px_5px_12px_rgba(79,70,229,0.25),-5px_-5px_12px_rgba(255,255,255,0.8)]">
                            <BookOpen size={25} />
                          </div>

                          <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-[#3f3e3e]">
                            {course.category}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-black">
                            {course.level}
                          </p>

                        </div>

                      </div>

                      {/* ===================================
                          COURSE INFORMATION
                      =================================== */}

                      <div className="p-6 sm:p-7">

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                          <div className="min-w-0">

                            <span className="inline-flex rounded-full bg-[#e0e5ec] px-3 py-1 text-xs font-semibold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                              {course.category}
                            </span>

                            <h3 className="mt-3 text-xl font-bold leading-tight sm:text-2xl">
                              {course.title}
                            </h3>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3f3e3e]">
                              {course.description}
                            </p>

                          </div>

                          <span className="shrink-0 text-sm font-bold text-[orangered]">
                            {course.percentage}%
                          </span>

                        </div>

                        {/* =================================
                            PROGRESS BAR
                        ================================= */}

                        <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">

                          <div
                            className="h-full rounded-full bg-[orangered] transition-all duration-300"
                            style={{
                              width: `${course.percentage}%`,
                            }}
                          />

                        </div>

                        {/* =================================
                            COURSE DETAILS
                        ================================= */}

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                          <div className="flex items-center gap-4 text-xs text-[#3f3e3e]">

                            <span>
                              {course.completed}{" "}
                              /{" "}
                              {course.total}{" "}
                              lessons
                            </span>

                            <span>
                              {course.duration}
                            </span>

                          </div>

                          <Link
                            href={`/learn/${course.slug}`}
                            className="flex items-center gap-2 rounded-[12px] bg-[orangered] px-4 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.3)]"
                          >

                            <Play
                              size={15}
                              fill="currentColor"
                            />

                            Continue

                          </Link>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}