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
  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ADMIN users must use the admin dashboard
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  // =========================================================
  // GET ALL COURSES
  // =========================================================

  const allCourses = await db.select().from(courses);

  // =========================================================
  // GET USER PROGRESS
  // =========================================================

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

  // =========================================================
  // COMPLETED LESSONS
  // =========================================================

  const completedLessonIds = new Set(
    userProgress
      .filter((item) => item.completed)
      .map((item) => item.lessonId)
  );

  const completedLessonsCount = completedLessonIds.size;

  // =========================================================
  // GET QUIZ ATTEMPTS
  // =========================================================

  const userQuizAttempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, user.id));

  const quizzesCompleted = userQuizAttempts.length;

  // =========================================================
  // AVERAGE QUIZ SCORE
  // =========================================================

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

  // =========================================================
  // GET ALL LESSONS
  // =========================================================

  const allLessons = await db
    .select()
    .from(lessons)
    .orderBy(lessons.order);

  // =========================================================
  // CALCULATE COURSE PROGRESS
  // =========================================================

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

  // =========================================================
  // FIND CURRENT COURSE
  // =========================================================

  let currentCourse =
    allCourses.length > 0 ? allCourses[0] : null;

  let currentCourseProgress = 0;
  let currentCourseCompleted = 0;
  let currentCourseTotal = 0;

  let currentLesson = null;

  if (courseProgress.length > 0) {
    const startedCourses = courseProgress.filter(
      (item) =>
        item.totalWatchedSeconds > 0 &&
        item.percentage < 100
    );

    if (startedCourses.length > 0) {
      startedCourses.sort(
        (a, b) =>
          b.totalWatchedSeconds -
          a.totalWatchedSeconds
      );

      const selected = startedCourses[0];

      currentCourse = selected.course;
      currentCourseProgress = selected.percentage;
      currentCourseCompleted = selected.completed;
      currentCourseTotal = selected.total;
    } else {
      const first = courseProgress[0];

      currentCourse = first.course;
      currentCourseProgress = first.percentage;
      currentCourseCompleted = first.completed;
      currentCourseTotal = first.total;
    }
  }

  // =========================================================
  // FIND NEXT LESSON
  // =========================================================

  if (currentCourse) {
    const currentCourseLessons = allLessons
      .filter(
        (lesson) =>
          lesson.courseId === currentCourse!.id
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

  // =========================================================
  // RECOMMENDED COURSES
  // =========================================================

  const recommendedCourses = allCourses
    .filter(
      (course) =>
        !currentCourse ||
        course.id !== currentCourse.id
    )
    .slice(0, 3);

  // =========================================================
  // FALLBACK
  // =========================================================

  if (
    recommendedCourses.length === 0 &&
    currentCourse
  ) {
    recommendedCourses.push(currentCourse);
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#e0e5ec] text-black">
      <ProgressAutoRefresh />

      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[orangered]">
              Learning dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Hello, {user.name} 👋
            </h1>

            <p className="mt-2 text-[#3f3e3e]">
              Keep going. You're making progress.
            </p>
          </div>

          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 rounded-[20px] bg-[orangered] px-5 py-3 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)]"
          >
            <Search size={17} />
            Find a course
          </Link>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* STREAK */}

          <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#3f3e3e]">
                Learning streak
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <Flame size={17} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              —
            </p>

            <p className="mt-1 text-xs text-[#3f3e3e]/70">
              Streak tracking coming soon
            </p>
          </div>

          {/* COURSES STARTED */}

          <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#3f3e3e]">
                Courses started
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <BookOpen size={17} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              {
                courseProgress.filter(
                  (item) =>
                    item.totalWatchedSeconds > 0 ||
                    item.completed > 0
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-[#3f3e3e]/70">
              Courses you've started
            </p>
          </div>

          {/* LESSONS */}

          <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#3f3e3e]">
                Lessons completed
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <Clock3 size={17} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              {completedLessonsCount}
            </p>

            <p className="mt-1 text-xs text-[#3f3e3e]/70">
              Across all courses
            </p>
          </div>

          {/* QUIZZES */}

          <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#3f3e3e]">
                Quizzes completed
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <Trophy size={17} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-black">
              {quizzesCompleted}
            </p>

            <p className="mt-1 text-xs text-[#3f3e3e]/70">
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
                <h2 className="text-xl font-bold text-black">
                  Continue learning
                </h2>

                <p className="mt-1 text-sm text-[#3f3e3e]/70">
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
              <div className="mt-5 overflow-hidden rounded-[30px] bg-[#e0e5ec] shadow-[14px_14px_28px_rgba(163,177,198,0.6),-14px_-14px_28px_rgba(255,255,255,0.8)]">
                <div className="grid md:grid-cols-[190px_1fr]">
                  {/* COURSE VISUAL */}

                  <div className="m-3 flex min-h-[190px] items-center justify-center rounded-[24px] bg-[#e0e5ec] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] md:m-4">
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                        <BookOpen size={25} />
                      </div>

                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3f3e3e]/60">
                        Current course
                      </p>

                      <p className="mt-1 px-4 text-sm font-semibold text-black">
                        {currentCourse.title}
                      </p>
                    </div>
                  </div>

                  {/* COURSE INFORMATION */}

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-[#e0e5ec] px-2.5 py-1 text-xs font-semibold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                          {currentCourse.category}
                        </span>

                        <h3 className="mt-3 text-xl font-bold text-black">
                          {currentCourse.title}
                        </h3>

                        <p className="mt-2 text-sm text-[#3f3e3e]/70">
                          {currentLesson?.title ??
                            "Start this course"}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-[orangered]">
                        {currentCourseProgress}%
                      </span>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                      <div
                        className="h-full rounded-full bg-[orangered] transition-all"
                        style={{
                          width: `${currentCourseProgress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-[#3f3e3e]/70">
                        {currentCourseCompleted} of{" "}
                        {currentCourseTotal} lessons completed
                      </p>

                      <Link
                        href={`/learn/${currentCourse.slug}`}
                        className="flex items-center gap-2 rounded-[20px] bg-[orangered] px-4 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)]"
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
              <div className="mt-5 rounded-[30px] bg-[#e0e5ec] p-10 text-center shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e]/50 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                  <BookOpen size={30} />
                </div>

                <h3 className="mt-4 font-semibold text-black">
                  No courses available
                </h3>

                <p className="mt-2 text-sm text-[#3f3e3e]/70">
                  Search for a course to get started.
                </p>

                <Link
                  href="/courses"
                  className="mt-5 inline-flex items-center gap-2 rounded-[20px] bg-[orangered] px-4 py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red]"
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

            <div className="rounded-[30px] bg-[#e0e5ec] p-5 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-black">
                    Today's goal
                  </h2>

                  <p className="mt-1 text-xs text-[#3f3e3e]/70">
                    Keep learning consistently
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                  <Target size={19} />
                </div>
              </div>

              <div className="mt-7 flex items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
                  <div className="absolute inset-2 rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]" />

                  <div className="relative z-10 text-center">
                    <p className="text-xl font-bold text-black">
                      {currentLesson ? "1" : "0"}
                    </p>

                    <p className="text-[10px] text-[#3f3e3e]/60">
                      LESSON
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black">
                    {currentLesson
                      ? "Keep going!"
                      : "You're all caught up!"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#3f3e3e]/70">
                    {currentLesson
                      ? `Next: ${currentLesson.title}`
                      : "Complete a course to keep your progress growing."}
                  </p>
                </div>
              </div>

              {currentCourse && (
                <Link
                  href={`/learn/${currentCourse.slug}`}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[orangered] py-3 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)]"
                >
                  Start learning
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* AI SUGGESTION */}

            <div className="mt-5 rounded-[30px] bg-[#e0e5ec] p-6 text-black shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <Sparkles size={20} />
              </div>

              <h3 className="mt-4 font-bold text-black">
                Your AI learning tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#3f3e3e]">
                {currentLesson
                  ? `Continue with "${currentLesson.title}" to keep building your skills.`
                  : "Explore a course and start learning something new today."}
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[orangered] transition hover:text-[red]"
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
              <h2 className="text-xl font-bold text-black">
                Recommended for you
              </h2>

              <p className="mt-1 text-sm text-[#3f3e3e]/70">
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

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="group overflow-hidden rounded-[30px] bg-[#e0e5ec] p-2 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* YOUTUBE THUMBNAIL */}

                <div className="relative h-55 overflow-hidden rounded-[24px] bg-[#e0e5ec] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[orangered] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
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
                  )}
                </div>

                {/* COURSE CONTENT */}

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[orangered]">
                      {course.category}
                    </span>

                    <span className="text-xs text-[#3f3e3e]/60">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 font-bold text-black">
                    {course.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#3f3e3e]/65">
                    <span>
                      {course.lessonsCount} lessons
                    </span>

                    <span>
                      {course.duration}
                    </span>
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[orangered] py-2.5 text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(170,35,0,0.45),inset_-3px_-3px_6px_rgba(255,180,160,0.45)]"
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