"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type LessonDescriptionProps = {
  description?: string | null;
  fallback?: string;
};

export default function LessonDescription({
  description,
  fallback,
}: LessonDescriptionProps) {
  const [expanded, setExpanded] =
    useState(false);

  const text =
    description?.trim() ||
    fallback ||
    "";

  if (!text) {
    return null;
  }

  return (
    <div className="mt-3">
      <div
        className={`text-sm leading-7 text-[#3f3e3e] dark:text-[#a8adb7] ${
          expanded
            ? ""
            : "line-clamp-4"
        }`}
      >
        {text}
      </div>

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (value) => !value
          )
        }
        className="
          mt-2
          inline-flex
          items-center
          gap-1
          rounded-[12px]
          bg-[#e0e5ec]
          px-3
          py-1.5
          text-xs
          font-semibold
          text-[#ff4500]
          shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]
          transition-all
          duration-200
          hover:text-red-600
          hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]

          dark:bg-[#1e2229]
          dark:text-[orangered]
          dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]
          dark:hover:text-[red]
          dark:hover:bg-[#1e2229]
          dark:hover:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.6),inset_-3px_-3px_6px_rgba(43,48,58,0.6)]
        "
      >
        {expanded ? (
          <>
            See less
            <ChevronUp
              size={14}
            />
          </>
        ) : (
          <>
            See more
            <ChevronDown
              size={14}
            />
          </>
        )}
      </button>
    </div>
  );
}