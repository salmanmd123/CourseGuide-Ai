"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { saveQuizLocally } from "@/lib/quiz-storage";
import Navbar from "@/components/navbar";
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
  BriefcaseBusiness,
  Sparkles,
  BookOpen,
  ChevronRight,
  History,
  RefreshCw,
  X,
  Layers,
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

type ApiResponse = {
  subjects?: Subject[];
  topics?: Topic[];
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
  AI_ML: "bg-violet-500/10 text-[#ff4500]",
  WEB_DEVELOPMENT: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  DATA_SCIENCE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CYBERSECURITY: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  CLOUD_DEVOPS: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  CS_FUNDAMENTALS: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  MATHEMATICS: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  CAREER: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
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
  "briefcase": BriefcaseBusiness,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const [generateSubject, setGenerateSubject] = useState("");
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateDifficulty, setGenerateDifficulty] = useState("MEDIUM");
  const [questionCount, setQuestionCount] = useState("10");

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ catalogOnly: "true" });

      if (search.trim()) params.set("search", search.trim());
      if (category !== "ALL") params.set("category", category);

      const response = await fetch(`/api/quizzes?${params.toString()}`, {
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load quizzes.");
      }

      setSubjects(data.subjects ?? []);
      setTopics(data.topics ?? []);
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
  }, [search, category, generateSubject]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCatalog();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchCatalog]);


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
  }

  function chooseCategory(nextCategory: string) {
    setCategory(nextCategory);
  }

  function chooseSubject(subject: Subject) {
    setGenerateSubject(String(subject.id));
    setGenerateTopic("");
    setShowGenerator(true);
    setGenerateError("");
  }

  async function generateQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setGenerateError("");

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

      if (!data.quiz?.id || !data.quizToken || !Array.isArray(data.questions) || !data.questions.length) {
        throw new Error("The quiz was generated but its local question set could not be prepared.");
      }

      await saveQuizLocally({
        quizId: Number(data.quiz.id),
        quizToken: String(data.quizToken),
        questions: data.questions,
        savedAt: new Date().toISOString(),
      });

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
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="neo-surface relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#ff4500]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-[#ff4500]/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 neo-inset rounded-full px-3 py-1.5 text-xs font-semibold text-[#ff4500]">
                <Sparkles className="h-4 w-4" />
                YOUR PERSONAL PRACTICE SPACE
              </div>

              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                Test your knowledge.
                <span className="block text-[#ff4500]">
                  Level up your skills.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 opacity-75 sm:text-base">
                Practice programming, AI, web development, cybersecurity and
                more. Build confidence with quizzes tailored to your learning
                goals.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowGenerator(true)}
                  className="neo-accent-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Quiz
                </button>

                <Link
                  href="/quizzes/history"
                  className="neo-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  <History className="h-4 w-4" />
                  My Quiz History
                </Link>
              </div>
            </div>

            <div className="hidden h-44 w-44 items-center justify-center neo-surface rounded-3xl lg:flex">
              <div className="flex h-28 w-28 items-center justify-center neo-inset rounded-3xl text-[#ff4500]">
                <Brain className="h-16 w-16" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-50" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search subjects..."
              className="neo-inset w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-sm outline-none transition placeholder:text-zinc-500 focus:ring-2 focus:ring-[#ff4500]/20 dark:placeholder:text-zinc-400"
            />
          </div>
        </section>

        {/* Categories */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Explore categories</h2>
              <p className="mt-1 text-sm opacity-60">
                Choose an area to get started.
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pt-3 pb-3">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              const active = category === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => chooseCategory(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#ff4500] text-white shadow-md shadow-[#ff4500]/20"
                      : "neo-button hover:text-[#ff4500]"
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
              <p className="mt-1 text-sm opacity-60">
                {featuredSubjects.length} subjects in this selection
              </p>
            </div>
          </div>

          {loading && subjects.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-[var(--neo-bg)] dark:border-slate-800 dark:bg-[var(--neo-bg)]"
                />
              ))}
            </div>
          ) : featuredSubjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <BookOpen className="mx-auto h-9 w-9 opacity-50" />
              <p className="mt-3 font-semibold">No subjects found</p>
              <p className="mt-1 text-sm opacity-60">
                Try another search or category.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-[#ff4500] hover:underline dark:text-[#ff4500]"
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
                    className={`neo-surface group rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:text-[#ff4500] ${
                      generateSubject === String(subject.id)
                        ? "ring-2 ring-[#ff4500]/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          CATEGORY_STYLES[subject.category] ??
                          "bg-violet-500/10 text-[#ff4500]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#ff4500]" />
                    </div>

                    <h3 className="mt-4 font-bold">{subject.name}</h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 opacity-60">
                      {subject.description || "Practice and strengthen your skills."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {count} topics
                      </span>
                      <span className="text-xs opacity-50">
                        {formatCategory(subject.category)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>


      </div>

      {/* AI Quiz Generator */}
      {showGenerator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[var(--neo-bg)]/60 p-4 backdrop-blur-sm"
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
            className="my-8 w-full max-w-xl rounded-3xl border border-slate-200 bg-[var(--neo-bg)] p-6 shadow-2xl dark:border-slate-800 dark:bg-[var(--neo-bg)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-[#ff4500]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 id="generator-title" className="mt-4 text-2xl font-bold">
                  Create an AI quiz
                </h2>
                <p className="mt-2 text-sm leading-6 opacity-60">
                  Customize your practice session. Your questions will be saved locally in this browser so you can retake the same quiz.
                </p>
              </div>
              <button
                onClick={() => setShowGenerator(false)}
                disabled={generating}
                aria-label="Close generator"
                className="rounded-xl p-2 opacity-60 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
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
                  className="w-full appearance-auto rounded-xl border border-slate-300/80 bg-[var(--neo-bg)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.55)] outline-none transition-all duration-200 hover:border-slate-400 focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 dark:border-slate-600/80 dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.03)] dark:hover:border-slate-500"
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
                  Topic <span className="font-normal opacity-50">(optional)</span>
                </label>
                <select
                  id="generate-topic"
                  value={generateTopic}
                  onChange={(event) => setGenerateTopic(event.target.value)}
                  className="w-full appearance-auto rounded-xl border border-slate-300/80 bg-[var(--neo-bg)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.55)] outline-none transition-all duration-200 hover:border-slate-400 focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 dark:border-slate-600/80 dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.03)] dark:hover:border-slate-500"
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
                    className="w-full appearance-auto rounded-xl border border-slate-300/80 bg-[var(--neo-bg)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.55)] outline-none transition-all duration-200 hover:border-slate-400 focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 dark:border-slate-600/80 dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.03)] dark:hover:border-slate-500"
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
                    className="w-full appearance-auto rounded-xl border border-slate-300/80 bg-[var(--neo-bg)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),inset_-3px_-3px_6px_rgba(255,255,255,0.55)] outline-none transition-all duration-200 hover:border-slate-400 focus:border-[#ff4500] focus:ring-2 focus:ring-[#ff4500]/20 dark:border-slate-600/80 dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.03)] dark:hover:border-slate-500"
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


              <button
                type="submit"
                disabled={generating || subjects.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff4500] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4500]/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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

              <p className="text-center text-xs leading-5 opacity-50">
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