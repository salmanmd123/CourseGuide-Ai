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
            if (data.user?.role === "ADMIN") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/dashboard";
            }
        } catch (error) {
            console.error(error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#e0e5ec] text-black dark:bg-[#1a1d23] dark:text-[#f5f7fa]">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* ================= LEFT SIDE ================= */}

                <div className="relative hidden overflow-hidden bg-[#e0e5ec] p-10 dark:bg-[#1a1d23] lg:flex lg:flex-col">

                    {/* Soft decorative shapes */}

                    <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#e0e5ec] shadow-[inset_12px_12px_24px_rgba(163,177,198,0.35),inset_-12px_-12px_24px_rgba(255,255,255,0.65)] dark:bg-[#1e2229] dark:shadow-[inset_12px_12px_24px_rgba(5,7,10,0.7),inset_-12px_-12px_24px_rgba(43,48,58,0.7)]" />

                    <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#e0e5ec] shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.75)] dark:bg-[#1e2229] dark:shadow-[14px_14px_28px_rgba(5,7,10,0.75),-14px_-14px_28px_rgba(43,48,58,0.75)]" />

                    <div className="relative z-10 flex h-full flex-col justify-between">

                        {/* Logo */}

                        <Link
                            href="/"
                            className="inline-flex w-fit items-center gap-3 rounded-[20px] bg-[#e0e5ec] px-4 py-3 shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]"
                        >
                            <img
                                src="/logo2.png"
                                alt="CourseGuide"
                                className="h-10 w-10 rounded-[12px] object-contain"
                            />

                            <div>
                                <div className="translate-y-1">
                                    <span className="text-[16px] font-bold tracking-tight text-black dark:text-[#f5f7fa]">
                                        Course
                                    </span>

                                    <span className="text-[16px] font-bold tracking-tight text-[orangered]">
                                        Guide
                                    </span>
                                </div>

                                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[orangered]">
                                    AI Learning
                                </p>
                            </div>
                        </Link>


                        {/* Main content */}

                        <div className="max-w-lg">

                            <div className="mb-6 inline-flex items-center rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs font-medium text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]">
                                Your learning journey
                            </div>

                            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.035em] text-black dark:text-[#f5f7fa] xl:text-6xl">
                                Learn with a guide
                                <br />
                                that understands
                                <br />
                                <span className="text-[orangered]">
                                    you.
                                </span>
                            </h1>

                            <p className="mt-7 max-w-md text-[15px] leading-7 text-[#3f3e3e] dark:text-[#a8adb7]">
                                Discover courses, understand difficult concepts, practice with
                                quizzes, and get help whenever you need it.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">

                                <span className="rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                                    AI-powered learning
                                </span>

                                <span className="rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                                    Smart quizzes
                                </span>

                                <span className="rounded-[50px] bg-[#e0e5ec] px-4 py-2 text-xs text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                                    Track progress
                                </span>

                            </div>
                        </div>


                        {/* Footer */}

                        <p className="text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                            © 2026 CourseGuide AI
                        </p>

                    </div>
                </div>


                {/* ================= RIGHT SIDE ================= */}

                <div className="flex items-center justify-center bg-[#e0e5ec] px-6 py-10 dark:bg-[#1a1d23] sm:px-10">

                    <div className="w-full max-w-[414px]">

                        {/* Back */}

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-[12px] bg-[#e0e5ec] px-3 py-2 text-sm text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] hover:text-[orangered] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]"
                        >
                            <ArrowLeft size={16} />
                            Back to home
                        </Link>


                        {/* Heading */}

                        <div className="mt-10">

                            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-[#f5f7fa]">
                                Welcome back
                            </h1>

                            <p className="mt-2 text-sm text-[#3f3e3e] dark:text-[#a8adb7]">
                                Sign in to continue your learning journey.
                            </p>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleLogin}
                            className="mt-8 rounded-[30px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-7"
                        >

                            {/* Email */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-black dark:text-[#f5f7fa]"
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
                                    className="mt-2 h-11 w-full rounded-[12px] bg-[#e0e5ec] px-3.5 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:placeholder:text-[#777] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]"
                                />

                            </div>


                            {/* Password */}

                            <div className="mt-5">

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-black dark:text-[#f5f7fa]"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-[orangered] transition-colors hover:text-[red]"
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
                                        className="h-11 w-full rounded-[12px] bg-[#e0e5ec] px-3.5 pr-11 text-sm text-black outline-none shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[#777] focus:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#f5f7fa] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)] dark:focus:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#e0e5ec] text-[#3f3e3e] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:text-[orangered] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]"
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
                                <div className="mt-4 rounded-[12px] bg-[#e0e5ec] px-4 py-3 text-sm text-red-600 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-red-400 dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]">
                                    {error}
                                </div>
                            )}


                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[orangered] text-sm font-semibold text-white shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-[red] hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.3)] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)] dark:hover:shadow-[inset_3px_3px_6px_rgba(120,40,0,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
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

                            <div className="h-px flex-1 bg-[#c8ced7] dark:bg-[#3a404b]" />

                            <span className="text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-[#c8ced7] dark:bg-[#3a404b]" />

                        </div>


                        {/* Google */}

                        <button
                            type="button"
                            className="flex h-11 w-full items-center justify-center gap-3 rounded-[12px] bg-[#e0e5ec] text-sm font-medium text-[#3f3e3e] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] transition-all duration-200 hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[#a8adb7] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.65),inset_-3px_-3px_6px_rgba(43,48,58,0.65)]"
                        >

                            <span className="font-bold text-[orangered]">
                                G
                            </span>

                            Continue with Google

                        </button>


                        {/* Register */}

                        <p className="mt-8 text-center text-sm text-[#3f3e3e] dark:text-[#a8adb7]">

                            Don't have an account?{" "}

                            <Link
                                href="/register"
                                className="font-semibold text-[orangered] transition-colors hover:text-[red]"
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