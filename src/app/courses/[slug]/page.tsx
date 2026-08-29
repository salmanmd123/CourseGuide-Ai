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

const lessons = [
  "Introduction to Python",
  "Variables and Data Types",
  "Operators and Expressions",
  "Conditional Statements",
  "Loops in Python",
  "Functions",
  "Lists and Tuples",
  "Dictionaries and Sets",
  "Object-Oriented Programming",
  "Working with Files",
];

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const title = slug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      {/* Top navigation */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft size={16} />
            Back to courses
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                  Programming
                </span>

                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600">
                  Beginner
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                {title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
                Build a strong foundation in Python with a complete,
                beginner-friendly course covering the concepts you need to
                start programming confidently.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <Star
                    size={16}
                    fill="currentColor"
                    className="text-amber-500"
                  />
                  <strong className="text-zinc-900">4.9</strong>
                  rating
                </span>

                <span className="flex items-center gap-2">
                  <Users size={16} />
                  18K learners
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={16} />
                  8h 20m
                </span>

                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  42 lessons
                </span>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white">
                  CG
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    CourseGuide Selection
                  </p>
                  <p className="text-xs text-zinc-400">
                    Carefully selected course
                  </p>
                </div>
              </div>
            </div>

            {/* Start card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.08)]">
              <div className="flex h-48 items-center justify-center rounded-xl bg-zinc-950">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-zinc-950">
                  <Play size={25} fill="currentColor" />
                </div>
              </div>

              <div className="p-2 pt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  COMPLETE COURSE
                </p>

                <p className="mt-2 text-2xl font-bold">
                  Ready to start?
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Learn at your own pace and track your progress as you go.
                </p>

                <Link
                  href="/learn/python-fundamentals"
                  className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
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

      {/* Main content */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">

        {/* Curriculum */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight">
            Course curriculum
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            42 lessons • 8h 20m total learning time
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">

            <div className="border-b border-zinc-100 px-5 py-4">
              <p className="font-semibold">
                Python Fundamentals
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                10 lessons shown
              </p>
            </div>

            <div>
              {lessons.map((lesson, index) => (
                <div
                  key={lesson}
                  className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-500">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {lesson}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Lesson {index + 1}
                    </p>
                  </div>

                  <Play
                    size={15}
                    className="shrink-0 text-zinc-300"
                  />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Sidebar */}
        <aside>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="font-bold">What you'll learn</h3>

            <div className="mt-5 space-y-4">
              {[
                "Understand Python fundamentals",
                "Write your first Python programs",
                "Work with conditions and loops",
                "Create reusable functions",
                "Use common Python data structures",
                "Build confidence solving problems",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <p className="text-sm leading-5 text-zinc-600">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="font-bold">Course includes</h3>

            <div className="mt-5 space-y-4 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Video lessons</span>
                <span className="font-medium text-zinc-900">42</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total duration</span>
                <span className="font-medium text-zinc-900">8h 20m</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Level</span>
                <span className="font-medium text-zinc-900">Beginner</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Certificate</span>
                <span className="font-medium text-zinc-900">Coming soon</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}