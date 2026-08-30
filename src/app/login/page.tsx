"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Invalid email or password");
                return;
            }

            // Login successful
            window.location.href = "/dashboard";
        } catch (error) {
            console.error(error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">

            <div className="grid min-h-screen lg:grid-cols-2">

                {/* ================= LEFT SIDE ================= */}

                <div
                    className="
            relative hidden overflow-hidden p-10 text-white
            lg:flex lg:flex-col
            bg-gradient-to-br from-[#17152b] via-[#171827] to-[#101116]
            dark:from-[#15132a] dark:via-[#11121c] dark:to-[#09090b]
          "
                >

                    {/* Background glow */}
                    <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

                    <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

                    {/* Grid */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />

                    <div className="relative z-10 flex h-full flex-col justify-between">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">

                            <img
                                src="/logo.png"
                                alt="CourseGuide"
                                className="h-10 w-10 rounded-xl object-contain"
                            />

                            <div>
                                <div className="translate-y-1">
                                    <span className="text-[16px] font-bold tracking-tight text-white">
                                        Course
                                    </span>

                                    <span className="text-[16px] font-bold tracking-tight text-indigo-400">
                                        Guide
                                    </span>
                                </div>

                                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-400">
                                    AI Learning
                                </p>
                            </div>

                        </Link>


                        {/* Main content */}
                        <div className="max-w-lg">

                            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-zinc-300">
                                Your learning journey
                            </div>

                            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.035em] text-white xl:text-6xl">
                                Learn with a guide
                                <br />
                                that understands
                                <br />
                                <span className="text-indigo-400">
                                    you.
                                </span>
                            </h1>

                            <p className="mt-7 max-w-md text-[15px] leading-7 text-zinc-400">
                                Discover courses, understand difficult concepts, practice with
                                quizzes, and get help whenever you need it.
                            </p>

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


                {/* ================= RIGHT SIDE ================= */}

                <div className="flex items-center justify-center px-6 py-10 sm:px-10">

                    <div className="w-full max-w-[414px]">

                        {/* Back */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                            <ArrowLeft size={16} />
                            Back to home
                        </Link>


                        {/* Heading */}
                        <div className="mt-10">

                            <h1 className="text-3xl font-bold tracking-tight">
                                Welcome back
                            </h1>

                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                Sign in to continue your learning journey.
                            </p>

                        </div>


                        {/* Form */}
                        <form
                            onSubmit={handleLogin}
                            className="mt-8"
                        >

                            {/* Email */}
                            <div>

                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="
                    mt-2 h-11 w-full rounded-xl
                    border border-zinc-200
                    bg-white px-3.5
                    text-sm text-zinc-900
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2 focus:ring-indigo-500/10
                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-white
                    dark:placeholder:text-zinc-600
                  "
                                />

                            </div>


                            {/* Password */}
                            <div className="mt-5">

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                    >
                                        Forgot password?
                                    </Link>

                                </div>

                                <div className="relative mt-2">

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="
                      h-11 w-full rounded-xl
                      border border-zinc-200
                      bg-white px-3.5 pr-11
                      text-sm text-zinc-900
                      outline-none
                      transition
                      focus:border-indigo-500
                      focus:ring-2 focus:ring-indigo-500/10
                      dark:border-zinc-800
                      dark:bg-zinc-900
                      dark:text-white
                    "
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-zinc-400
                      transition hover:text-zinc-700
                      dark:hover:text-zinc-200
                    "
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>

                                </div>

                            </div>


                            {/* Error */}
                            {error && (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                    {error}
                                </div>
                            )}


                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                  mt-6 flex h-11 w-full
                  items-center justify-center gap-2
                  rounded-xl
                  bg-zinc-950
                  text-sm font-semibold text-white
                  transition
                  hover:bg-zinc-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  dark:bg-white
                  dark:text-zinc-950
                  dark:hover:bg-zinc-200
                "
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}

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
                flex h-11 w-full
                items-center justify-center gap-3
                rounded-xl
                border border-zinc-200
                bg-white
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
                                className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
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