"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

type MarkCompleteButtonProps = {
  lessonId: number;
  completed: boolean;
};

export default function MarkCompleteButton({
  lessonId,
  completed,
}: MarkCompleteButtonProps) {
  const router = useRouter();

  const [isCompleted, setIsCompleted] = useState(completed);
  const [loading, setLoading] = useState(false);

  // IMPORTANT:
  // Reset button state when navigating to another lesson
  useEffect(() => {
    setIsCompleted(completed);
  }, [completed, lessonId]);

  async function handleComplete() {
    if (isCompleted || loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark lesson complete");
      }

      setIsCompleted(true);

      // Refresh server data
      router.refresh();

    } catch (error) {
      console.error("Mark complete error:", error);
      alert("Could not mark lesson as complete.");
    } finally {
      setLoading(false);
    }
  }

  if (isCompleted) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        <CheckCircle2 size={16} />
        Completed
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <CheckCircle2 size={16} />
          Mark complete
        </>
      )}
    </button>
  );
}