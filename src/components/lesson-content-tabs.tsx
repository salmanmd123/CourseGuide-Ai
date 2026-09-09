"use client";

import { useState } from "react";

import {
  ArrowRight,
  FileText,
  MessageCircle,
  StickyNote,
  Trophy,
} from "lucide-react";

import AiNotes from "@/components/ai-notes";
import MyNotes from "@/components/my-notes";

type LessonContentTabsProps = {
  courseId: number;
  lessonId: number;
  courseTitle: string;
  lessonTitle: string;
};

type Tab =
  | "ai-notes"
  | "my-notes"
  | "quiz"
  | "ai-tutor";

const tabs: {
  id: Tab;
  label: string;
  icon: typeof FileText;
}[] = [
  {
    id: "ai-notes",
    label: "AI Notes",
    icon: FileText,
  },
  {
    id: "my-notes",
    label: "My Notes",
    icon: StickyNote,
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: Trophy,
  },
  {
    id: "ai-tutor",
    label: "AI Tutor",
    icon: MessageCircle,
  },
];

export default function LessonContentTabs({
  courseId,
  lessonId,
  courseTitle,
  lessonTitle,
}: LessonContentTabsProps) {
  const [activeTab, setActiveTab] =
    useState<Tab>("ai-notes");

  return (
    <div className="mt-8">

      {/* =====================================================
          TAB NAVIGATION
      ===================================================== */}

      <nav className="border-b border-zinc-200 dark:border-zinc-800">

        <div className="flex gap-1 overflow-x-auto">

          {tabs.map(
            ({
              id,
              label,
              icon: Icon,
            }) => {
              const active =
                activeTab === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setActiveTab(id)
                  }
                  className={`relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-xs font-medium transition ${
                    active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                  }`}
                >

                  <Icon size={15} />

                  <span>
                    {label}
                  </span>

                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}

                </button>
              );
            }
          )}

        </div>

      </nav>

      {/* =====================================================
          SELECTED CONTENT
      ===================================================== */}

      <div className="mt-8">

        {/* ===================================================
            AI NOTES
        =================================================== */}

        {activeTab === "ai-notes" && (
          <section>
            <AiNotes
              lessonId={lessonId}
            />
          </section>
        )}

        {/* ===================================================
            MY NOTES
        =================================================== */}

        {activeTab === "my-notes" && (
          <section>
            <MyNotes
              courseId={courseId}
              lessonId={lessonId}
              courseTitle={courseTitle}
              lessonTitle={lessonTitle}
            />
          </section>
        )}

        {/* ===================================================
            QUIZ
        =================================================== */}

        {activeTab === "quiz" && (
          <section>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">

                  <Trophy
                    size={19}
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                    Test yourself
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    Take a short quiz to
                    check your
                    understanding of
                    this lesson.
                  </p>

                  <button
                    type="button"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Start quiz

                    <ArrowRight
                      size={14}
                    />

                  </button>

                </div>

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            AI TUTOR
        =================================================== */}

        {activeTab === "ai-tutor" && (
          <section>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">

                  <MessageCircle
                    size={19}
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                    AI Tutor
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    Ask questions and
                    get help
                    understanding this
                    lesson with
                    CourseGuide AI.
                  </p>

                  <button
                    type="button"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Ask AI Tutor

                    <ArrowRight
                      size={14}
                    />

                  </button>

                </div>

              </div>

            </div>

          </section>
        )}

      </div>

    </div>
  );
}