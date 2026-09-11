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
        "
        style={{
          boxShadow:
            "inset 6px 6px 10px rgba(163, 177, 198, 0.7), inset -6px -6px 10px rgba(255, 255, 255, 0.9)",
        }}
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
                        ? "bg-[#e0e5ec] text-[#ff4500]"
                        : "bg-transparent text-[#3f3e3e] hover:text-[#ff4500]"
                    }
                  `}
                  style={
                    active
                      ? {
                          boxShadow:
                            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
                        }
                      : undefined
                  }
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
                sm:p-7
              "
              style={{
                boxShadow:
                  "9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.8)",
              }}
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
                  "
                  style={{
                    boxShadow:
                      "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <Trophy
                    size={19}
                  />
                </div>

                <div className="min-w-0">

                  <h2 className="text-base font-bold text-black">
                    Test yourself
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#3f3e3e]">
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
                      transition-all
                      duration-200
                      hover:bg-red-600
                    "
                    style={{
                      boxShadow:
                        "5px 5px 12px rgba(79, 70, 229, 0.35), -5px -5px 12px rgba(255, 255, 255, 0.8)",
                    }}
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
            <div
              className="
                rounded-[20px]
                bg-[#e0e5ec]
                p-6
                sm:p-7
              "
              style={{
                boxShadow:
                  "9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.8)",
              }}
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
                  "
                  style={{
                    boxShadow:
                      "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <MessageCircle
                    size={19}
                  />
                </div>

                <div className="min-w-0">

                  <h2 className="text-base font-bold text-black">
                    AI Tutor
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#3f3e3e]">
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
                      transition-all
                      duration-200
                      hover:bg-red-600
                    "
                    style={{
                      boxShadow:
                        "5px 5px 12px rgba(79, 70, 229, 0.35), -5px -5px 12px rgba(255, 255, 255, 0.8)",
                    }}
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