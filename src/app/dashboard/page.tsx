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

import { eq, count, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  courses,
  lessons,
  progress,
  quizAttempts,
} from "@/db/schema";

import Navbar from "@/components/navbar";

export default async function DashboardPage() {
  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // GET COURSES
  // =========================================================

  const allCourses = await db
    .select()
    .from(courses)
    .orderBy(courses.createdAt);

  // =========================================================
  // GET USER PROGRESS
  // =========================================================

  const userProgress = await db
    .select({
      lessonId: progress.lessonId,
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
    const totalPercentage = userQuizAttempts.reduce(
      (total, attempt) => {
        if (attempt.totalQuestions === 0) {
          return total;
        }

        return (
          total +
          (attempt.score / attempt.totalQuestions) * 100
        );
      },
      0
    );

    averageQuizScore = Math.round(
      totalPercentage / userQuizAttempts.length
    );
  }

  // =========================================================
  // GET ALL LESSONS
  // =========================================================

  const allLessons = await db
    .select()
    .from(lessons)
    .orderBy(lessons.order);

  // =========================================================
  // FIND CURRENT COURSE
  //
  // The course with the most completed lessons becomes
  // the user's current course.
  // =========================================================

  let currentCourse = null;
  let currentCourseCompleted = 0;
  let currentCourseTotal = 0;
  let currentLesson = null;

  if (allCourses.length > 0) {
    const courseProgress = allCourses.map((course) => {
      const courseLessonIds = allLessons
        .filter((lesson) => lesson.courseId === course.id)
        .map((lesson) => lesson.id);

      const completed = courseLessonIds.filter((id) =>
        completedLessonIds.has(id)
      ).length;

      return {
        course,
        completed,
        total: courseLessonIds.length,
      };
    });

    // Prefer a course that the user has already started.
    const startedCourses = courseProgress.filter(
      (item) => item.completed > 0 && item.completed < item.total
    );

    if (startedCourses.length > 0) {
      startedCourses.sort(
        (a, b) => b.completed - a.completed
      );

      currentCourse = startedCourses[0].course;
      currentCourseCompleted = startedCourses[0].completed;
      currentCourseTotal = startedCourses[0].total;
    } else {
      // Otherwise use the first course.
      currentCourse = courseProgress[0].course;
      currentCourseCompleted = courseProgress[0].completed;
      currentCourseTotal = courseProgress[0].total;
    }
  }

  // =========================================================
  // FIND NEXT LESSON
  // =========================================================

  if (currentCourse) {
    const courseLessons = allLessons
      .filter((lesson) => lesson.courseId === currentCourse!.id)
      .sort((a, b) => a.order - b.order);

    currentLesson =
      courseLessons.find(
        (lesson) => !completedLessonIds.has(lesson.id)
      ) ?? courseLessons[courseLessons.length - 1] ?? null;
  }

  // =========================================================
  // COURSE PROGRESS %
  // =========================================================

  const currentCourseProgress =
    currentCourseTotal > 0
      ? Math.round(
          (currentCourseCompleted / currentCourseTotal) * 100
        )
      : 0;

  // =========================================================
  // RECOMMENDED COURSES
  //
  // Show courses other than current course.
  // =========================================================

  const recommendedCourses = allCourses
    .filter(
      (course) =>
        !currentCourse || course.id !== currentCourse.id
    )
    .slice(0, 3);

  // =========================================================
  // FALLBACK
  // =========================================================

  if (recommendedCourses.length === 0 && currentCourse) {
    recommendedCourses.push(currentCourse);
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">

      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

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


        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Streak */}

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

            <p className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white">
              —
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Streak tracking coming soon
            </p>

          </div>


          {/* Enrolled */}

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

            <p className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white">
              {allCourses.length}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Courses in CourseGuide
            </p>

          </div>


          {/* Hours */}

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

            <p className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white">
              {completedLessonsCount}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Across all courses
            </p>

          </div>


          {/* Quizzes */}

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

            <p className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white">
              {quizzesCompleted}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              {quizzesCompleted > 0
                ? `${averageQuizScore}% average score`
                : "No quizzes completed yet"}
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* ================================================= */}
          {/* CONTINUE LEARNING */}
          {/* ================================================= */}

          <section>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
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


            {/* Current course */}

            {currentCourse ? (

              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

                <div className="grid md:grid-cols-[190px_1fr]">

                  {/* Course visual */}

                  <div className="flex min-h-[190px] items-center justify-center bg-zinc-950 dark:bg-black">

                    <div className="text-center text-white">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
                        <BookOpen size={25} />
                      </div>

                      <p className="mt-4 text-xs font-medium text-zinc-400">
                        CURRENT COURSE
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {currentCourse.title}
                      </p>

                    </div>

                  </div>


                  {/* Course information */}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {currentCourse.category}
                        </span>

                        <h3 className="mt-3 text-xl font-bold text-zinc-950 dark:text-white">
                          {currentCourse.title}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {currentLesson?.title ?? "Start this course"}
                        </p>

                      </div>

                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {currentCourseProgress}%
                      </span>

                    </div>


                    {/* Progress */}

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
                        {currentCourseCompleted} of{" "}
                        {currentCourseTotal} lessons completed
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
                  Add courses to your CourseGuide database.
                </p>

              </div>

            )}

          </section>


          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

          <aside>

            {/* Daily goal */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-bold text-zinc-950 dark:text-white">
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

                    <p className="text-xl font-bold text-zinc-950 dark:text-white">
                      {currentLesson ? "1" : "0"}
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      LESSON
                    </p>

                  </div>

                </div>


                <div>

                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
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


            {/* AI suggestion */}

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


        {/* ================================================= */}
        {/* RECOMMENDED COURSES */}
        {/* ================================================= */}

        <section className="mt-12 pb-10">

          <div className="flex items-end justify-between">

            <div>

              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
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

            {recommendedCourses.map((course) => (

              <div
                key={course.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-2xl"
              >

                {/* Course image */}

                <div className="flex h-36 items-center justify-center bg-zinc-100 dark:bg-zinc-800">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-400">

                    {course.category === "Programming" ? (
                      <BookOpen size={23} />
                    ) : course.category === "Computer Science" ? (
                      <Target size={23} />
                    ) : (
                      <Sparkles size={23} />
                    )}

                  </div>

                </div>


                {/* Course content */}

                <div className="p-5">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {course.category}
                    </span>

                    <span className="text-xs text-zinc-400">
                      {course.level}
                    </span>

                  </div>


                  <h3 className="mt-3 font-bold text-zinc-950 dark:text-white">
                    {course.title}
                  </h3>


                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      {course.lessonsCount} lessons
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

            ))}

          </div>

        </section>

      </div>

    </main>
  );
}