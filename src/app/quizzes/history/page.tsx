
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  LoaderCircle,
  RefreshCw,
  Search,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

type Attempt = {
  attemptId: number;
  score: number;
  totalQuestions: number;
  completedAt: string | null;
  quizId: number;
  quizTitle: string;
  difficulty: string;
  quizType: string;
  subjectId: number;
  subjectName: string;
  topicName: string | null;
  percentage: number;
};

type HistorySummary = {
  totalAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  averagePercentage: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type HistoryResponse = {
  summary: HistorySummary;
  attempts: Attempt[];
  pagination: Pagination;
};

const PAGE_SIZE = 10;

const difficultyOptions = ["ALL", "EASY", "MEDIUM", "HARD"];

function formatDate(dateValue: string | null): string {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(dateValue: string | null): string {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (percentage >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function getScoreLabel(percentage: number): string {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 80) return "Great work";
  if (percentage >= 60) return "Good effort";
  if (percentage >= 40) return "Keep practising";
  return "Room to improve";
}

function getDifficultyClass(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return "text-emerald-700 dark:text-emerald-400";
    case "HARD":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-amber-700 dark:text-amber-400";
  }
}

export default function QuizHistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");

  const fetchHistory = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `/api/quizzes/history?page=${page}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Unable to load your quiz history."
          );
        }

        if (
          !result ||
          !Array.isArray(result.attempts) ||
          !result.summary ||
          !result.pagination
        ) {
          throw new Error("The quiz history response was invalid.");
        }

        setData(result as HistoryResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your history."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page]
  );

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const summary = data?.summary;

  const filteredAttempts = useMemo(() => {
    if (!data) return [];

    const query = search.trim().toLowerCase();

    return data.attempts.filter((attempt) => {
      const matchesSearch =
        !query ||
        attempt.quizTitle.toLowerCase().includes(query) ||
        attempt.subjectName.toLowerCase().includes(query) ||
        (attempt.topicName ?? "").toLowerCase().includes(query);

      const matchesDifficulty =
        difficulty === "ALL" ||
        attempt.difficulty.toUpperCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [data, search, difficulty]);

  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);
  const totalAttempts = summary?.totalAttempts ?? 0;
  const averagePercentage = Number(summary?.averagePercentage ?? 0);
  const averageScore = Number.isFinite(averagePercentage)
    ? Math.round(averagePercentage)
    : 0;

  const accuracy =
    summary && summary.totalQuestions > 0
      ? Math.round(
          (summary.totalCorrect / summary.totalQuestions) * 100
        )
      : 0;

  function changePage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  }

  return (
    <main className="min-h-screen bg-[#e0e5ec] px-4 py-6 text-[#343a46] dark:bg-[#1a1d23] dark:text-[#e7eaf0] sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/quizzes"
            className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={17} />
            Back to Quiz Center
          </Link>

          <button
            type="button"
            onClick={() => void fetchHistory(true)}
            disabled={loading || refreshing}
            className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e0e5ec] text-[#ff4500] shadow-[6px_6px_12px_#b8bec7,-6px_-6px_12px_#ffffff] dark:bg-[#1e2229] dark:shadow-[6px_6px_12px_#111318,-6px_-6px_12px_#292e38]">
            <History size={28} />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff4500]">
            Your learning journey
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Quiz History
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            Track your progress, revisit previous quizzes, and see how your
            knowledge improves with every attempt.
          </p>
        </section>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="neo-surface mb-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-red-600 dark:text-red-400">
                Could not load quiz history
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchHistory(true)}
              className="neo-accent-button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Performance summary */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold sm:text-xl">
              Performance overview
            </h2>

            {loading ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Loading statistics...
              </span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                All recorded attempts
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<BookOpen size={22} />}
              label="Quizzes attempted"
              value={loading ? "—" : totalAttempts.toLocaleString("en-IN")}
              description="Total completed attempts"
              accent="orange"
            />

            <StatCard
              icon={<Target size={22} />}
              label="Average score"
              value={loading ? "—" : `${averageScore}%`}
              description="Average across your attempts"
              accent="blue"
            />

            <StatCard
              icon={<CheckCircle2 size={22} />}
              label="Correct answers"
              value={
                loading
                  ? "—"
                  : (summary?.totalCorrect ?? 0).toLocaleString("en-IN")
              }
              description={
                loading
                  ? "Across all attempts"
                  : `${accuracy}% overall answer accuracy`
              }
              accent="green"
            />

            <StatCard
              icon={<Trophy size={22} />}
              label="Questions answered"
              value={
                loading
                  ? "—"
                  : (summary?.totalQuestions ?? 0).toLocaleString("en-IN")
              }
              description="Total questions attempted"
              accent="purple"
            />
          </div>
        </section>

        {/* Attempts section */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                Previous attempts
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Your completed quizzes and individual results.
              </p>
            </div>

            {!loading && data && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data.pagination.total.toLocaleString("en-IN")} total attempts
              </p>
            )}
          </div>

          {/* Search and difficulty filters */}
          <div className="neo-surface mb-6 flex flex-col gap-4 rounded-2xl p-4 sm:p-5 lg:flex-row lg:items-center">
            <div className="neo-inset flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3">
              <Search
                size={18}
                className="shrink-0 text-gray-500 dark:text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by quiz, subject or topic..."
                aria-label="Search quiz history"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-500 dark:placeholder:text-gray-500"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="shrink-0 text-gray-500 hover:text-[#ff4500]"
                >
                  <XCircle size={17} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Difficulty
              </span>

              {difficultyOptions.map((option) => {
                const active = difficulty === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDifficulty(option)}
                    aria-pressed={active}
                    className={
                      active
                        ? "neo-accent-button rounded-lg px-3 py-2 text-xs font-bold"
                        : "neo-button rounded-lg px-3 py-2 text-xs font-semibold transition"
                    }
                  >
                    {option === "ALL"
                      ? "All"
                      : option.charAt(0) + option.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loading && !data && (
            <div className="neo-surface flex min-h-64 flex-col items-center justify-center rounded-2xl p-10 text-center">
              <LoaderCircle
                size={34}
                className="animate-spin text-[#ff4500]"
              />
              <p className="mt-4 font-semibold">Loading your history...</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Fetching your quiz attempts and statistics.
              </p>
            </div>
          )}

          {/* Empty history */}
          {!loading &&
            !error &&
            data &&
            data.pagination.total === 0 && (
              <div className="neo-surface flex flex-col items-center rounded-2xl px-5 py-14 text-center sm:py-20">
                <div className="neo-inset mb-5 flex h-20 w-20 items-center justify-center rounded-full text-[#ff4500]">
                  <History size={34} />
                </div>

                <h3 className="text-xl font-extrabold">
                  Your story starts here
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                  You haven't completed any quizzes yet. Take your first quiz
                  and your results will appear here.
                </p>

                <Link
                  href="/quizzes"
                  className="neo-accent-button mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                >
                  Explore quizzes
                  <ArrowRight size={17} />
                </Link>
              </div>
            )}

          {/* No search matches */}
          {!loading &&
            !error &&
            data &&
            data.pagination.total > 0 &&
            filteredAttempts.length === 0 && (
              <div className="neo-surface flex flex-col items-center rounded-2xl px-5 py-12 text-center">
                <Search size={30} className="text-[#ff4500]" />
                <h3 className="mt-4 font-bold">No matching attempts</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Try another search term or change the difficulty filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDifficulty("ALL");
                  }}
                  className="neo-button mt-5 rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  Clear filters
                </button>
              </div>
            )}

          {/* Attempt cards */}
          {!loading && !error && data && filteredAttempts.length > 0 && (
            <div className="space-y-4">
              {filteredAttempts.map((attempt) => {
                const percentage = Math.max(
                  0,
                  Math.min(100, Number(attempt.percentage) || 0)
                );

                return (
                  <article
                    key={attempt.attemptId}
                    className="neo-surface rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-bold ${getDifficultyClass(
                              attempt.difficulty
                            )} neo-inset`}
                          >
                            {attempt.difficulty}
                          </span>

                          <span className="neo-inset rounded-lg px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {attempt.quizType === "AI"
                              ? "AI Generated"
                              : "Curated"}
                          </span>
                        </div>

                        <h3 className="break-words text-lg font-extrabold leading-snug sm:text-xl">
                          {attempt.quizTitle}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen size={15} />
                            {attempt.subjectName}
                          </span>

                          {attempt.topicName && (
                            <span className="inline-flex items-center gap-1.5">
                              <Target size={15} />
                              {attempt.topicName}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(attempt.completedAt)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {formatDateTime(attempt.completedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 border-t border-gray-300/50 pt-4 dark:border-gray-700/50 lg:min-w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5">
                            <span
                              className={`text-3xl font-extrabold tabular-nums ${getScoreColor(
                                percentage
                              )}`}
                            >
                              {Math.round(percentage)}%
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {attempt.score} of {attempt.totalQuestions} correct
                          </p>

                          <p
                            className={`mt-1 text-xs font-bold ${getScoreColor(
                              percentage
                            )}`}
                          >
                            {getScoreLabel(percentage)}
                          </p>

                          <div className="neo-inset mt-3 h-2 overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full bg-[#ff4500] transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          href={`/quizzes/${attempt.quizId}`}
                          className="neo-accent-button inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5"
                          aria-label={`Practice ${attempt.quizTitle} again`}
                        >
                          Practice
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            !error &&
            data &&
            data.pagination.total > 0 && (
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {data.pagination.page} of {totalPages}
                  {filteredAttempts.length !== data.attempts.length && (
                    <span className="ml-2 text-xs">
                      (filtered on this page)
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1 || loading}
                    className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="neo-inset rounded-lg px-4 py-2 text-sm font-bold tabular-nums">
                    {page}
                  </span>

                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
        </section>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-300/60 py-6 text-center dark:border-gray-700/60 sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Every attempt is a step forward. Keep learning.
          </p>

          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#ff4500] transition hover:gap-3"
          >
            Continue learning
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  accent: "orange" | "blue" | "green" | "purple";
};

function StatCard({
  icon,
  label,
  value,
  description,
  accent,
}: StatCardProps) {
  const accentClasses = {
    orange: "text-[#ff4500]",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-emerald-600 dark:text-emerald-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="neo-surface rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {label}
          </p>

          <p className="mt-3 break-words text-3xl font-extrabold tracking-tight tabular-nums">
            {value}
          </p>
        </div>

        <div
          className={`neo-inset flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
