"use client";

import { useEffect, useRef } from "react";
import YouTubePlayer from "@/components/youtube-player";

type LessonVideoProps = {
  lessonId: number;
  videoUrl: string;
  startSeconds?: number;

  onWatchProgress?: (
    watchedSeconds: number,
    durationSeconds: number
  ) => void;
};

/*
 * =========================================================
 * PROGRESS SAVE SETTINGS
 * =========================================================
 *
 * The player can still report progress every second so the
 * UI feels live.
 *
 * But we only save progress to the database every 20 seconds.
 *
 * This dramatically reduces Neon database/network usage.
 */
const SAVE_INTERVAL_MS = 20_000;

export default function LessonVideo({
  lessonId,
  videoUrl,
  startSeconds = 0,
  onWatchProgress,
}: LessonVideoProps) {
  /*
   * =========================================================
   * REFS
   * =========================================================
   */

  const latestProgressRef = useRef({
    watchedSeconds: Math.max(
      0,
      Math.floor(startSeconds || 0)
    ),

    durationSeconds: 0,

    watchPercentage: 0,
  });

  const lastSavedAtRef = useRef(0);

  const saveInProgressRef = useRef(false);

  const mountedRef = useRef(true);

  /*
   * =========================================================
   * COMPONENT MOUNT / UNMOUNT
   * =========================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      /*
       * Save the latest known progress when the user leaves
       * the lesson/page.
       *
       * keepalive allows the browser to continue the request
       * even while the page is being unloaded.
       */
      const latest =
        latestProgressRef.current;

      if (
        latest.durationSeconds > 0 &&
        latest.watchedSeconds >= 0
      ) {
        void saveProgress(
          latest.watchedSeconds,
          latest.durationSeconds,
          latest.watchPercentage,
          false,
          true
        );
      }
    };
  }, []);

  /*
   * =========================================================
   * SAVE PROGRESS TO DATABASE
   * =========================================================
   */

  async function saveProgress(
    watchedSeconds: number,
    durationSeconds: number,
    watchPercentage: number,
    completed = false,
    keepalive = false
  ) {
    /*
     * Prevent multiple database requests from running at
     * the same time.
     */
    if (saveInProgressRef.current) {
      return;
    }

    if (
      !Number.isFinite(watchedSeconds) ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0
    ) {
      return;
    }

    saveInProgressRef.current = true;

    try {
      const response = await fetch(
        "/api/progress",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            lessonId,

            watchedSeconds:
              Math.max(
                0,
                Math.floor(
                  watchedSeconds
                )
              ),

            watchPercentage:
              Math.min(
                100,
                Math.max(
                  0,
                  Math.floor(
                    watchPercentage
                  )
                )
              ),

            completed,
          }),

          /*
           * keepalive is useful when the user leaves
           * the lesson/page.
           */
          keepalive,
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to save video progress:",
          response.status
        );

        return;
      }

      lastSavedAtRef.current =
        Date.now();
    } catch (error) {
      /*
       * Ignore errors caused by page navigation/unload.
       */
      if (mountedRef.current) {
        console.error(
          "Failed to save video progress:",
          error
        );
      }
    } finally {
      saveInProgressRef.current =
        false;
    }
  }

  /*
   * =========================================================
   * HANDLE LIVE PROGRESS
   * =========================================================
   */

  function handleProgress(
    currentTime: number,
    duration: number
  ) {
    if (
      !Number.isFinite(currentTime) ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    const watchedSeconds =
      Math.max(
        0,
        Math.floor(currentTime)
      );

    const watchPercentage =
      Math.min(
        100,
        Math.max(
          0,
          Math.floor(
            (currentTime / duration) *
              100
          )
        )
      );

    /*
     * Always keep the latest progress locally.
     */
    latestProgressRef.current = {
      watchedSeconds,

      durationSeconds: duration,

      watchPercentage,
    };

    /*
     * =====================================================
     * UPDATE UI IMMEDIATELY
     * =====================================================
     */

    onWatchProgress?.(
      watchedSeconds,
      duration
    );

    /*
     * =====================================================
     * DATABASE SAVE
     * =====================================================
     *
     * Only save every 20 seconds.
     */

    const now = Date.now();

    const shouldSave =
      lastSavedAtRef.current === 0 ||
      now -
        lastSavedAtRef.current >=
        SAVE_INTERVAL_MS;

    if (shouldSave) {
      void saveProgress(
        watchedSeconds,
        duration,
        watchPercentage
      );
    }
  }

  /*
   * =========================================================
   * HANDLE COMPLETION
   * =========================================================
   */

  async function handleComplete() {
    const latest =
      latestProgressRef.current;

    /*
     * Completion is saved immediately.
     *
     * This is NOT throttled.
     */
    await saveProgress(
      latest.watchedSeconds,
      latest.durationSeconds,
      Math.max(
        90,
        latest.watchPercentage
      ),
      true
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

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