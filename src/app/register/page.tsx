import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

        {/* Left */}
        <div className="hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold">
              C
            </div>

            <div>
              <p className="font-bold">CourseGuide</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-400">
                AI Learning
              </p>
            </div>
          </Link>

          <div className="max-w-md">
            <p className="text-sm font-medium text-indigo-400">
              START YOUR JOURNEY
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
              Your next skill starts here.
            </h1>

            <p className="mt-6 leading-7 text-zinc-400">
              Build your learning path, discover quality courses, and improve
              your skills one lesson at a time.
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            © 2026 CourseGuide AI
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="lg:hidden mb-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                  C
                </div>

                <span className="font-bold text-zinc-900">
                  CourseGuide AI
                </span>
              </Link>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Start your personalized learning journey.
              </p>
            </div>

            <form className="mt-8 space-y-5">

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-xl bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Create account
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs text-zinc-400">OR</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <span className="font-bold">G</span>
              Continue with Google
            </button>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}