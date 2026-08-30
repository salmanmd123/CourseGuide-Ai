"use client";

import YouTubePlayer from "@/components/youtube-player";

type LessonVideoProps = {
  lessonId: number;
  videoUrl: string;
  startSeconds?: number;
};

export default function LessonVideo({
  lessonId,
  videoUrl,
  startSeconds = 0,
}: LessonVideoProps) {
  async function handleProgress(
    currentTime: number,
    duration: number
  ) {
    try {
      if (!duration || duration <= 0) {
        return;
      }

      const watchPercentage = Math.min(
        100,
        Math.floor((currentTime / duration) * 100)
      );

      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          watchedSeconds: Math.floor(currentTime),
          watchPercentage,
        }),
      });
    } catch (error) {
      console.error(
        "Failed to save video progress:",
        error
      );
    }
  }

  async function handleComplete() {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          watchPercentage: 90,
          completed: true,
        }),
      });
    } catch (error) {
      console.error(
        "Failed to complete lesson:",
        error
      );
    }
  }

  return (
    <YouTubePlayer
      lessonId={lessonId}
      videoId={videoUrl}
      startSeconds={startSeconds}
      onProgress={handleProgress}
      onComplete={handleComplete}
    />
  );
}