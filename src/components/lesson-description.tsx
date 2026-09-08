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
        className={`text-sm leading-7 text-zinc-500 dark:text-zinc-400 ${
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
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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