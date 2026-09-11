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

      <nav
        className="
          rounded-[20px]
          bg-[#e0e5ec]
          p-2
          shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]
          dark:bg-[#1e2229]
          dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]
        "
      >
        <div className="flex gap-2 overflow-x-auto">

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
                  className={`
                    relative
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-[12px]
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-[#e0e5ec]
                          text-[#ff4500]
                          shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]

                          dark:bg-[#1e2229]
                          dark:text-[orangered]
                          dark:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]
                        `
                        : `
                          bg-transparent
                          text-[#3f3e3e]
                          hover:text-[#ff4500]

                          dark:text-[#a8adb7]
                          dark:hover:text-[orangered]
                        `
                    }
                  `}
                >
                  <Icon size={15} />

                  <span>
                    {label}
                  </span>
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
            <div
              className="
                rounded-[20px]
                bg-[#e0e5ec]
                p-6
                shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                sm:p-7

                dark:bg-[#1e2229]
                dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]
              "
            >
              <div className="flex items-start gap-4">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-[12px]
                    bg-[#e0e5ec]
                    text-[#ff4500]
                    shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]

                    dark:bg-[#1e2229]
                    dark:text-[orangered]
                    dark:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]
                  "
                >
                  <Trophy size={19} />
                </div>

                <div className="min-w-0">

                  <h2 className="text-base font-bold text-black dark:text-[#f5f7fa]">
                    Test yourself
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                    Take a short quiz to
                    check your
                    understanding of
                    this lesson.
                  </p>

                  <button
                    type="button"
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-[12px]
                      bg-[#ff4500]
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-white

                      shadow-[5px_5px_12px_rgba(163,177,198,0.5),-5px_-5px_12px_rgba(255,255,255,0.8)]

                      transition-all
                      duration-200

                      hover:bg-red-600

                      dark:bg-[orangered]
                      dark:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]
                      dark:hover:bg-[red]
                      dark:hover:shadow-[inset_2px_2px_5px_rgba(120,20,0,0.35),inset_-2px_-2px_5px_rgba(255,120,80,0.16)]
                    "
                  >
                    Start quiz

                    <ArrowRight size={14} />
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
            <div
              className="
                rounded-[20px]
                bg-[#e0e5ec]
                p-6
                shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
                sm:p-7

                dark:bg-[#1e2229]
                dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]
              "
            >
              <div className="flex items-start gap-4">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-[12px]
                    bg-[#e0e5ec]
                    text-[#ff4500]
                    shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]

                    dark:bg-[#1e2229]
                    dark:text-[orangered]
                    dark:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]
                  "
                >
                  <MessageCircle size={19} />
                </div>

                <div className="min-w-0">

                  <h2 className="text-base font-bold text-black dark:text-[#f5f7fa]">
                    AI Tutor
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">
                    Ask questions and
                    get help
                    understanding this
                    lesson with
                    CourseGuide AI.
                  </p>

                  <button
                    type="button"
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-[12px]
                      bg-[#ff4500]
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-white

                      shadow-[5px_5px_12px_rgba(163,177,198,0.5),-5px_-5px_12px_rgba(255,255,255,0.8)]

                      transition-all
                      duration-200

                      hover:bg-red-600

                      dark:bg-[orangered]
                      dark:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]
                      dark:hover:bg-[red]
                      dark:hover:shadow-[inset_2px_2px_5px_rgba(120,20,0,0.35),inset_-2px_-2px_5px_rgba(255,120,80,0.16)]
                    "
                  >
                    Ask AI Tutor

                    <ArrowRight size={14} />
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