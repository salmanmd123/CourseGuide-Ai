"use client";

import LessonVideo from "@/components/lesson-video";
import { useState } from "react";

type LearningClientProps = {
  lessonId: number;
  videoUrl: string;
  startSeconds: number;

  totalCourseSeconds: number;
  initialTotalWatchedSeconds: number;
  currentLessonInitialSeconds: number;
};

export default function LearningClient({
  lessonId,
  videoUrl,
  startSeconds,
  totalCourseSeconds,
  initialTotalWatchedSeconds,
  currentLessonInitialSeconds,
}: LearningClientProps) {
  const [currentLessonWatchedSeconds, setCurrentLessonWatchedSeconds] =
    useState(currentLessonInitialSeconds);

  function updateLiveProgress(
    watchedSeconds: number
  ) {
    setCurrentLessonWatchedSeconds(
      watchedSeconds
    );

    /*
     * Replace the current lesson's old saved
     * position with the new live position.
     */
    const totalWatched =
      initialTotalWatchedSeconds -
      currentLessonInitialSeconds +
      watchedSeconds;

    let percentage = 0;

    if (totalCourseSeconds > 0) {
      percentage = Math.round(
        (totalWatched / totalCourseSeconds) * 100
      );
    }

    percentage = Math.min(
      100,
      Math.max(0, percentage)
    );

    /*
     * =====================================================
     * UPDATE HEADER PROGRESS
     * =====================================================
     */

    const headerBar =
      document.getElementById(
        "course-progress-bar"
      );

    const headerText =
      document.getElementById(
        "course-progress-text"
      );

    if (headerBar) {
      headerBar.style.width =
        `${percentage}%`;
    }

    if (headerText) {
      headerText.textContent =
        `${percentage}%`;
    }

    /*
     * =====================================================
     * UPDATE SIDEBAR PROGRESS
     * =====================================================
     */

    const sidebarBar =
      document.getElementById(
        "sidebar-course-progress-bar"
      );

    const sidebarText =
      document.getElementById(
        "sidebar-course-progress-text"
      );

    if (sidebarBar) {
      sidebarBar.style.width =
        `${percentage}%`;
    }

    if (sidebarText) {
      sidebarText.textContent =
        `${percentage}%`;
    }
  }

  return (
    <LessonVideo
      lessonId={lessonId}
      videoUrl={videoUrl}
      startSeconds={startSeconds}
      onWatchProgress={(watchedSeconds) => {
        updateLiveProgress(
          watchedSeconds
        );
      }}
    />
  );
}