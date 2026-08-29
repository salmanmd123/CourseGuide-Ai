import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex dark:bg-black">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold">
              C
            </div>

            <div>
              <p className="font-bold">
                CourseGuide
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-400">
                AI Learning
              </p>
            </div>
          </Link>

          <div className="max-w-md">

            <p className="text-sm font-medium text-indigo-400">
              YOUR LEARNING JOURNEY
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
              Learn with a guide that understands you.
            </h1>

            <p className="mt-6 leading-7 text-zinc-400">
              Discover courses, understand difficult concepts, practice with
              quizzes, and get help whenever you need it.
            </p>

          </div>

          <p className="text-sm text-zinc-500">
            © 2026 CourseGuide AI
          </p>

        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* Back */}
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            {/* Mobile logo */}
            <div className="mb-10 lg:hidden">

              <Link href="/" className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                  C
                </div>

                <span className="font-bold text-zinc-900 dark:text-white">
                  CourseGuide AI
                </span>

              </Link>

            </div>

            {/* Heading */}
            <div>

              <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Sign in to continue your learning journey.
              </p>

            </div>

            {/* Form */}
            <form className="mt-8 space-y-5">

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-600"
                />

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>

                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-600"
                />

              </div>

              {/* Sign in */}
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Sign in
              </button>

            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />

              <span className="text-xs text-zinc-400">
                OR
              </span>

              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />

            </div>

            {/* Google */}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span className="font-bold">
                G
              </span>

              Continue with Google
            </button>

            {/* Register */}
            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Don't have an account?{" "}

              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Create one
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}

