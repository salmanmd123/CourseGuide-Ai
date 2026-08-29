import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Play,
  Star,
  Users,
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

  // =========================
  // GET COURSE
  // =========================

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug));

  // =========================
  // COURSE NOT FOUND
  // =========================

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

  // =========================
  // GET LESSONS
  // =========================

  const courseLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id));

  // =========================
  // WHAT YOU'LL LEARN
  // =========================

  const learningPoints = [
    `Understand ${course.title} fundamentals`,
    "Learn concepts through practical examples",
    "Build a strong foundation step by step",
    "Practice important concepts and techniques",
    "Apply what you learn to real problems",
    "Build confidence through structured learning",
  ];

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">

      {/* ================= TOP NAVIGATION ================= */}

      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">

          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>

        </div>
      </header>


      {/* ================= HERO ================= */}

      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

        <div className="mx-auto max-w-7xl px-6 py-12">

          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

            {/* ================= HERO CONTENT ================= */}

            <div>

              {/* Tags */}

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  {course.category}
                </span>

                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  {course.level}
                </span>

              </div>


              {/* Title */}

              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
                {course.title}
              </h1>


              {/* Description */}

              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                {course.description}
              </p>


              {/* Course stats */}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">

                <span className="flex items-center gap-2">

                  <Star
                    size={16}
                    fill="currentColor"
                    className="text-amber-500"
                  />

                  <strong className="text-zinc-900 dark:text-white">
                    {course.rating}
                  </strong>

                  rating

                </span>


                <span className="flex items-center gap-2">

                  <Users size={16} />

                  {course.students} learners

                </span>


                <span className="flex items-center gap-2">

                  <Clock3 size={16} />

                  {course.duration}

                </span>


                <span className="flex items-center gap-2">

                  <BookOpen size={16} />

                  {course.lessonsCount} lessons

                </span>

              </div>


              {/* CourseGuide */}

              <div className="mt-8 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white dark:bg-white dark:text-zinc-950">
                  CG
                </div>

                <div>

                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    CourseGuide Selection
                  </p>

                  <p className="text-xs text-zinc-400">
                    Carefully selected course
                  </p>

                </div>

              </div>

            </div>


            {/* ================= START CARD ================= */}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_15px_50px_rgba(0,0,0,0.35)]">

              {/* Video */}

              <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-950 dark:bg-zinc-800">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-zinc-950 transition hover:scale-105 dark:bg-zinc-100">

                  <Play
                    size={25}
                    fill="currentColor"
                  />

                </div>

              </div>


              {/* Card content */}

              <div className="p-2 pt-5">

                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  COMPLETE COURSE
                </p>

                <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
                  Ready to start?
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Learn at your own pace and track your progress as you go.
                </p>


                <Link
                  href={`/learn/${course.slug}`}
                  className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Start learning

                  <ArrowRight size={17} />

                </Link>


                <p className="mt-4 text-center text-xs text-zinc-400">
                  Free to learn • No credit card required
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= MAIN CONTENT ================= */}

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">

        {/* ================= CURRICULUM ================= */}

        <section>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Course curriculum
          </h2>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {courseLessons.length} lessons • {course.duration} total learning time
          </p>


          {/* Curriculum card */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

            {/* Curriculum header */}

            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">

              <p className="font-semibold text-zinc-900 dark:text-white">
                {course.title}
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                {courseLessons.length} lessons
              </p>

            </div>


            {/* Lessons */}

            <div>

              {courseLessons.map((lesson, index) => (

                <div
                  key={lesson.id}
                  className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 transition last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >

                  {/* Number */}

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {index + 1}
                  </div>


                  {/* Lesson info */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-200">
                      {lesson.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Lesson {index + 1}
                      {lesson.duration ? ` • ${lesson.duration}` : ""}
                    </p>

                  </div>


                  {/* Play icon */}

                  <Play
                    size={15}
                    className="shrink-0 text-zinc-300 dark:text-zinc-600"
                  />

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* ================= SIDEBAR ================= */}

        <aside>

          {/* What you'll learn */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

            <h3 className="font-bold text-zinc-900 dark:text-white">
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
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <p className="text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </div>


          {/* Course includes */}

          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">

            <h3 className="font-bold text-zinc-900 dark:text-white">
              Course includes
            </h3>


            <div className="mt-5 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">

              <div className="flex items-center justify-between">

                <span>Video lessons</span>

                <span className="font-medium text-zinc-900 dark:text-white">
                  {course.lessonsCount}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span>Total duration</span>

                <span className="font-medium text-zinc-900 dark:text-white">
                  {course.duration}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span>Level</span>

                <span className="font-medium text-zinc-900 dark:text-white">
                  {course.level}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span>Certificate</span>

                <span className="font-medium text-zinc-900 dark:text-white">
                  Coming soon
                </span>

              </div>

            </div>

          </div>

        </aside>

      </div>

    </main>
  );
}