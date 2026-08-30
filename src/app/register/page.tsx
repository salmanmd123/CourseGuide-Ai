"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess("Account created successfully.");

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white">
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

          <div className="relative z-10 flex h-full flex-col gap-15">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">

              <img
                src="/logo.png"
                alt="CourseGuide"
                className="h-10 w-10 rounded-xl object-contain"
              />

              <div>
                <div className="translate-y-1">
                  <span className="text-[16px] font-bold leading-none tracking-tight text-white">
                    Course
                  </span>

                  <span className="text-[16px] font-bold leading-none tracking-tight text-indigo-400">
                    Guide
                  </span>
                </div>

                <p className="mt-0 mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-400">
                  AI Learning
                </p>
              </div>

            </Link>
            {/* Main content */}
            <div className="max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                <Sparkles
                  size={14}
                  className="text-indigo-400"
                />
                Start your journey
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.035em] text-white xl:text-6xl">
                Your next skill
                <br />
                starts
                <br />
                <span className="text-indigo-400">
                  here.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[15px] leading-7 text-zinc-400">
                Build your learning path, discover quality
                courses, and improve your skills one lesson
                at a time.
              </p>

              {/* Feature pills */}
              <div className="mt-8 flex flex-wrap gap-2">

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                  Personalized learning
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                  AI-powered
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                  Learn at your pace
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
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950 sm:px-10">

          <div className="w-full max-w-md">

            {/* Back */}
            <Link
              href="/"
              className="
                                mb-10 inline-flex items-center gap-2
                                text-sm font-medium text-zinc-500
                                transition hover:text-zinc-900
                                dark:text-zinc-400
                                dark:hover:text-white
                            "
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">

              <Link
                href="/"
                className="flex items-center gap-3"
              >
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
                Create your account
              </h2>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Start your personalized learning journey.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                {success}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleRegister}
              className="mt-8 space-y-5"
            >

              {/* Name */}
              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                  required
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
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  required
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

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  required
                  minLength={6}
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

                <p className="mt-2 text-xs text-zinc-400">
                  Must be at least 6 characters.
                </p>

              </div>

              {/* Create account */}
              <button
                type="submit"
                disabled={loading}
                className="
                                    flex h-12 w-full items-center justify-center gap-2
                                    rounded-xl bg-zinc-950
                                    text-sm font-semibold text-white
                                    transition hover:bg-zinc-800
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
                    Creating account...
                  </>
                ) : (
                  "Create account"
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

            {/* Login */}
            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">

              Already have an account?{" "}

              <Link
                href="/login"
                className="
                                    font-semibold text-indigo-600
                                    hover:text-indigo-700
                                    dark:text-indigo-400
                                    dark:hover:text-indigo-300
                                "
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