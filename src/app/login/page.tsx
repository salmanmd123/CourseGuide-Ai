import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
            <div className="grid min-h-screen w-full lg:grid-cols-2">

                {/* =========================================================
            LEFT SIDE
        ========================================================= */}
                <div
                    className="
            relative hidden overflow-hidden p-10 text-white
            lg:flex lg:flex-col lg:justify-between
            bg-gradient-to-br from-[#17152b] via-[#171827] to-[#101116]
            dark:from-[#15132a] dark:via-[#11121c] dark:to-[#09090b]
          "
                >
                    {/* Background glow */}
                    <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

                    <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

                    {/* Subtle grid */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />

                    {/* Content wrapper */}
                    <div className="relative z-10 flex h-full flex-col justify-between">

                        {/* Logo */}
                        <Link href="/" className="flex w-fit items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                                C
                            </div>

                            <div>
                                <p className="text-[16px] font-bold leading-none tracking-tight">
                                    CourseGuide
                                </p>

                                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-400">
                                    AI Learning
                                </p>
                            </div>
                        </Link>

                        {/* Main message */}
                        <div className="max-w-lg">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                                <Sparkles size={14} className="text-indigo-400" />
                                Your learning journey
                            </div>

                            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.035em] text-white xl:text-6xl">
                                Learn with a guide
                                <br />
                                that understands
                                <br />
                                <span className="text-indigo-400">you.</span>
                            </h1>

                            <p className="mt-7 max-w-md text-[15px] leading-7 text-zinc-400">
                                Discover courses, understand difficult concepts, practice with
                                quizzes, and get help whenever you need it.
                            </p>

                            {/* Small feature indicators */}
                            <div className="mt-8 flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                                    AI-powered learning
                                </span>

                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                                    Smart quizzes
                                </span>

                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                                    Track progress
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <p className="text-sm text-zinc-500">
                            © 2026 CourseGuide AI
                        </p>

                    </div>
                </div>

                {/* =========================================================
            RIGHT SIDE
        ========================================================= */}
                <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950 sm:px-10">

                    <div className="w-full max-w-md">

                        {/* Back */}
                        <Link
                            href="/"
                            className="
                mb-10 inline-flex items-center gap-2
                text-sm font-medium text-zinc-500
                transition hover:text-zinc-900
                dark:text-zinc-400 dark:hover:text-white
              "
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

                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-white">
                                        CourseGuide
                                    </p>

                                    <p className="text-[9px] uppercase tracking-[0.18em] text-indigo-600">
                                        AI Learning
                                    </p>
                                </div>

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
                                    className="
                    h-12 w-full rounded-xl
                    border border-zinc-200 bg-white
                    px-4 text-sm text-zinc-900
                    outline-none transition
                    placeholder:text-zinc-400
                    focus:border-indigo-500
                    focus:ring-4 focus:ring-indigo-500/10
                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-white
                    dark:placeholder:text-zinc-600
                  "
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
                                        className="
                      text-xs font-medium text-indigo-600
                      hover:text-indigo-700
                      dark:text-indigo-400
                      dark:hover:text-indigo-300
                    "
                                    >
                                        Forgot password?
                                    </Link>

                                </div>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="
                    h-12 w-full rounded-xl
                    border border-zinc-200 bg-white
                    px-4 text-sm text-zinc-900
                    outline-none transition
                    placeholder:text-zinc-400
                    focus:border-indigo-500
                    focus:ring-4 focus:ring-indigo-500/10
                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-white
                    dark:placeholder:text-zinc-600
                  "
                                />
                            </div>

                            {/* Sign in */}
                            <button
                                type="submit"
                                className="
                  flex h-12 w-full items-center justify-center
                  rounded-xl bg-zinc-950
                  text-sm font-semibold text-white
                  transition hover:bg-zinc-800
                  dark:bg-white dark:text-zinc-950
                  dark:hover:bg-zinc-200
                "
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
                            className="
                flex h-12 w-full items-center justify-center gap-3
                rounded-xl border border-zinc-200 bg-white
                text-sm font-medium text-zinc-700
                transition hover:bg-zinc-50
                dark:border-zinc-800
                dark:bg-zinc-900
                dark:text-zinc-300
                dark:hover:bg-zinc-800
              "
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
                                className="
                  font-semibold text-indigo-600
                  hover:text-indigo-700
                  dark:text-indigo-400
                  dark:hover:text-indigo-300
                "
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