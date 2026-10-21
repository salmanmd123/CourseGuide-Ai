
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getQuizLocally } from "@/lib/quiz-storage";
import Navbar from "@/components/navbar";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

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

type Question = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  sortOrder: number;
};

type QuizResult = {
  questionId: number;
  question: string;
  options: Record<string, string>;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

type Attempt = {
  id: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
};

type DetailResponse = {
  quiz?: Quiz;
  questions?: Question[];
  error?: string;
};

type SubmitResponse = {
  message?: string;
  attempt?: Attempt;
  quiz?: { id: number; title: string };
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  results?: QuizResult[];
  error?: string;
};

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

const OPTION_STYLES: Record<string, string> = {
  A: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  B: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  C: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  D: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

function optionText(question: Question, key: string) {
  switch (key) {
    case "A":
      return question.optionA;
    case "B":
      return question.optionB;
    case "C":
      return question.optionC;
    case "D":
      return question.optionD;
    default:
      return "";
  }
}


const CODE_LANGUAGE_PATTERN = /^(python|py|javascript|js|typescript|ts|tsx|jsx|java|c\+\+|cpp|csharp|c#|c|sql|html|css|bash|json|php|ruby|go|rust)$/i;

type ContentSegment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string; language: string };

function normalizeLanguage(value: string): string {
  const raw = value.trim().toLowerCase();
  const aliases: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    "c++": "cpp",
    "c#": "csharp",
  };
  return aliases[raw] ?? (raw || "code");
}

function detectCodeLanguage(code: string): string {
  if (/^\s*#\s*include\s*[<"]/.test(code) || /\bprintf\s*\(/.test(code)) return "c";
  if (/\bstd::|#\s*include\s*<iostream>/.test(code)) return "cpp";
  if (/\bpublic\s+static\s+void\s+main\b|System\.out\./.test(code)) return "java";
  if (/\bdef\s+\w+\s*\(|\bprint\s*\(/.test(code)) return "python";
  if (/\bconsole\.log\s*\(|\b(const|let|var)\s+\w+\s*=/.test(code)) return "javascript";
  return "code";
}

function looksLikeCodeLine(line: string): boolean {
  const text = line.trim();
  if (!text) return true;
  return (
    /^#\s*(include|define|pragma|import)\b/.test(text) ||
    /^(?:public|private|protected|static|final|class|interface|enum|def|function|async|export|import|from|return|if|else|elif|for|while|switch|case|break|continue|try|catch|finally|throw|const|let|var|int|float|double|char|bool|boolean|void|String|auto|using|namespace|struct)\b/.test(text) ||
    /^[{}()[\];]/.test(text) ||
    /[=;{}()]\s*$/.test(text) ||
    /(?:\+\+|--|=>|->|::|\+=|-=|\*=|\/=|\bprintf\s*\(|\bscanf\s*\(|\bconsole\.log\s*\(|\bprint\s*\(|\bSystem\.out\.)/.test(text) ||
    /^[A-Za-z_$][\w$.[\]()>]*\s*(?:=|\+=|-=|\+\+|--|\()/.test(text)
  );
}

function parseLanguageLabelledCode(value: string): ContentSegment[] | null {
  const lines = value.split("\n");
  const segments: ContentSegment[] = [];
  let cursor = 0;
  let found = false;

  while (cursor < lines.length) {
    const languageMatch = lines[cursor].trim().match(CODE_LANGUAGE_PATTERN);
    if (!languageMatch || cursor + 1 >= lines.length) {
      cursor++;
      continue;
    }

    let end = cursor + 1;
    let sawCode = false;
    let lastNonEmpty = end;

    while (end < lines.length) {
      const line = lines[end];
      if (!line.trim()) {
        end++;
        continue;
      }
      if (!looksLikeCodeLine(line)) break;
      sawCode = true;
      lastNonEmpty = end;
      end++;
    }

    if (!sawCode) {
      cursor++;
      continue;
    }

    const codeLines = lines.slice(cursor + 1, lastNonEmpty + 1);
    const before = lines.slice(0, cursor).join("\n").trimEnd();
    const after = lines.slice(lastNonEmpty + 1).join("\n").trimStart();

    if (before) segments.push({ type: "text", value: before });
    segments.push({
      type: "block",
      language: normalizeLanguage(languageMatch[1]),
      value: codeLines.join("\n").trim(),
    });
    if (after) segments.push(...parseFencedAndInline(after));
    found = true;
    break;
  }

  return found ? segments : null;
}

function parseFencedAndInline(value: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const fencedPattern = /```([\w+#.-]*)[ \t]*\n?([\s\S]*?)```/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = fencedPattern.exec(value)) !== null) {
    if (match.index > cursor) {
      segments.push(...parseInline(value.slice(cursor, match.index)));
    }
    const code = match[2].replace(/^\n|\n$/g, "");
    segments.push({
      type: "block",
      language: normalizeLanguage(match[1] || detectCodeLanguage(code)),
      value: code,
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) segments.push(...parseInline(value.slice(cursor)));
  return segments.length ? segments : [{ type: "text", value }];
}

function parseInline(value: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const inlinePattern = /`([^`\n]+)`/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(value)) !== null) {
    if (match.index > cursor) {
      segments.push({ type: "text", value: value.slice(cursor, match.index) });
    }
    segments.push({ type: "inline", value: match[1] });
    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) segments.push({ type: "text", value: value.slice(cursor) });
  return segments.length ? segments : [{ type: "text", value }];
}

function parseFormattedContent(value: string): ContentSegment[] {
  const labelled = parseLanguageLabelledCode(value);
  if (labelled) return labelled;

  const fenced = parseFencedAndInline(value);
  if (fenced.some((segment) => segment.type === "block")) return fenced;

  // If a stored question has code but no explicit language label, format only
  // when there are strong programming-language markers to avoid false positives.
  if (looksLikeCodeLine(value) && detectCodeLanguage(value) !== "code") {
    return [{ type: "block", language: detectCodeLanguage(value), value: value.trim() }];
  }

  return fenced;
}

function FormattedContent({
  value,
  className = "",
}: {
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return null;
  const segments = parseFormattedContent(value);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "block") {
          return (
            <div
              key={index}
              className="my-4 block min-w-0 max-w-full overflow-hidden rounded-xl border border-black/10 bg-[#151922] text-left text-slate-100 shadow-inner dark:border-white/10"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {segment.language}
                </span>
                <span className="text-[10px] text-slate-500">Code snippet</span>
              </div>
              <pre className="max-w-full overflow-x-auto whitespace-pre p-4 font-mono text-[13px] leading-6 [tab-size:4]">
                <code>{segment.value}</code>
              </pre>
            </div>
          );
        }

        if (segment.type === "inline") {
          return (
            <code
              key={index}
              className="rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[0.92em] dark:bg-white/10"
            >
              {segment.value}
            </code>
          );
        }

        return (
          <span key={index} className="whitespace-pre-wrap">
            {segment.value}
          </span>
        );
      })}
    </div>
  );
}


function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function QuizAttemptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quizId = params.id;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizToken, setQuizToken] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        cache: "no-store",
      });

      const data: DetailResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load this quiz.");
      }

      if (!data.quiz) {
        throw new Error("This quiz could not be found.");
      }

      let loadedQuestions: Question[] = data.questions ?? [];
      let loadedToken = "";

      if (!loadedQuestions.length) {
        const localQuiz = await getQuizLocally(Number(quizId));
        if (!localQuiz || !localQuiz.questions.length || !localQuiz.quizToken) {
          throw new Error(
            "This quiz is not saved on this browser. Please generate a new quiz on this device."
          );
        }
        loadedQuestions = localQuiz.questions;
        loadedToken = localQuiz.quizToken;
      } else {
        const localQuiz = await getQuizLocally(Number(quizId)).catch(() => null);
        loadedToken = localQuiz?.quizToken ?? "";
      }

      setQuiz(data.quiz);
      setQuestions(loadedQuestions);
      setQuizToken(loadedToken);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this quiz."
      );
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (loading || result || submitting || questions.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading, result, submitting, questions.length]);

  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[String(question.id)]).length,
    [answers, questions]
  );

  const progress =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  function selectAnswer(questionId: number, answer: string) {
    if (result || submitting) return;

    setAnswers((previous) => ({
      ...previous,
      [String(questionId)]: answer,
    }));
  }

  async function submitQuiz() {
    if (submitting || result || questions.length === 0) return;

    if (answeredCount !== questions.length) {
      setError(
        `Please answer all questions before submitting. You have ${
          questions.length - answeredCount
        } unanswered.`
      );
      setConfirmSubmit(false);
      return;
    }

    setSubmitting(true);
    setError("");
    setConfirmSubmit(false);

    try {
      const response = await fetch(
        `/api/quizzes/${quizId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers, quizToken }),
        }
      );

      const data: SubmitResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit your quiz.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your quiz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function restartAttempt() {
    setAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setResult(null);
    setError("");
    setConfirmSubmit(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        <div className="px-4 py-16">
        <div className="neo-surface mx-auto flex max-w-xl flex-col items-center rounded-3xl p-10 text-center">
          <LoaderCircle className="h-10 w-10 animate-spin text-[#ff4500]" />
          <h1 className="mt-5 text-xl font-bold">Loading your quiz</h1>
          <p className="mt-2 text-sm opacity-70">
            Preparing your questions...
          </p>
        </div>
        </div>
      </main>
    );
  }

  if (error && !quiz) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        <div className="px-4 py-12">
        <div className="neo-surface mx-auto max-w-xl rounded-3xl p-8 text-center">
          <CircleAlert className="mx-auto h-10 w-10 text-[#ff4500]" />
          <h1 className="mt-4 text-xl font-bold">Unable to open quiz</h1>
          <p className="mt-3 text-sm opacity-70">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => void loadQuiz()}
              className="neo-accent-button rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Try again
            </button>
            <Link
              href="/quizzes"
              className="neo-button rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Back to quizzes
            </Link>
          </div>
        </div>
        </div>
      </main>
    );
  }

  if (!quiz || !currentQuestion) return null;

  const completedResults = result?.results ?? [];
  const finalScore = result?.score ?? 0;
  const finalTotal = result?.totalQuestions ?? questions.length;
  const finalPercentage =
    result?.percentage ??
    (finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0);

  if (result) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        <div className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/quizzes"
            className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Quiz Center
          </Link>

          <section className="neo-surface mt-6 overflow-hidden rounded-3xl p-6 text-center sm:p-10">
            <div className="neo-surface mx-auto flex h-20 w-20 items-center justify-center rounded-3xl">
              {finalPercentage >= 70 ? (
                <Trophy className="h-10 w-10 text-[#ff4500]" />
              ) : (
                <BookOpen className="h-10 w-10 text-[#ff4500]" />
              )}
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-widest opacity-60">
              Quiz completed
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-4xl">
              {finalPercentage >= 90
                ? "Outstanding work!"
                : finalPercentage >= 70
                  ? "Great job!"
                  : finalPercentage >= 50
                    ? "Good effort!"
                    : "Keep practicing!"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 opacity-70">
              You have completed {quiz.title}. Review your answers and
              explanations below to strengthen your understanding.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="neo-inset rounded-2xl p-5">
                <p className="text-sm opacity-60">Your score</p>
                <p className="mt-2 text-3xl font-bold">
                  {finalScore}/{finalTotal}
                </p>
              </div>
              <div className="neo-inset rounded-2xl p-5">
                <p className="text-sm opacity-60">Percentage</p>
                <p className="mt-2 text-3xl font-bold text-[#ff4500]">
                  {finalPercentage}%
                </p>
              </div>
              <div className="neo-inset rounded-2xl p-5">
                <p className="text-sm opacity-60">Time taken</p>
                <p className="mt-2 text-3xl font-bold">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
            </div>

            <div className="mt-7 h-3 overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-[#ff4500] transition-all"
                style={{ width: `${finalPercentage}%` }}
              />
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={restartAttempt}
                className="neo-accent-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/quizzes/history"
                className="neo-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
              >
                View history
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">Answer review</h2>
              <p className="mt-1 text-sm opacity-65">
                Review each question, your answer, and the correct explanation.
              </p>
            </div>

            <div className="space-y-5">
              {completedResults.map((item, index) => (
                <article
                  key={item.questionId}
                  className="neo-surface rounded-2xl p-5 sm:p-7"
                >
                  <div className="flex items-start gap-3">
                    <div className="neo-inset flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.isCorrect ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                            <XCircle className="h-4 w-4" />
                            Incorrect
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-base font-semibold leading-7">
                        <FormattedContent value={item.question} />
                      </div>

                      <div className="mt-4 space-y-2">
                        {OPTION_KEYS.map((key) => {
                          const isCorrect = key === item.correctAnswer;
                          const isSelected = key === item.selectedAnswer;

                          let stateClass = "neo-inset";

                          if (isCorrect) {
                            stateClass =
                              "border border-emerald-500/40 bg-emerald-500/10";
                          } else if (isSelected && !item.isCorrect) {
                            stateClass =
                              "border border-red-500/40 bg-red-500/10";
                          }

                          return (
                            <div
                              key={key}
                              className={`flex items-start gap-3 rounded-xl p-3 ${stateClass}`}
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${OPTION_STYLES[key]}`}
                              >
                                {key}
                              </span>
                              <span className="min-w-0 flex-1 pt-1 text-sm leading-6">
                                <FormattedContent value={item.options[key]} />
                              </span>
                              {isCorrect && (
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {isSelected && !item.isCorrect && (
                                <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {item.explanation && (
                        <div className="neo-inset mt-4 rounded-xl p-4">
                          <p className="text-sm font-semibold">
                            Explanation
                          </p>
                          <div className="mt-2 text-sm leading-6 opacity-75">
                            <FormattedContent value={item.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <div className="px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/quizzes"
            className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit quiz
          </Link>

          <div className="neo-inset inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Clock3 className="h-4 w-4 text-[#ff4500]" />
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        <section className="neo-surface mt-6 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="neo-inset rounded-full px-3 py-1 text-xs font-semibold">
                  {quiz.subjectName}
                </span>
                <span className="neo-inset rounded-full px-3 py-1 text-xs font-semibold">
                  {quiz.difficulty}
                </span>
                {quiz.quizType === "AI" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ff4500]/10 px-3 py-1 text-xs font-semibold text-[#ff4500]">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI generated
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 opacity-70">
                  {quiz.description}
                </p>
              )}
            </div>

            <div className="neo-inset shrink-0 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs opacity-60">Question</p>
              <p className="mt-1 text-xl font-bold">
                {currentIndex + 1}
                <span className="text-sm font-medium opacity-50">
                  {" "}/ {questions.length}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 text-xs font-medium opacity-65">
            <span>Completion progress</span>
            <span>
              {answeredCount} of {questions.length} answered
            </span>
          </div>
          <div className="neo-inset mt-2 h-3 overflow-hidden rounded-full p-0.5">
            <div
              className="h-full rounded-full bg-[#ff4500] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          <section className="neo-surface min-w-0 rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="neo-inset flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
                {currentIndex + 1}
              </span>
              <p className="text-sm font-semibold opacity-60">
                Question {currentIndex + 1}
              </p>
            </div>

            <div className="mt-5 text-lg font-semibold leading-8 sm:text-xl">
              <FormattedContent value={currentQuestion.question} />
            </div>

            <div className="mt-6 space-y-3">
              {OPTION_KEYS.map((key) => {
                const selected =
                  answers[String(currentQuestion.id)] === key;

                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      selectAnswer(currentQuestion.id, key)
                    }
                    disabled={submitting}
                    className={`group flex w-full items-start gap-3 rounded-2xl p-4 text-left transition duration-200 disabled:cursor-not-allowed ${
                      selected
                        ? "neo-inset ring-2 ring-[#ff4500]/60"
                        : "neo-button"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition ${
                        selected
                          ? "bg-[#ff4500] text-white"
                          : OPTION_STYLES[key]
                      }`}
                    >
                      {key}
                    </span>
                    <span className="min-w-0 flex-1 pt-1.5 text-sm leading-6">
                      <FormattedContent value={optionText(currentQuestion, key)} />
                    </span>
                    {selected && (
                      <CheckCircle2 className="mt-2 h-5 w-5 shrink-0 text-[#ff4500]" />
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-5 dark:border-white/5">
              <button
                type="button"
                disabled={currentIndex === 0 || submitting}
                onClick={() => {
                  setCurrentIndex((index) => index - 1);
                  setError("");
                }}
                className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setCurrentIndex((index) => index + 1);
                    setError("");
                  }}
                  className="neo-accent-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  Next question
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setError("");
                    setConfirmSubmit(true);
                  }}
                  className="neo-accent-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  Submit quiz
                </button>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="neo-surface rounded-2xl p-5">
              <h2 className="font-bold">Question navigator</h2>
              <p className="mt-1 text-xs leading-5 opacity-60">
                Select a question to move directly to it.
              </p>

              <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
                {questions.map((question, index) => {
                  const answered = Boolean(answers[String(question.id)]);
                  const active = index === currentIndex;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      aria-label={`Go to question ${index + 1}${
                        answered ? ", answered" : ", unanswered"
                      }`}
                      aria-current={active ? "step" : undefined}
                      onClick={() => {
                        setCurrentIndex(index);
                        setError("");
                      }}
                      className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                        active
                          ? "bg-[#ff4500] text-white"
                          : answered
                            ? "neo-inset text-[#ff4500]"
                            : "neo-button"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 text-xs opacity-70">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#ff4500]" />
                  Current question
                </div>
                <div className="flex items-center gap-2">
                  <span className="neo-inset h-3 w-3 rounded" />
                  Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="neo-button h-3 w-3 rounded" />
                  Not answered
                </div>
              </div>
            </section>

            <section className="neo-surface rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#ff4500]" />
                <h2 className="font-bold">Your progress</h2>
              </div>
              <p className="mt-3 text-3xl font-bold">
                {answeredCount}
                <span className="text-base font-medium opacity-50">
                  {" "}/ {questions.length}
                </span>
              </p>
              <p className="mt-1 text-xs opacity-60">
                Questions answered
              </p>
              <div className="neo-inset mt-4 h-2.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-[#ff4500] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setError("");
                  setConfirmSubmit(true);
                }}
                className="neo-accent-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
              >
                Submit quiz
                <Send className="h-4 w-4" />
              </button>
            </section>
          </aside>
        </div>
      </div>

      {confirmSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setConfirmSubmit(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
            className="neo-surface w-full max-w-md rounded-3xl p-6 sm:p-8"
          >
            <div className="neo-inset mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
              <Send className="h-6 w-6 text-[#ff4500]" />
            </div>

            <h2
              id="submit-dialog-title"
              className="mt-5 text-center text-xl font-bold"
            >
              Submit your quiz?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 opacity-70">
              You have answered {answeredCount} out of {questions.length}{" "}
              questions.
              {answeredCount < questions.length
                ? ` There are ${
                    questions.length - answeredCount
                  } unanswered questions. You must answer all questions before submitting.`
                : " Your answers will be scored and your results will be displayed."}
            </p>

            {error && (
              <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmSubmit(false)}
                className="neo-button flex-1 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Continue quiz
              </button>

              <button
                type="button"
                disabled={submitting || answeredCount !== questions.length}
                onClick={() => void submitQuiz()}
                className="neo-accent-button flex-1 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Confirm submit"
                )}
              </button>
            </div>
          </section>
        </div>
      )}
      </div>
    </main>
  );
}
