"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubePlayerProps = {
  videoId: string;
  startSeconds?: number;
  lessonId: number;

  onProgress?: (
    currentTime: number,
    duration: number
  ) => void;

  onComplete?: () => void;
};

export default function YouTubePlayer({
  videoId,
  startSeconds = 0,
  lessonId,
  onProgress,
  onComplete,
}: YouTubePlayerProps) {
  // =========================================================
  // REFS
  // =========================================================

  const playerRef = useRef<any>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const completedRef =
    useRef(false);

  const onProgressRef =
    useRef(onProgress);

  const onCompleteRef =
    useRef(onComplete);

  // =========================================================
  // KEEP CALLBACKS UPDATED
  // =========================================================

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // =========================================================
  // RESET WHEN LESSON CHANGES
  // =========================================================

  useEffect(() => {
    completedRef.current = false;
  }, [videoId, lessonId]);

  // =========================================================
  // STOP PROGRESS TIMER
  // =========================================================

  function stopProgressTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // =========================================================
  // CHECK + SEND PROGRESS
  // =========================================================

  function checkProgress() {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    try {
      const currentTime = Number(
        player.getCurrentTime()
      );

      const duration = Number(
        player.getDuration()
      );

      if (
        !Number.isFinite(currentTime) ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        return;
      }

      const safeCurrentTime = Math.max(
        0,
        Math.min(currentTime, duration)
      );

      const percentage = Math.min(
        100,
        Math.max(
          0,
          Math.floor(
            (safeCurrentTime / duration) *
              100
          )
        )
      );

      // =====================================================
      // SEND LIVE PROGRESS TO PARENT
      // =====================================================

      onProgressRef.current?.(
        safeCurrentTime,
        duration
      );

      // =====================================================
      // COMPLETE AT 90%
      // =====================================================

      if (
        percentage >= 90 &&
        !completedRef.current
      ) {
        completedRef.current = true;

        onCompleteRef.current?.();
      }
    } catch (error) {
      console.error(
        "Failed to read YouTube progress:",
        error
      );
    }
  }

  // =========================================================
  // START TIMER
  // =========================================================

  function startProgressTimer() {
    stopProgressTimer();

    /*
     * Update every 1 second instead of every 5 seconds.
     *
     * This makes the UI feel live.
     */
    intervalRef.current =
      setInterval(() => {
        checkProgress();
      }, 1000);
  }

  // =========================================================
  // CREATE YOUTUBE PLAYER
  // =========================================================

  useEffect(() => {
    let mounted = true;

    function createPlayer() {
      if (
        !mounted ||
        !window.YT?.Player
      ) {
        return;
      }

      // Prevent duplicate player
      if (playerRef.current) {
        return;
      }

      const playerElement =
        document.getElementById(
          "youtube-player"
        );

      if (!playerElement) {
        return;
      }

      playerRef.current =
        new window.YT.Player(
          "youtube-player",
          {
            videoId,

            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              start: Math.max(
                0,
                Math.floor(startSeconds)
              ),
            },

            events: {
              // =================================================
              // READY
              // =================================================

              onReady: (event: any) => {
                if (
                  startSeconds > 0
                ) {
                  event.target.seekTo(
                    Math.floor(
                      startSeconds
                    ),
                    true
                  );
                }

                /*
                 * Immediately report the initial
                 * position to the parent.
                 */
                setTimeout(() => {
                  checkProgress();
                }, 500);
              },

              // =================================================
              // STATE CHANGE
              // =================================================

              onStateChange: (
                event: any
              ) => {
                const YTState =
                  window.YT.PlayerState;

                // =========================
                // PLAYING
                // =========================

                if (
                  event.data ===
                  YTState.PLAYING
                ) {
                  startProgressTimer();
                }

                // =========================
                // PAUSED
                // =========================

                if (
                  event.data ===
                  YTState.PAUSED
                ) {
                  stopProgressTimer();

                  // Save immediately
                  checkProgress();
                }

                // =========================
                // BUFFERING
                // =========================

                if (
                  event.data ===
                  YTState.BUFFERING
                ) {
                  stopProgressTimer();
                }

                // =========================
                // ENDED
                // =========================

                if (
                  event.data ===
                  YTState.ENDED
                ) {
                  stopProgressTimer();

                  // Save final position
                  checkProgress();

                  if (
                    !completedRef.current
                  ) {
                    completedRef.current =
                      true;

                    onCompleteRef.current?.();
                  }
                }
              },
            },
          }
        );
    }

    // =======================================================
    // API ALREADY LOADED
    // =======================================================

    if (window.YT?.Player) {
      createPlayer();
    }

    // =======================================================
    // LOAD YOUTUBE API
    // =======================================================

    else {
      const existingScript =
        document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        );

      if (!existingScript) {
        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.body.appendChild(
          script
        );
      }

      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady =
        () => {
          previousCallback?.();

          if (mounted) {
            createPlayer();
          }
        };
    }

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      mounted = false;

      stopProgressTimer();

      if (
        playerRef.current?.destroy
      ) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error(
            "Failed to destroy YouTube player:",
            error
          );
        }
      }

      playerRef.current = null;
    };
  }, [
    videoId,
    startSeconds,
    lessonId,
  ]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        aspect-video
        w-full
        rounded-[20px]
        bg-[#e0e5ec]
        p-2
        dark:bg-[#1e2229]
      "
      style={{
        boxShadow:
          "9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.8)",
      }}
    >
      <div
        className="
          h-full
          w-full
          overflow-hidden
          rounded-[12px]
          bg-black
        "
        style={{
          boxShadow:
            "inset 3px 3px 6px rgba(0, 0, 0, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          id="youtube-player"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}