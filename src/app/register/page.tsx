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
    <main className="min-h-screen w-full bg-[#e0e5ec] text-black">
      <div className="grid min-h-screen w-full lg:grid-cols-2">

        {/* =========================================================
                    LEFT SIDE
                ========================================================= */}
        <div className="relative hidden overflow-hidden bg-[#e0e5ec] p-10 lg:flex lg:flex-col lg:justify-between">

          {/* Soft neumorphic decorative shapes */}
          <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#e0e5ec] shadow-[inset_12px_12px_24px_rgba(163,177,198,0.35),inset_-12px_-12px_24px_rgba(255,255,255,0.65)]" />

          <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#e0e5ec] shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.75)]" />

          <div className="relative z-10 flex h-full flex-col gap-15">

            {/* Logo */}
            <Link
              href="/"
              className="flex w-fit items-center gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
            >
              <img
                src="/logo2.png"
                alt="CourseGuide"
                className="h-10 w-10 rounded-[12px] object-contain"
              />

              <div>
                <div className="translate-y-1">
                  <span className="text-[16px] font-bold leading-none tracking-tight text-black">
                    Course
                  </span>

                  <span className="text-[16px] font-bold leading-none tracking-tight text-[orangered]">
                    Guide
                  </span>
                </div>

                <p className="mt-0 mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[orangered]">
                  AI Learning
                </p>
              </div>
            </Link>


            {/* Main content */}
            <div className="max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs font-medium text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                <Sparkles
                  size={14}
                  className="text-[orangered]"
                />
                Start your journey
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.035em] text-black xl:text-6xl">
                Your next skill
                <br />
                starts
                <br />
                <span className="text-[orangered]">
                  here.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[15px] leading-7 text-[#3f3e3e]">
                Build your learning path, discover quality
                courses, and improve your skills one lesson
                at a time.
              </p>


              {/* Feature pills */}
              <div className="mt-8 flex flex-wrap gap-3">

                <span className="rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  Personalized learning
                </span>

                <span className="rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  AI-powered
                </span>

                <span className="rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]">
                  Learn at your pace
                </span>

              </div>

            </div>


            {/* Footer */}
            <p className="text-sm text-[#3f3e3e]">
              © 2026 CourseGuide AI
            </p>

          </div>
        </div>


        {/* =========================================================
                    RIGHT SIDE
                ========================================================= */}
        <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] px-6 py-12 sm:px-10">

          <div className="w-full max-w-md">

            {/* Back */}
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 rounded-[12px] bg-[#e0e5ec] px-3 py-2 text-sm font-medium text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>


            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">

              <Link
                href="/"
                className="flex w-fit items-center gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e0e5ec] font-bold text-[orangered] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                  C
                </div>

                <div>
                  <p className="font-bold text-black">
                    CourseGuide
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.18em] text-[orangered]">
                    AI Learning
                  </p>
                </div>
              </Link>

            </div>


            {/* Heading */}
            <div>

              <h2 className="text-3xl font-bold tracking-tight text-black">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-[#3f3e3e]">
                Start your personalized learning journey.
              </p>

            </div>


            {/* Error */}
            {error && (
              <div className="mt-5 rounded-[12px] bg-[#e0e5ec] px-4 py-3 text-sm text-red-600 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                {error}
              </div>
            )}


            {/* Success */}
            {success && (
              <div className="mt-5 rounded-[12px] bg-[#e0e5ec] px-4 py-3 text-sm text-emerald-600 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]">
                {success}
              </div>
            )}


            {/* Form */}
            <form
              onSubmit={handleRegister}
              className="mt-8 space-y-5 rounded-[30px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] sm:p-7"
            >

              {/* Name */}
              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-black"
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
                  className="h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                />

              </div>


              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-black"
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
                  className="h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                />

              </div>


              {/* Password */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-black"
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
                  className="h-12 w-full rounded-[12px] bg-[#e0e5ec] px-4 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
                />

                <p className="mt-2 text-xs text-[#3f3e3e]">
                  Must be at least 6 characters.
                </p>

              </div>


              {/* Create account */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[orangered] text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
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

              <div className="h-px flex-1 bg-[#c8ced7]" />

              <span className="text-xs text-[#3f3e3e]">
                OR
              </span>

              <div className="h-px flex-1 bg-[#c8ced7]" />

            </div>


            {/* Google */}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-[12px] bg-[#e0e5ec] text-sm font-medium text-[#3f3e3e] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]"
            >
              <span className="font-bold text-[orangered]">
                G
              </span>

              Continue with Google
            </button>


            {/* Login */}
            <p className="mt-8 text-center text-sm text-[#3f3e3e]">

              Already have an account?{" "}

              <Link
                href="/login"
                className="font-semibold text-[orangered] transition-colors hover:text-[red]"
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