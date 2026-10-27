"use client";

import { useState } from "react";
import { ArrowRight, FileText, MessageCircle, StickyNote, Trophy } from "lucide-react";
import AiNotes from "@/components/ai-notes";
import AiTutor from "@/components/ai-tutor";
import MyNotes from "@/components/my-notes";

type LessonContentTabsProps = {
  courseId: number;
  lessonId: number;
  courseTitle: string;
  lessonTitle: string;
};
type Tab = "ai-notes" | "my-notes" | "ai-tutor";
const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "ai-notes", label: "AI Notes", icon: FileText },
  { id: "my-notes", label: "My Notes", icon: StickyNote },
  { id: "ai-tutor", label: "AI Tutor", icon: MessageCircle },
];

export default function LessonContentTabs({ courseId, lessonId, courseTitle, lessonTitle }: LessonContentTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("ai-notes");
  return <div className="mt-5 min-w-0 sm:mt-8">
    <nav className="border-b border-[#cbd2dc] dark:border-[#343a45]">
      <div className="flex max-w-full gap-1 overflow-x-auto overscroll-x-contain sm:gap-2">{tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return <button key={id} type="button" onClick={() => setActiveTab(id)} aria-pressed={active} className={`relative flex shrink-0 items-center gap-2 rounded-none px-3 py-3 text-[11px] font-semibold sm:px-4 sm:text-xs transition-colors duration-200 ${active ? "border-b-2 border-[#ff4500] text-[#ff4500] dark:text-[orangered]" : "border-b-2 border-transparent text-[#3f3e3e] hover:text-[#ff4500] dark:text-[#a8adb7] dark:hover:text-[orangered]"}`}><Icon size={15} /><span>{label}</span></button>;
      })}</div>
    </nav>
    <div className="mt-5 min-w-0 sm:mt-8">
      {activeTab === "ai-notes" && <section><AiNotes lessonId={lessonId} /></section>}
      {activeTab === "my-notes" && <section><MyNotes courseId={courseId} lessonId={lessonId} courseTitle={courseTitle} lessonTitle={lessonTitle} /></section>}
      {activeTab === "ai-tutor" && <section className="min-w-0 sm:mx-0"><AiTutor lessonId={lessonId} courseTitle={courseTitle} lessonTitle={lessonTitle} /></section>}
    </div>
  </div>;
}
