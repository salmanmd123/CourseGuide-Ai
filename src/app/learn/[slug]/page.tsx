import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  MessageCircle,
  Play,
  Sparkles,
  Trophy,
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

export default function LearningPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">

      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5">

          <div className="flex items-center gap-5">
            <Link
              href="/courses/python-fundamentals"
              className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900"
            >
              <ArrowLeft size={17} />
              <span className="hidden sm:block">Course</span>
            </Link>

            <div className="hidden h-6 w-px bg-zinc-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                C
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Python Fundamentals
                </p>

                <p className="text-[11px] text-zinc-400">
                  Lesson 4 of 42
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-400 sm:block">
              Course progress
            </span>

            <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full w-[72%] rounded-full bg-indigo-600" />
            </div>

            <span className="text-xs font-semibold text-zinc-600">
              72%
            </span>
          </div>

        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_330px]">

        {/* Main learning area */}
        <section className="min-w-0">

          {/* Video */}
          <div className="aspect-video w-full bg-zinc-900">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-zinc-950 shadow-2xl transition hover:scale-105">
                  <Play
                    size={30}
                    fill="currentColor"
                    className="ml-1"
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-zinc-200">
                  Video player
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  YouTube video will appear here
                </p>

              </div>
            </div>
          </div>

          {/* Lesson content */}
          <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  LESSON 04
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                  Conditional Statements
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Learn how Python makes decisions using if, elif, and else.
                </p>
              </div>

              <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                <CheckCircle2 size={16} />
                Mark complete
              </button>

            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-6 overflow-x-auto border-b border-zinc-200">
              {[
                { label: "Overview", icon: BookOpen },
                { label: "AI Notes", icon: FileText },
                { label: "Quiz", icon: Trophy },
                { label: "AI Tutor", icon: MessageCircle },
              ].map(({ label, icon: Icon }, index) => (
                <button
                  key={label}
                  className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium ${
                    index === 0
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Overview */}
            <div className="py-8">

              <h2 className="text-lg font-bold text-zinc-900">
                About this lesson
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
                Conditional statements allow your programs to make decisions
                based on different conditions. In this lesson, you'll learn
                how to use if, elif, and else statements and when each one
                should be used.
              </p>

              {/* AI feature cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Sparkles size={19} />
                  </div>

                  <h3 className="mt-4 font-semibold text-zinc-900">
                    AI Notes
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Get automatically generated notes for this lesson.
                  </p>

                  <button className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Generate notes →
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Trophy size={19} />
                  </div>

                  <h3 className="mt-4 font-semibold text-zinc-900">
                    Test yourself
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Take a short quiz to check your understanding.
                  </p>

                  <button className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Start quiz →
                  </button>
                </div>

              </div>

              {/* Navigation */}
              <div className="mt-10 flex justify-between border-t border-zinc-200 pt-6">

                <button className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-900">
                  <ArrowLeft size={16} />
                  Previous lesson
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
                  Next lesson
                  <ArrowRight size={16} />
                </button>

              </div>

            </div>
          </div>
        </section>

        {/* Lesson sidebar */}
        <aside className="border-l border-zinc-200 bg-white">

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-zinc-900">
                Course content
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                42 lessons • 8h 20m
              </p>
            </div>

            <ChevronDown size={17} className="text-zinc-400" />
          </div>

          <div className="border-b border-zinc-200 px-5 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Your progress
              </span>

              <span className="font-semibold text-indigo-600">
                72%
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full w-[72%] rounded-full bg-indigo-600" />
            </div>
          </div>

          <div className="max-h-[calc(100vh-150px)] overflow-y-auto">

            {lessons.map((lesson, index) => {
              const current = index === 3;
              const completed = index < 3;

              return (
                <button
                  key={lesson}
                  className={`flex w-full items-center gap-3 border-b border-zinc-100 px-5 py-4 text-left transition ${
                    current
                      ? "bg-indigo-50"
                      : "hover:bg-zinc-50"
                  }`}
                >

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      completed
                        ? "bg-emerald-50 text-emerald-600"
                        : current
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        current
                          ? "font-semibold text-indigo-700"
                          : completed
                            ? "text-zinc-500"
                            : "text-zinc-600"
                      }`}
                    >
                      {lesson}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">
                      <Clock3 size={11} />
                      {index === 3 ? "12 min" : "10 min"}
                    </p>
                  </div>

                  {current && (
                    <Play
                      size={14}
                      fill="currentColor"
                      className="text-indigo-600"
                    />
                  )}

                </button>
              );
            })}

          </div>
        </aside>

      </div>
    </main>
  );
}