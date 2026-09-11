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
        className={`text-sm leading-7 text-[#3f3e3e] ${
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
          transition-all
          duration-200
          hover:text-red-600
        "
        style={{
          boxShadow:
            "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
        }}
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