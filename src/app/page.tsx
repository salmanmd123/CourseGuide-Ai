"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import Navbar from "@/components/navbar";

const features = [
  {
    icon: BookOpen,
    title: "Best courses",
    description:
      "Discover carefully selected courses instead of wasting time searching.",
  },
  {
    icon: Brain,
    title: "AI-powered notes",
    description:
      "Turn lessons into simple notes that are easier to understand and revise.",
  },
  {
    icon: Target,
    title: "Smart quizzes",
    description:
      "Practice what you learned and identify the topics that need more attention.",
  },
  {
    icon: Sparkles,
    title: "AI Tutor",
    description:
      "Ask questions whenever you get stuck and get explanations in simple language.",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  // =========================================================
  // SEARCH
  // =========================================================

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    window.location.href = `/courses?q=${encodeURIComponent(query)}`;
  }

  // =========================================================
  // POPULAR TOPIC SEARCH
  // =========================================================

  function searchTopic(topic: string) {
    setSearch(topic);

    window.location.href = `/courses?q=${encodeURIComponent(topic)}`;
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-50 blur-3xl dark:bg-indigo-950/30" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          {/* ================= LEFT ================= */}
          <div>
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <Sparkles size={14} className="text-indigo-600" />
              A better way to learn
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
              Stop searching.
              <br />
              Start{" "}
              <span className="text-indigo-600">learning.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              CourseGuide AI helps you find the right courses, understand
              difficult topics, practice what you learn, and stay on track.
            </p>

            {/* ================= SEARCH ================= */}
            <form
              onSubmit={handleSearch}
              className="mt-9 flex max-w-2xl items-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <Search
                className="ml-3 shrink-0 text-zinc-400"
                size={20}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="What do you want to learn?"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />

              <button
                type="submit"
                className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Search
              </button>
            </form>

            {/* ================= POPULAR TOPICS ================= */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Python",
                "Data Structures",
                "Machine Learning",
                "DBMS",
              ].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => searchTopic(topic)}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT VISUAL ================= */}
          <div className="relative mx-auto w-full max-w-[500px]">
            {/* Main card */}
            <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.10)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-400">
                      Continue learning
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                      Python Fundamentals
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <BookOpen size={19} />
                  </div>
                </div>

                {/* Current lesson */}
                <div className="mt-6 rounded-xl bg-zinc-950 p-5 text-white dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-800">
                  <p className="text-xs text-zinc-400">
                    CURRENT LESSON
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    Conditional Statements
                  </p>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-700">
                    <div className="h-full w-[72%] rounded-full bg-indigo-500" />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-zinc-400">
                    <span>72% complete</span>
                    <span>8:42 remaining</span>
                  </div>
                </div>

                {/* AI features */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                    />

                    <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                      AI Notes
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Ready to review
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <Target
                      size={18}
                      className="text-indigo-600 dark:text-indigo-400"
                    />

                    <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                      Quiz
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      8 questions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak card */}
            <div className="absolute -bottom-6 -left-8 hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-2xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Learning streak
                  </p>

                  <p className="text-xs text-zinc-500">
                    7 days 🔥
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="border-y border-zinc-100 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-600">
              EVERYTHING YOU NEED
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Learning should feel simple.
            </h2>

            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              One place to discover, learn, practice, and improve.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:shadow-2xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-5 font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-600">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            From search to understanding.
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {[
            ["01", "Search", "Tell us what you want to learn."],
            ["02", "Choose", "Pick from the best available courses."],
            ["03", "Learn", "Watch, take notes, and ask questions."],
            ["04", "Improve", "Practice and track your progress."],
          ].map(([number, title, description]) => (
            <div key={number} className="relative">
              <span className="text-sm font-bold text-indigo-600">
                {number}
              </span>

              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-zinc-950 p-10 text-white dark:bg-white dark:text-zinc-950 sm:p-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to learn better?
            </h2>

            <p className="mt-3 max-w-xl text-zinc-400 dark:text-zinc-500">
              Find your next course and start building your skills today.
            </p>
          </div>

          <Link
            href="/courses"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
          >
            Explore courses
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CourseGuide AI</p>

          <p>Learn smarter. Achieve more.</p>
        </div>
      </footer>
    </main>
  );
}