import ProgressAutoRefresh from "@/components/progress-auto-refresh";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Clock3,
  Play,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
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

  const text = duration.toLowerCase().trim();

  const hoursMatch = text.match(/(\d+)\s*h/);
  const minutesMatch = text.match(/(\d+)\s*m/);
  const secondsMatch = text.match(/(\d+)\s*s/);

  const hours = Number(hoursMatch?.[1] || 0);
  const minutes = Number(minutesMatch?.[1] || 0);
  const seconds = Number(secondsMatch?.[1] || 0);

  return hours * 60 * 60 + minutes * 60 + seconds;
}

export default async function DashboardPage() {
  /* =========================================================
     GET CURRENT USER
  ========================================================= */

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ADMIN users must use the admin dashboard
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  /* =========================================================
     GET ALL COURSES
  ========================================================= */

  const allCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      category: courses.category,
      level: courses.level,
      duration: courses.duration,
      lessonsCount: courses.lessonsCount,
      thumbnailUrl: courses.thumbnailUrl,
    })
    .from(courses);

  /* =========================================================
     GET USER PROGRESS
  ========================================================= */

  const userProgress = await db
    .select({
      lessonId: progress.lessonId,
      watchedSeconds: progress.watchedSeconds,
      watchPercentage: progress.watchPercentage,
      completed: progress.completed,
      completedAt: progress.completedAt,
    })
    .from(progress)
    .where(eq(progress.userId, user.id));

  /* =========================================================
     COMPLETED LESSONS
  ========================================================= */

  const completedLessonIds = new Set(
    userProgress
      .filter((item) => item.completed)
      .map((item) => item.lessonId)
  );

  const completedLessonsCount = completedLessonIds.size;

  /* =========================================================
     GET QUIZ ATTEMPTS
  ========================================================= */

  const userQuizAttempts = await db
    .select({
      score: quizAttempts.score,
      totalQuestions: quizAttempts.totalQuestions,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, user.id));

  const quizzesCompleted = userQuizAttempts.length;

  /* =========================================================
     AVERAGE QUIZ SCORE
  ========================================================= */

  let averageQuizScore = 0;

  if (userQuizAttempts.length > 0) {
    const validAttempts = userQuizAttempts.filter(
      (attempt) => attempt.totalQuestions > 0
    );

    if (validAttempts.length > 0) {
      const totalPercentage = validAttempts.reduce(
        (total, attempt) =>
          total +
          (attempt.score / attempt.totalQuestions) * 100,
        0
      );

      averageQuizScore = Math.round(
        totalPercentage / validAttempts.length
      );
    }
  }

  /* =========================================================
     GET ALL LESSONS
  ========================================================= */

  const allLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      courseId: lessons.courseId,
      duration: lessons.duration,
      order: lessons.order,
    })
    .from(lessons)
    .orderBy(lessons.order);

  /* =========================================================
     CALCULATE COURSE PROGRESS
  ========================================================= */

  const courseProgress = allCourses.map((course) => {
    const courseLessons = allLessons.filter(
      (lesson) => lesson.courseId === course.id
    );

    let totalCourseSeconds = 0;
    let totalWatchedSeconds = 0;

    for (const lessonItem of courseLessons) {
      const lessonDuration = durationToSeconds(
        lessonItem.duration
      );

      totalCourseSeconds += lessonDuration;

      const lessonProgress = userProgress.find(
        (item) => item.lessonId === lessonItem.id
      );

      const watchedSeconds =
        lessonProgress?.watchedSeconds ?? 0;

      if (lessonDuration > 0) {
        totalWatchedSeconds += Math.min(
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
              (totalWatchedSeconds / totalCourseSeconds) *
              100
            )
          )
        )
        : 0;

    const completed = courseLessons.filter((lesson) =>
      completedLessonIds.has(lesson.id)
    ).length;

    return {
      course,
      lessons: courseLessons,
      completed,
      total: courseLessons.length,
      percentage,
      totalCourseSeconds,
      totalWatchedSeconds,
    };
  });

  /* =========================================================
     FIND CURRENT COURSE
  ========================================================= */

  // Only show a course here if the user has genuinely started it
  // and it still has unfinished lessons. Never default to the first course.
  let currentCourse: (typeof allCourses)[number] | null = null;

  let currentCourseProgress = 0;
  let currentCourseCompleted = 0;
  let currentCourseTotal = 0;

  let currentLesson: (typeof allLessons)[number] | null = null;

  const startedUnfinishedCourses = courseProgress
    .filter(
      (item) =>
        (item.totalWatchedSeconds > 0 || item.completed > 0) &&
        item.percentage < 100
    )
    .sort(
      (a, b) =>
        b.totalWatchedSeconds - a.totalWatchedSeconds
    );

  if (startedUnfinishedCourses.length > 0) {
    const selected = startedUnfinishedCourses[0];

    currentCourse = selected.course;
    currentCourseProgress = selected.percentage;
    currentCourseCompleted = selected.completed;
    currentCourseTotal = selected.total;
  }

  /* =========================================================
     FIND NEXT LESSON
  ========================================================= */

  if (currentCourse) {
    const currentCourseLessons = allLessons
      .filter(
        (lesson) => lesson.courseId === currentCourse!.id
      )
      .sort((a, b) => a.order - b.order);

    const unfinishedLesson = currentCourseLessons.find(
      (lesson) => {
        const lessonProgress = userProgress.find(
          (item) => item.lessonId === lesson.id
        );

        return !lessonProgress?.completed;
      }
    );

    if (unfinishedLesson) {
      currentLesson = unfinishedLesson;
    } else {
      currentLesson =
        currentCourseLessons[
        currentCourseLessons.length - 1
        ] ?? null;
    }
  }

  /* =========================================================
     RECOMMENDED COURSES
  ========================================================= */

  const recommendedCourses = allCourses
    .filter(
      (course) =>
        !currentCourse ||
        course.id !== currentCourse.id
    )
    .slice(0, 3);

  /* =========================================================
     FALLBACK
  ========================================================= */

  if (
    recommendedCourses.length === 0 &&
    currentCourse
  ) {
    recommendedCourses.push(currentCourse);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#e0e5ec] text-black dark:bg-[#1a1d23] dark:text-[#f5f7fa]">
      <ProgressAutoRefresh />

      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* HEADER */}

        <div className="flex min-w-0 flex-col justify-between gap-4 sm:gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[orangered]">
              Learning dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black dark:text-[#f5f7fa] sm:text-4xl">
              Hello, {user.name} 👋
            </h1>

            <p className="mt-2 text-[#3f3e3e] dark:text-[#a8adb7]">
              Keep going. You&apos;re making progress.
            </p>
          </div>

          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 rounded-[20px] bg-[orangered] px-5 py-3 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]"
          >
            <Search size={17} />
            Find a course
          </Link>
        </div>

        {/* LEARNING STATISTICS */}

        <div className="mt-6 grid min-w-0 grid-cols-2 gap-3 sm:mt-8 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* COURSES STARTED */}

          <div className="rounded-[24px] bg-[#e0e5ec] p-3 sm:rounded-[30px] sm:p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                Courses started
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                <BookOpen size={17} />
              </div>
            </div>

            <p className="mt-4 text-2xl sm:text-3xl font-bold text-black dark:text-[#f5f7fa]">
              {
                courseProgress.filter(
                  (item) =>
                    item.totalWatchedSeconds > 0 ||
                    item.completed > 0
                ).length
              }
            </p>

            <p className="mt-1 text-[11px] sm:text-xs text-[#3f3e3e] dark:text-[#a8adb7]/70">
              Courses you&apos;ve started
            </p>
          </div>

          {/* LESSONS COMPLETED */}

          <div className="rounded-[24px] bg-[#e0e5ec] p-3 sm:rounded-[30px] sm:p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                Lessons completed
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                <Clock3 size={17} />
              </div>
            </div>

            <p className="mt-4 text-2xl sm:text-3xl font-bold text-black dark:text-[#f5f7fa]">
              {completedLessonsCount}
            </p>

            <p className="mt-1 text-[11px] sm:text-xs text-[#3f3e3e] dark:text-[#a8adb7]/70">
              Across all courses
            </p>
          </div>

          {/* QUIZZES COMPLETED */}

          <div className="rounded-[24px] bg-[#e0e5ec] p-3 sm:rounded-[30px] sm:p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                Quizzes completed
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                <Trophy size={17} />
              </div>
            </div>

            <p className="mt-4 text-2xl sm:text-3xl font-bold text-black dark:text-[#f5f7fa]">
              {quizzesCompleted}
            </p>

            <p className="mt-1 text-[11px] sm:text-xs text-[#3f3e3e] dark:text-[#a8adb7]/70">
              {quizzesCompleted > 0
                ? `${averageQuizScore}% average score`
                : "No quizzes completed yet"}
            </p>
          </div>
          {/* INTERVIEW PRACTICE */}

          <Link
            href="/interviews"
            className="block rounded-[24px] bg-[#e0e5ec] p-3 sm:rounded-[30px] sm:p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-200 hover:-translate-y-1 dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                Interview practice
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                <Users size={17} />
              </div>
            </div>

            <p className="mt-4 text-2xl font-bold text-black dark:text-[#f5f7fa]">
              Start now
            </p>

            <p className="mt-1 text-[11px] sm:text-xs text-[#3f3e3e] dark:text-[#a8adb7]/70">
              Practice mock interviews 
            </p>
          </Link>
        </div>

        {/* CONTINUE LEARNING */}

        <section className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-black dark:text-[#f5f7fa]">
                Continue learning
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]/70">
                Pick up where you left off.
              </p>
            </div>

            <Link
              href="/my-learning"
              className="hidden items-center gap-1 text-sm font-semibold text-[orangered] transition hover:text-[red] sm:flex"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* CURRENT COURSE */}

          {currentCourse ? (
            <div className="mt-4 sm:mt-5 min-w-0 overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#e0e5ec] shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[14px_14px_28px_rgba(5,7,10,0.8),-14px_-14px_28px_rgba(43,48,58,0.8)]">
              <div className="grid min-w-0 md:grid-cols-[190px_minmax(0,1fr)]">
                {/* COURSE VISUAL */}

                <div className="mx-3 mt-3 flex min-h-[112px] items-center justify-center md:m-3 md:min-h-[190px] rounded-[24px] bg-[#e0e5ec] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)] md:m-4">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                      <BookOpen size={25} />
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f3e3e] dark:text-[#a8adb7]/60">
                      Current course
                    </p>

                    
                  </div>
                </div>

                {/* COURSE INFORMATION */}

                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-[#e0e5ec] px-2.5 py-1 text-xs font-semibold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                        {currentCourse.category}
                      </span>

                      <h3 className="mt-3 break-words text-lg sm:text-xl font-bold text-black dark:text-[#f5f7fa]">
                        {currentCourse.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]/70">
                        {currentLesson?.title ??
                          "Start this course"}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-[orangered]">
                      {currentCourseProgress}%
                    </span>
                  </div>

                  {/* PROGRESS */}

                  <div
                    className="mt-4 sm:mt-6 h-3 overflow-hidden rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]"
                    role="progressbar"
                    aria-label="Course progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={currentCourseProgress}
                  >
                    <div
                      className="h-full rounded-full bg-[orangered] transition-all"
                      style={{
                        width: `${currentCourseProgress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <p className="text-[11px] sm:text-xs text-[#3f3e3e] dark:text-[#a8adb7]/70">
                      {currentCourseCompleted} of{" "}
                      {currentCourseTotal} lessons completed
                    </p>

                    <Link
                      href={`/learn/${currentCourse.slug}`}
                      className="flex items-center gap-2 rounded-[20px] bg-[orangered] px-3 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]"
                    >
                      <Play size={15} fill="currentColor" />
                      Continue
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 sm:mt-5 rounded-[24px] sm:rounded-[30px] bg-[#e0e5ec] p-6 sm:p-10 text-center shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7]/50 dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                <BookOpen size={30} />
              </div>

              <h3 className="mt-4 font-semibold text-black dark:text-[#f5f7fa]">
                Ready to start learning?
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]/70">
                You haven&apos;t started a course yet. Browse the catalog and choose your first course.
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-[20px] bg-[orangered] px-3 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]"
              >
                Find courses
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>

        {/* PRACTICE & CAREER PREPARATION */}

        <section className="mt-8 sm:mt-12 min-w-0">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[orangered]">
              Build your skills
            </p>

            <h2 className="mt-2 text-2xl font-bold text-black dark:text-[#f5f7fa]">
              Practice & career preparation
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
              Test your knowledge and prepare for your next career opportunity.
            </p>
          </div>

          <div className="mt-4 sm:mt-5 grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2">
            {/* QUIZ PRACTICE */}

            <Link
              href="/quizzes"
              className="group flex min-h-[190px] min-w-0 flex-col justify-between rounded-[24px] sm:rounded-[30px] bg-[#e0e5ec] p-5 sm:min-h-[210px] sm:p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_22px_rgba(163,177,198,0.65),-12px_-12px_22px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] dark:hover:shadow-[12px_12px_22px_rgba(5,7,10,0.8),-12px_-12px_22px_rgba(43,48,58,0.8)]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                  <Trophy size={23} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-black dark:text-[#f5f7fa]">
                  Quiz practice
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                  Test your understanding of programming and computer science
                  with topic-based quizzes and track your performance.
                </p>
              </div>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[orangered]">
                Start practising
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>

            {/* INTERVIEW PREPARATION */}

            <Link
              href="/interviews"
              className="group flex min-h-[190px] min-w-0 flex-col justify-between rounded-[24px] sm:rounded-[30px] bg-[#e0e5ec] p-5 sm:min-h-[210px] sm:p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_22px_rgba(163,177,198,0.65),-12px_-12px_22px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] dark:hover:shadow-[12px_12px_22px_rgba(5,7,10,0.8),-12px_-12px_22px_rgba(43,48,58,0.8)]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                  <Target size={23} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-black dark:text-[#f5f7fa]">
                  Interview preparation
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                  Practise aptitude, coding, technical, project and HR interview rounds with AI-powered interview feedback.
                </p>
              </div>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[orangered]">
                Start interview practice
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        {/* RECOMMENDED COURSES */}

        <section className="mt-8 pb-8 sm:mt-12 sm:pb-10 min-w-0">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-black dark:text-[#f5f7fa]">
                Recommended for you
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-[#3f3e3e] dark:text-[#a8adb7]/70">
                Explore more courses from CourseGuide.
              </p>
            </div>

            <Link
              href="/courses"
              className="hidden items-center gap-1 text-sm font-semibold text-[orangered] transition hover:text-[red] sm:flex"
            >
              Browse all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-4 sm:mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="group min-w-0 overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#e0e5ec] p-2 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:-translate-y-1 dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]"
              >
                {/* COURSE THUMBNAIL */}

                <div className="relative h-48 sm:h-55 overflow-hidden rounded-[24px] bg-[#e0e5ec] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                        {course.category === "Programming" ? (
                          <BookOpen size={23} />
                        ) : course.category === "Computer Science" ? (
                          <Target size={23} />
                        ) : (
                          <Sparkles size={23} />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* COURSE CONTENT */}

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[orangered]">
                      {course.category}
                    </span>

                    <span className="text-xs text-[#3f3e3e] dark:text-[#a8adb7]/60">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 font-bold text-black dark:text-[#f5f7fa]">
                    {course.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#3f3e3e] dark:text-[#a8adb7]/65">
                    <span>{course.lessonsCount} lessons</span>
                    <span>{course.duration}</span>
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[orangered] py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]"
                  >
                    View course
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
