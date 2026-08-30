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
import { courses, lessons, progress } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export default async function MyLearningPage() {
  const user = await getCurrentUser();

  // Protect page
  if (!user) {
    redirect("/login");
  }

  /* =========================================
     GET COURSES WITH USER PROGRESS
  ========================================= */

  const enrolledCourses = await db
    .select({
      courseId: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      category: courses.category,
      level: courses.level,
      duration: courses.duration,
      lessonsCount: courses.lessonsCount,
    })
    .from(courses);

  /* =========================================
     GET COMPLETED LESSONS
  ========================================= */

  const completedLessons = await db
    .select({
      lessonId: progress.lessonId,
      courseId: lessons.courseId,
    })
    .from(progress)
    .innerJoin(
      lessons,
      eq(progress.lessonId, lessons.id)
    )
    .where(
      and(
        eq(progress.userId, user.id),
        eq(progress.completed, true)
      )
    );

  /* =========================================
     CALCULATE PROGRESS
  ========================================= */

  const courseProgress = enrolledCourses.map((course) => {
    const completed = completedLessons.filter(
      (item) => item.courseId === course.courseId
    ).length;

    const total = course.lessonsCount || 0;

    const percentage =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      ...course,
      completed,
      percentage,
    };
  });

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">

      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              YOUR LEARNING
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My Learning
            </h1>

            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Continue your courses and track your progress.
            </p>
          </div>

          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <BookOpen size={17} />
            Browse courses
          </Link>

        </div>

        {/* =========================================
            SUMMARY
        ========================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          {/* Courses */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <BookOpen size={19} />
            </div>

            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Courses
            </p>

            <p className="mt-1 text-3xl font-bold">
              {courseProgress.length}
            </p>

          </div>

          {/* Completed lessons */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 size={19} />
            </div>

            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Lessons completed
            </p>

            <p className="mt-1 text-3xl font-bold">
              {completedLessons.length}
            </p>

          </div>

          {/* Average progress */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock3 size={19} />
            </div>

            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Average progress
            </p>

            <p className="mt-1 text-3xl font-bold">
              {courseProgress.length > 0
                ? Math.round(
                    courseProgress.reduce(
                      (sum, course) =>
                        sum + course.percentage,
                      0
                    ) / courseProgress.length
                  )
                : 0}
              %
            </p>

          </div>

        </div>

        {/* =========================================
            COURSE LIST
        ========================================= */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Your courses
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Pick up where you left off.
              </p>
            </div>

          </div>

          {courseProgress.length === 0 ? (

            /* Empty state */

            <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-5 font-bold">
                No courses yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Start learning by choosing a course from our course library.
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                Explore courses
                <ArrowRight size={15} />
              </Link>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {courseProgress.map((course) => (

                <div
                  key={course.courseId}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >

                  <div className="grid md:grid-cols-[190px_1fr]">

                    {/* Course visual */}

                    <div className="flex min-h-[190px] items-center justify-center bg-zinc-950 dark:bg-black">

                      <div className="text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                          <BookOpen size={25} />
                        </div>

                        <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                          {course.category}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {course.level}
                        </p>

                      </div>

                    </div>

                    {/* Course information */}

                    <div className="p-6">

                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                        <div>

                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            {course.category}
                          </span>

                          <h3 className="mt-3 text-xl font-bold">
                            {course.title}
                          </h3>

                          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {course.description}
                          </p>

                        </div>

                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {course.percentage}%
                        </span>

                      </div>

                      {/* Progress */}

                      <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">

                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{
                            width: `${course.percentage}%`,
                          }}
                        />

                      </div>

                      {/* Bottom */}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                        <div className="flex items-center gap-4 text-xs text-zinc-400">

                          <span>
                            {course.completed} /{" "}
                            {course.lessonsCount} lessons
                          </span>

                          <span>
                            {course.duration}
                          </span>

                        </div>

                        <Link
                          href={`/learn/${course.slug}`}
                          className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                          <Play
                            size={15}
                            fill="currentColor"
                          />

                          {course.percentage > 0
                            ? "Continue"
                            : "Start learning"}

                        </Link>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}