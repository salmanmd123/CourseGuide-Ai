import ProgressAutoRefresh from "@/components/progress-auto-refresh";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Clock3,
  Flame,
  Play,
  Search,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  courses,
  lessons,
  progress,
  quizAttempts,
} from "@/db/schema";

import Navbar from "@/components/navbar";

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

export default async function DashboardPage() {
  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // GET ALL COURSES
  // =========================================================

  const allCourses =
    await db
      .select()
      .from(courses);

  // =========================================================
  // GET USER PROGRESS
  //
  // IMPORTANT:
  // watchedSeconds is included now.
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

  const completedLessonsCount =
    completedLessonIds.size;

  // =========================================================
  // GET QUIZ ATTEMPTS
  // =========================================================

  const userQuizAttempts =
    await db
      .select()
      .from(quizAttempts)
      .where(
        eq(
          quizAttempts.userId,
          user.id
        )
      );

  const quizzesCompleted =
    userQuizAttempts.length;

  // =========================================================
  // AVERAGE QUIZ SCORE
  // =========================================================

  let averageQuizScore = 0;

  if (
    userQuizAttempts.length >
    0
  ) {
    const validAttempts =
      userQuizAttempts.filter(
        (attempt) =>
          attempt.totalQuestions >
          0
      );

    if (
      validAttempts.length >
      0
    ) {
      const totalPercentage =
        validAttempts.reduce(
          (total, attempt) =>
            total +
            (
              attempt.score /
              attempt.totalQuestions
            ) *
            100,
          0
        );

      averageQuizScore =
        Math.round(
          totalPercentage /
          validAttempts.length
        );
    }
  }

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
  // CALCULATE COURSE PROGRESS
  //
  // Progress is based on:
  //
  // total watched seconds
  // -------------------- × 100
  // total course duration
  // =========================================================

  const courseProgress =
    allCourses.map(
      (course) => {
        const courseLessons =
          allLessons.filter(
            (lesson) =>
              lesson.courseId ===
              course.id
          );

        let totalCourseSeconds =
          0;

        let totalWatchedSeconds =
          0;

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
           * to exceed duration.
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

        const completed =
          courseLessons.filter(
            (lesson) =>
              completedLessonIds.has(
                lesson.id
              )
          ).length;

        return {
          course,
          lessons:
            courseLessons,
          completed,
          total:
            courseLessons.length,
          percentage,
          totalCourseSeconds,
          totalWatchedSeconds,
        };
      }
    );

  // =========================================================
  // FIND CURRENT COURSE
  //
  // Prefer the course with the highest actual watch progress.
  // =========================================================

  let currentCourse =
    allCourses.length > 0
      ? allCourses[0]
      : null;

  let currentCourseProgress =
    0;

  let currentCourseCompleted =
    0;

  let currentCourseTotal =
    0;

  let currentLesson = null;

  if (
    courseProgress.length >
    0
  ) {
    /*
     * Courses the user has actually started.
     *
     * We use watched seconds rather than
     * completed lesson count.
     */
    const startedCourses =
      courseProgress.filter(
        (item) =>
          item.totalWatchedSeconds >
          0 &&
          item.percentage < 100
      );

    if (
      startedCourses.length >
      0
    ) {
      startedCourses.sort(
        (a, b) =>
          b.totalWatchedSeconds -
          a.totalWatchedSeconds
      );

      const selected =
        startedCourses[0];

      currentCourse =
        selected.course;

      currentCourseProgress =
        selected.percentage;

      currentCourseCompleted =
        selected.completed;

      currentCourseTotal =
        selected.total;
    } else {
      /*
       * If nothing has been started,
       * use first course.
       */
      const first =
        courseProgress[0];

      currentCourse =
        first.course;

      currentCourseProgress =
        first.percentage;

      currentCourseCompleted =
        first.completed;

      currentCourseTotal =
        first.total;
    }
  }

  // =========================================================
  // FIND NEXT LESSON
  //
  // Prefer the first unfinished lesson.
  // Otherwise resume the last lesson.
  // =========================================================

  if (
    currentCourse
  ) {
    const currentCourseLessons =
      allLessons
        .filter(
          (lesson) =>
            lesson.courseId ===
            currentCourse!.id
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );

    /*
     * First lesson that isn't 90%+ complete.
     */
    const unfinishedLesson =
      currentCourseLessons.find(
        (lesson) => {
          const lessonProgress =
            userProgress.find(
              (item) =>
                item.lessonId ===
                lesson.id
            );

          return !lessonProgress
            ?.completed;
        }
      );

    if (
      unfinishedLesson
    ) {
      currentLesson =
        unfinishedLesson;
    } else {
      /*
       * Everything completed:
       * resume last lesson.
       */
      currentLesson =
        currentCourseLessons[
        currentCourseLessons.length -
        1
        ] ?? null;
    }
  }

  // =========================================================
  // RECOMMENDED COURSES
  // =========================================================

  const recommendedCourses =
    allCourses
      .filter(
        (course) =>
          !currentCourse ||
          course.id !==
          currentCourse.id
      )
      .slice(0, 3);

  // =========================================================
  // FALLBACK
  // =========================================================

  if (
    recommendedCourses.length ===
    0 &&
    currentCourse
  ) {
    recommendedCourses.push(
      currentCourse
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">

      <ProgressAutoRefresh />
      
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              LEARNING DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Good morning, {user.name} 👋
            </h1>

            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Keep going. You're making progress.
            </p>

          </div>

          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Search size={17} />
            Find a course
          </Link>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* STREAK */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center justify-between">

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Learning streak
              </p>

              <Flame
                size={19}
                className="text-orange-500"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              —
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Streak tracking coming soon
            </p>

          </div>

          {/* COURSES */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center justify-between">

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Courses available
              </p>

              <BookOpen
                size={19}
                className="text-indigo-600 dark:text-indigo-400"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {allCourses.length}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Courses in CourseGuide
            </p>

          </div>

          {/* LESSONS */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center justify-between">

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Lessons completed
              </p>

              <Clock3
                size={19}
                className="text-emerald-600 dark:text-emerald-400"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {completedLessonsCount}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Across all courses
            </p>

          </div>

          {/* QUIZZES */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center justify-between">

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Quizzes completed
              </p>

              <Trophy
                size={19}
                className="text-amber-500"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {quizzesCompleted}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              {quizzesCompleted > 0
                ? `${averageQuizScore}% average score`
                : "No quizzes completed yet"}
            </p>

          </div>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* =================================================
              CONTINUE LEARNING
          ================================================= */}

          <section>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Continue learning
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Pick up where you left off.
                </p>

              </div>

              <Link
                href="/courses"
                className="hidden items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 sm:flex"
              >
                View all
                <ArrowRight size={15} />
              </Link>

            </div>

            {/* CURRENT COURSE */}

            {currentCourse ? (

              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

                <div className="grid md:grid-cols-[190px_1fr]">

                  {/* COURSE VISUAL */}

                  <div className="flex min-h-[190px] items-center justify-center bg-zinc-950 dark:bg-black">

                    <div className="text-center text-white">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
                        <BookOpen size={25} />
                      </div>

                      <p className="mt-4 text-xs font-medium text-zinc-400">
                        CURRENT COURSE
                      </p>

                      <p className="mt-1 px-4 text-sm font-semibold">
                        {currentCourse.title}
                      </p>

                    </div>

                  </div>

                  {/* COURSE INFORMATION */}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {currentCourse.category}
                        </span>

                        <h3 className="mt-3 text-xl font-bold">
                          {currentCourse.title}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {currentLesson?.title ??
                            "Start this course"}
                        </p>

                      </div>

                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {currentCourseProgress}%
                      </span>

                    </div>

                    {/* PROGRESS BAR */}

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">

                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${currentCourseProgress}%`,
                        }}
                      />

                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                      <p className="text-xs text-zinc-400">
                        {currentCourseCompleted}{" "}
                        of{" "}
                        {currentCourseTotal}{" "}
                        lessons completed
                      </p>

                      <Link
                        href={`/learn/${currentCourse.slug}`}
                        className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
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

            ) : (

              <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">

                <BookOpen
                  className="mx-auto text-zinc-400"
                  size={30}
                />

                <h3 className="mt-4 font-semibold">
                  No courses available
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Search for a course to get started.
                </p>

                <Link
                  href="/courses"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
                >
                  Find courses
                  <ArrowRight size={15} />
                </Link>

              </div>

            )}

          </section>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside>

            {/* DAILY GOAL */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-bold">
                    Today's goal
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Keep learning consistently
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Target size={19} />
                </div>

              </div>

              <div className="mt-7 flex items-center gap-5">

                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[8px] border-indigo-600">

                  <div className="text-center">

                    <p className="text-xl font-bold">
                      {currentLesson
                        ? "1"
                        : "0"}
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      LESSON
                    </p>

                  </div>

                </div>

                <div>

                  <p className="text-sm font-semibold">
                    {currentLesson
                      ? "Keep going!"
                      : "You're all caught up!"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {currentLesson
                      ? `Next: ${currentLesson.title}`
                      : "Complete a course to keep your progress growing."}
                  </p>

                </div>

              </div>

              {currentCourse && (

                <Link
                  href={`/learn/${currentCourse.slug}`}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Start learning
                  <ArrowRight size={16} />
                </Link>

              )}

            </div>

            {/* AI SUGGESTION */}

            <div className="mt-4 rounded-2xl bg-indigo-600 p-6 text-white">

              <Sparkles size={20} />

              <h3 className="mt-4 font-bold">
                Your AI learning tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-indigo-100">
                {currentLesson
                  ? `Continue with "${currentLesson.title}" to keep building your skills.`
                  : "Explore a course and start learning something new today."}
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition hover:text-indigo-100"
              >
                Explore courses
                <ArrowRight size={15} />
              </Link>

            </div>

          </aside>

        </div>

        {/* =================================================
            RECOMMENDED COURSES
        ================================================= */}

        <section className="mt-12 pb-10">

          <div className="flex items-end justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Recommended for you
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Explore more courses from CourseGuide.
              </p>

            </div>

            <Link
              href="/courses"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 sm:flex"
            >
              Browse all
              <ArrowRight size={15} />
            </Link>

          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            {recommendedCourses.map(
              (course) => (

                <div
                  key={course.id}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-2xl"
                >

                  {/* COURSE IMAGE */}

                  <div className="flex h-36 items-center justify-center bg-zinc-100 dark:bg-zinc-800">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400">

                      {course.category ===
                        "Programming" ? (

                        <BookOpen size={23} />

                      ) : course.category ===
                        "Computer Science" ? (

                        <Target size={23} />

                      ) : (

                        <Sparkles size={23} />

                      )}

                    </div>

                  </div>

                  {/* COURSE CONTENT */}

                  <div className="p-5">

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {course.category}
                      </span>

                      <span className="text-xs text-zinc-400">
                        {course.level}
                      </span>

                    </div>

                    <h3 className="mt-3 line-clamp-2 font-bold">
                      {course.title}
                    </h3>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">

                      <span>
                        {course.lessonsCount}{" "}
                        lessons
                      </span>

                      <span>
                        {course.duration}
                      </span>

                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition group-hover:border-zinc-950 group-hover:bg-zinc-950 group-hover:text-white dark:border-zinc-700 dark:text-zinc-300 dark:group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-zinc-950"
                    >
                      View course
                      <ArrowRight size={15} />
                    </Link>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </div>

    </main>
  );
}