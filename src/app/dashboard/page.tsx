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
import Navbar from "@/components/navbar";

const recommendedCourses = [
  {
    title: "Python Fundamentals",
    category: "Programming",
    level: "Beginner",
    duration: "8h 20m",
    lessons: 42,
  },
  {
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    level: "Beginner",
    duration: "12h 10m",
    lessons: 58,
  },
  {
    title: "Machine Learning Basics",
    category: "AI & ML",
    level: "Beginner",
    duration: "9h 45m",
    lessons: 36,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              LEARNING DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Good morning, Salman 👋
            </h1>

            <p className="mt-2 text-zinc-500">
              Keep going. You're making progress.
            </p>
          </div>

          <Link
            href="/courses"
            className="flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <Search size={17} />
            Find a course
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Learning streak</p>
              <Flame size={19} className="text-orange-500" />
            </div>

            <p className="mt-3 text-3xl font-bold">7 days</p>
            <p className="mt-1 text-xs text-zinc-400">
              Keep it going 🔥
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Courses enrolled</p>
              <BookOpen size={19} className="text-indigo-600" />
            </div>

            <p className="mt-3 text-3xl font-bold">4</p>
            <p className="mt-1 text-xs text-zinc-400">
              2 currently active
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Hours learned</p>
              <Clock3 size={19} className="text-emerald-600" />
            </div>

            <p className="mt-3 text-3xl font-bold">18.5</p>
            <p className="mt-1 text-xs text-zinc-400">
              This month
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Quizzes completed</p>
              <Trophy size={19} className="text-amber-500" />
            </div>

            <p className="mt-3 text-3xl font-bold">12</p>
            <p className="mt-1 text-xs text-zinc-400">
              86% average score
            </p>
          </div>

        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* Continue learning */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Continue learning</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Pick up where you left off.
                </p>
              </div>

              <Link
                href="/my-learning"
                className="hidden items-center gap-1 text-sm font-medium text-indigo-600 sm:flex"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="grid md:grid-cols-[190px_1fr]">

                {/* Course visual */}
                <div className="flex min-h-[190px] items-center justify-center bg-zinc-950">
                  <div className="text-center text-white">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
                      <BookOpen size={25} />
                    </div>

                    <p className="mt-4 text-xs font-medium text-zinc-400">
                      CURRENT COURSE
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Python
                    </p>
                  </div>
                </div>

                {/* Course information */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                        Programming
                      </span>

                      <h3 className="mt-3 text-xl font-bold">
                        Python Fundamentals
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        Conditional Statements
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-indigo-600">
                      72%
                    </span>
                  </div>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full w-[72%] rounded-full bg-indigo-600" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-zinc-400">
                      30 of 42 lessons completed
                    </p>

                    <Link
                      href="/learn/python-fundamentals"
                      className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                    >
                      <Play size={15} fill="currentColor" />
                      Continue
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Daily goal */}
          <aside>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Today's goal</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    30 minutes of learning
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Target size={19} />
                </div>
              </div>

              <div className="mt-7 flex items-center gap-5">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-indigo-600">
                  <div className="text-center">
                    <p className="text-xl font-bold">21</p>
                    <p className="text-[10px] text-zinc-400">MIN</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Almost there!
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Just 9 more minutes to complete today's goal.
                  </p>
                </div>
              </div>

              <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-200">
                Start learning
                <ArrowRight size={16} />
              </button>
            </div>

            {/* AI suggestion */}
            <div className="mt-4 rounded-2xl bg-indigo-600 p-6 text-white">
              <Sparkles size={20} />

              <h3 className="mt-4 font-bold">
                Your AI learning tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-indigo-100">
                You are strong in Python basics. Try practicing loops and
                functions next.
              </p>

              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
              >
                Explore recommendations
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>

        </div>

        {/* Recommended courses */}
        <section className="mt-12 pb-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">Recommended for you</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Courses selected based on your learning interests.
              </p>
            </div>

            <Link
              href="/courses"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-600 sm:flex"
            >
              Browse all
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {recommendedCourses.map((course, index) => (
              <div
                key={course.title}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-36 items-center justify-center bg-zinc-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    {index === 0 ? (
                      <BookOpen size={23} />
                    ) : index === 1 ? (
                      <Target size={23} />
                    ) : (
                      <Sparkles size={23} />
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-600">
                      {course.category}
                    </span>

                    <span className="text-xs text-zinc-400">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold">{course.title}</h3>

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                    <span>{course.lessons} lessons</span>
                    <span>{course.duration}</span>
                  </div>

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 transition group-hover:border-zinc-950 group-hover:bg-zinc-950 group-hover:text-white">
                    View course
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}