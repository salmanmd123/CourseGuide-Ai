
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Brain,
  Code2,
  Globe,
  Database,
  ShieldCheck,
  Cloud,
  Cpu,
  Calculator,
  Sparkles,
  BookOpen,
  Clock3,
  ChevronRight,
  History,
  RefreshCw,
  X,
  Layers,
  Play,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Subject = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  icon: string;
  sortOrder: number;
};

type Topic = {
  id: number;
  subjectId: number;
  name: string;
  slug: string;
  description: string | null;
};

type Quiz = {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  quizType: string;
  questionCount: number;
  subjectId: number;
  subjectName: string;
  subjectSlug: string;
  topicId: number | null;
  topicName: string | null;
};

type ApiResponse = {
  subjects?: Subject[];
  topics?: Topic[];
  quizzes?: Quiz[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

const CATEGORIES = [
  { id: "ALL", label: "All Subjects", icon: Layers },
  { id: "PROGRAMMING", label: "Programming", icon: Code2 },
  { id: "AI_ML", label: "AI & ML", icon: Brain },
  { id: "WEB_DEVELOPMENT", label: "Web Development", icon: Globe },
  { id: "DATA_SCIENCE", label: "Data Science", icon: Database },
  { id: "CYBERSECURITY", label: "Cybersecurity", icon: ShieldCheck },
  { id: "CLOUD_DEVOPS", label: "Cloud & DevOps", icon: Cloud },
  { id: "CS_FUNDAMENTALS", label: "Core CS", icon: Cpu },
  { id: "MATHEMATICS", label: "Mathematics", icon: Calculator },
];

const CATEGORY_STYLES: Record<string, string> = {
  PROGRAMMING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  AI_ML: "bg-[var(--neo-accent)]/10 text-[var(--neo-accent)]",
  WEB_DEVELOPMENT: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  DATA_SCIENCE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CYBERSECURITY: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  CLOUD_DEVOPS: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  CS_FUNDAMENTALS: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  MATHEMATICS: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const ICONS: Record<string, typeof Code2> = {
  code: Code2,
  brain: Brain,
  globe: Globe,
  database: Database,
  "shield-check": ShieldCheck,
  cloud: Cloud,
  cpu: Cpu,
  calculator: Calculator,
  "book-open": BookOpen,
  layers: Layers,
  sparkles: Sparkles,
};

function getIcon(icon: string) {
  return ICONS[icon] ?? BookOpen;
}

function formatCategory(category: string) {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

export default function QuizzesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [notice, setNotice] = useState("");

  const [generateSubject, setGenerateSubject] = useState("");
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateDifficulty, setGenerateDifficulty] = useState("MEDIUM");
  const [questionCount, setQuestionCount] = useState("10");

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });

      if (search.trim()) params.set("search", search.trim());
      if (category !== "ALL") params.set("category", category);
      if (selectedSubject !== "ALL") {
        params.set("subjectId", selectedSubject);
      }
      if (selectedTopic !== "ALL") {
        params.set("topicId", selectedTopic);
      }
      if (difficulty !== "ALL") {
        params.set("difficulty", difficulty);
      }

      const response = await fetch(`/api/quizzes?${params.toString()}`, {
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load quizzes.");
      }

      setSubjects(data.subjects ?? []);
      setTopics(data.topics ?? []);
      setQuizzes(data.quizzes ?? []);
      setTotalPages(data.pagination?.totalPages ?? 0);
      setTotalQuizzes(data.pagination?.total ?? 0);

      if (!generateSubject && data.subjects?.length) {
        setGenerateSubject(String(data.subjects[0].id));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load the Quiz Center."
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    category,
    selectedSubject,
    selectedTopic,
    difficulty,
    generateSubject,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCatalog();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchCatalog]);

  const visibleTopics = useMemo(() => {
    if (selectedSubject === "ALL") return topics;
    return topics.filter(
      (topic) => topic.subjectId === Number(selectedSubject)
    );
  }, [topics, selectedSubject]);

  const generatorTopics = useMemo(
    () => topics.filter((topic) => topic.subjectId === Number(generateSubject)),
    [topics, generateSubject]
  );

  const featuredSubjects = useMemo(() => {
    const selected = category === "ALL"
      ? subjects
      : subjects.filter((subject) => subject.category === category);

    if (search.trim()) {
      const query = search.toLowerCase();
      return selected.filter(
        (subject) =>
          subject.name.toLowerCase().includes(query) ||
          subject.description?.toLowerCase().includes(query)
      );
    }

    return selected;
  }, [subjects, category, search]);

  function resetFilters() {
    setSearch("");
    setCategory("ALL");
    setSelectedSubject("ALL");
    setSelectedTopic("ALL");
    setDifficulty("ALL");
    setPage(1);
  }

  function chooseCategory(nextCategory: string) {
    setCategory(nextCategory);
    setSelectedSubject("ALL");
    setSelectedTopic("ALL");
    setPage(1);
  }

  function chooseSubject(subject: Subject) {
    setCategory(subject.category);
    setSelectedSubject(String(subject.id));
    setSelectedTopic("ALL");
    setPage(1);

    document.getElementById("quiz-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function generateQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setGenerateError("");
    setNotice("");

    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: Number(generateSubject),
          topicId: generateTopic ? Number(generateTopic) : null,
          difficulty: generateDifficulty,
          count: Number(questionCount),
          save: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate the quiz.");
      }

      if (!data.quiz?.id) {
        throw new Error("The quiz was generated but no saved quiz ID was returned.");
      }

      window.location.assign(`/quizzes/${data.quiz.id}`);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Unable to generate the quiz."
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl p-6 neo-surface-lg sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[var(--neo-accent)]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-[var(--neo-accent)]/5 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--neo-accent)] neo-pill">
                <Sparkles className="h-4 w-4" />
                YOUR PERSONAL PRACTICE SPACE
              </div>

              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                Test your knowledge.
                <span className="block text-[var(--neo-accent)]">
                  Level up your skills.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Practice programming, AI, web development, cybersecurity and
                more. Build confidence with quizzes tailored to your learning
                goals.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowGenerator(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white neo-accent-button"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Quiz
                </button>

                <Link
                  href="/quizzes/history"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold neo-button"
                >
                  <History className="h-4 w-4" />
                  My Quiz History
                </Link>
              </div>
            </div>

            <div className="hidden h-44 w-44 items-center justify-center rounded-3xl neo-surface p-3 lg:flex">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl rounded-3xl bg-[var(--neo-accent)] text-white shadow-lg shadow-orange-900/20">
                <Brain className="h-16 w-16" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search subjects, topics or quizzes..."
              className="w-full rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--neo-accent)]/20 neo-inset"
            />
          </div>
        </section>

        {/* Categories */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Explore categories</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose an area to get started.
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const active = category === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => chooseCategory(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition neo-button ${
                    active
                      ? "bg-[var(--neo-accent)] text-white shadow-md shadow-orange-900/20"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Subject catalog */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Browse subjects</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {featuredSubjects.length} subjects in this selection
              </p>
            </div>
          </div>

          {loading && subjects.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl neo-surface-sm"
                />
              ))}
            </div>
          ) : featuredSubjects.length === 0 ? (
            <div className="rounded-2xl p-10 text-center neo-surface">
              <BookOpen className="mx-auto h-9 w-9 text-slate-400" />
              <p className="mt-3 font-semibold">No subjects found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or category.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-[var(--neo-accent)] hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredSubjects.map((subject) => {
                const Icon = getIcon(subject.icon);
                const count = topics.filter(
                  (topic) => topic.subjectId === subject.id
                ).length;

                return (
                  <button
                    key={subject.id}
                    onClick={() => chooseSubject(subject)}
                    className={`group rounded-2xl p-5 text-left transition hover:-translate-y-0.5 neo-surface ${
                      selectedSubject === String(subject.id)
                        ? "ring-2 ring-[var(--neo-accent)]/40"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          CATEGORY_STYLES[subject.category] ??
                          "bg-[var(--neo-accent)]/10 text-[var(--neo-accent)]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--neo-accent)]" />
                    </div>

                    <h3 className="mt-4 font-bold">{subject.name}</h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
                      {subject.description || "Practice and strengthen your skills."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full rounded-full px-2.5 py-1 text-xs text-slate-600 neo-pill">
                        {count} topics
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatCategory(subject.category)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quiz listing and filters */}
        <section id="quiz-list" className="mt-12 scroll-mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Available quizzes</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {totalQuizzes} published quizzes available
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />

              <select
                aria-label="Filter by subject"
                value={selectedSubject}
                onChange={(event) => {
                  setSelectedSubject(event.target.value);
                  setSelectedTopic("ALL");
                  setPage(1);
                }}
                className="max-w-[190px] rounded-xl px-3 py-2.5 text-sm outline-none neo-inset-sm"
              >
                <option value="ALL">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by topic"
                value={selectedTopic}
                onChange={(event) => {
                  setSelectedTopic(event.target.value);
                  setPage(1);
                }}
                className="max-w-[190px] rounded-xl px-3 py-2.5 text-sm outline-none neo-inset-sm"
              >
                <option value="ALL">All topics</option>
                {visibleTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by difficulty"
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl px-3 py-2.5 text-sm outline-none neo-inset-sm"
              >
                <option value="ALL">All difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <button
                onClick={resetFilters}
                title="Reset filters"
                className="inline-flex items-center justify-center rounded-xl p-2.5 transition neo-button"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
              <button
                onClick={() => void fetchCatalog()}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-56 animate-pulse rounded-2xl neo-surface-sm"
                />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="mt-5 rounded-2xl px-5 py-12 text-center neo-surface">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--neo-accent)]/10 text-[var(--neo-accent)]">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold">
                {totalQuizzes === 0
                  ? "Your quiz library is ready for its first quiz"
                  : "No quizzes match these filters"}
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                {totalQuizzes === 0
                  ? "Generate your first AI quiz to create questions, save them to your library and start practicing."
                  : "Try a different subject, topic, difficulty or search term."}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {totalQuizzes === 0 ? (
                  <button
                    onClick={() => setShowGenerator(true)}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white neo-accent-button"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate your first quiz
                  </button>
                ) : (
                  <button
                    onClick={resetFilters}
                    className="rounded-xl px-5 py-3 text-sm font-semibold text-white neo-accent-button"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quizzes.map((quiz) => (
                  <article
                    key={quiz.id}
                    className="flex flex-col rounded-2xl p-5 transition neo-surface"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          CATEGORY_STYLES[
                            subjects.find((s) => s.id === quiz.subjectId)?.category ?? ""
                          ] ?? "bg-[var(--neo-accent)]/10 text-[var(--neo-accent)]"
                        }`}
                      >
                        {quiz.subjectName}
                      </span>
                      <span className="rounded-full rounded-full px-2.5 py-1 text-xs text-slate-600 neo-pill">
                        {quiz.difficulty}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold leading-6">
                      {quiz.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
                      {quiz.description || "Test your understanding with this quiz."}
                    </p>

                    {quiz.topicName && (
                      <p className="mt-3 text-xs text-slate-500">
                        Topic: {quiz.topicName}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        {quiz.questionCount} questions
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" />
                        ~{Math.max(1, quiz.questionCount)} min
                      </span>
                      {quiz.quizType === "AI" && (
                        <span className="inline-flex items-center gap-1 text-[var(--neo-accent)]">
                          <Sparkles className="h-3.5 w-3.5" />
                          AI
                        </span>
                      )}
                    </div>

                    <div className="mt-5 border-t border-[var(--foreground)]/10 pt-4">
                      <Link
                        href={`/quizzes/${quiz.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white neo-accent-button"
                      >
                        <Play className="h-4 w-4" />
                        Start quiz
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* AI Quiz Generator */}
      {showGenerator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !generating) {
              setShowGenerator(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="generator-title"
            className="my-8 w-full max-w-xl rounded-3xl p-6 neo-surface-lg sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--neo-accent)]/10 text-[var(--neo-accent)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 id="generator-title" className="mt-4 text-2xl font-bold">
                  Create an AI quiz
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Customize your practice session. Your generated quiz will be
                  saved to your library.
                </p>
              </div>
              <button
                onClick={() => setShowGenerator(false)}
                disabled={generating}
                aria-label="Close generator"
                className="rounded-xl p-2 text-slate-500 transition hover:text-[var(--neo-accent)] disabled:opacity-40 neo-button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={generateQuiz} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="generate-subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject
                </label>
                <select
                  id="generate-subject"
                  required
                  value={generateSubject}
                  onChange={(event) => {
                    setGenerateSubject(event.target.value);
                    setGenerateTopic("");
                  }}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--neo-accent)]/20 neo-inset-sm"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="generate-topic"
                  className="mb-2 block text-sm font-semibold"
                >
                  Topic <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <select
                  id="generate-topic"
                  value={generateTopic}
                  onChange={(event) => setGenerateTopic(event.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--neo-accent)]/20 neo-inset-sm"
                >
                  <option value="">All topics in this subject</option>
                  {generatorTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="generate-difficulty"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Difficulty
                  </label>
                  <select
                    id="generate-difficulty"
                    value={generateDifficulty}
                    onChange={(event) => setGenerateDifficulty(event.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--neo-accent)]/20 neo-inset-sm"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="generate-count"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Number of questions
                  </label>
                  <select
                    id="generate-count"
                    value={questionCount}
                    onChange={(event) => setQuestionCount(event.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--neo-accent)]/20 neo-inset-sm"
                  >
                    <option value="5">5 questions</option>
                    <option value="10">10 questions</option>
                    <option value="15">15 questions</option>
                    <option value="20">20 questions</option>
                  </select>
                </div>
              </div>

              {generateError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {generateError}
                </div>
              )}

              {notice && (
                <p className="text-sm text-emerald-600">{notice}</p>
              )}

              <button
                type="submit"
                disabled={generating || subjects.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white neo-accent-button disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating your quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate and save quiz
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                AI-generated questions may occasionally contain errors. Review
                explanations and verify important technical details.
              </p>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
