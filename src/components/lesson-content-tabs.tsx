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
  return <div className="mt-8">
    <nav className="rounded-[20px] bg-[#e0e5ec] p-2 shadow-[inset_6px_6px_10px_rgba(163,177,198,0.7),inset_-6px_-6px_10px_rgba(255,255,255,0.9)] dark:bg-[#1e2229] dark:shadow-[inset_6px_6px_10px_rgba(5,7,10,0.75),inset_-6px_-6px_10px_rgba(43,48,58,0.75)]">
      <div className="flex gap-2 p-2 overflow-x-auto">{tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return <button key={id} type="button" onClick={() => setActiveTab(id)} aria-pressed={active} className={`relative flex shrink-0 items-center gap-2 rounded-[12px] px-4 py-3 text-xs font-semibold transition-all duration-200 ${active ? "bg-[#e0e5ec] text-[#ff4500] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[orangered] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.55),-5px_-5px_10px_rgba(43,48,58,0.55)]" : "bg-transparent text-[#3f3e3e] hover:text-[#ff4500] dark:text-[#a8adb7] dark:hover:text-[orangered]"}`}><Icon size={15} /><span>{label}</span></button>;
      })}</div>
    </nav>
    <div className="mt-8">
      {activeTab === "ai-notes" && <section><AiNotes lessonId={lessonId} /></section>}
      {activeTab === "my-notes" && <section><MyNotes courseId={courseId} lessonId={lessonId} courseTitle={courseTitle} lessonTitle={lessonTitle} /></section>}
      {activeTab === "ai-tutor" && <section><AiTutor lessonId={lessonId} courseTitle={courseTitle} lessonTitle={lessonTitle} /></section>}
    </div>
  </div>;
}
