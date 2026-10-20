"use client";

import LessonVideo from "@/components/lesson-video";

type WatchInterval = [number, number];

type LearningClientProps = {
  lessonId: number;
  videoUrl: string;
  startSeconds: number;
  totalCourseSeconds: number;
  initialTotalWatchedSeconds: number;
  currentLessonInitialSeconds: number;
  initialWatchedIntervals: WatchInterval[];
};

export default function LearningClient({
  lessonId,
  videoUrl,
  startSeconds,
  totalCourseSeconds,
  initialTotalWatchedSeconds,
  currentLessonInitialSeconds,
  initialWatchedIntervals,
}: LearningClientProps) {
  function updateLiveProgress(watchedSeconds: number) {
    // Replace this lesson's previously counted watched time with its updated total.
    const totalWatched = Math.max(
      0,
      initialTotalWatchedSeconds - currentLessonInitialSeconds + watchedSeconds
    );

    const percentage = totalCourseSeconds > 0
      ? Math.min(100, Math.max(0, Math.round((totalWatched / totalCourseSeconds) * 100)))
      : 0;

    const elements = [
      { bar: "course-progress-bar", text: "course-progress-text" },
      { bar: "sidebar-course-progress-bar", text: "sidebar-course-progress-text" },
    ];

    for (const element of elements) {
      const bar = document.getElementById(element.bar);
      const text = document.getElementById(element.text);

      if (bar) bar.style.width = `${percentage}%`;
      if (text) text.textContent = `${percentage}%`;
    }
  }

  return (
    <LessonVideo
      lessonId={lessonId}
      videoUrl={videoUrl}
      startSeconds={startSeconds}
      initialWatchedIntervals={initialWatchedIntervals}
      onWatchProgress={(watchedSeconds) => updateLiveProgress(watchedSeconds)}
    />
  );
}
