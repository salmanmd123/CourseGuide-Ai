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
  // =========================
  // REFS
  // =========================

  const playerRef = useRef<any>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const completedRef = useRef(false);

  // Keep latest callbacks without recreating
  // the YouTube player
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);

  // =========================
  // KEEP CALLBACKS UPDATED
  // =========================

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // =========================
  // RESET COMPLETION
  // WHEN LESSON CHANGES
  // =========================

  useEffect(() => {
    completedRef.current = false;
  }, [videoId, lessonId]);

  // =========================
  // STOP PROGRESS TIMER
  // =========================

  function stopProgressTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // =========================
  // CHECK & SAVE PROGRESS
  // =========================

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

      const percentage = Math.min(
        100,
        Math.max(
          0,
          Math.floor(
            (currentTime / duration) * 100
          )
        )
      );

      // =========================
      // SAVE LATEST POSITION
      // =========================

      onProgressRef.current?.(
        currentTime,
        duration
      );

      // =========================
      // AUTOMATIC COMPLETION
      // AT 90%
      // =========================

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

  // =========================
  // START PROGRESS TIMER
  // =========================

  function startProgressTimer() {
    stopProgressTimer();

    // Save every 5 seconds
    intervalRef.current =
      setInterval(() => {
        checkProgress();
      }, 5000);
  }

  // =========================
  // CREATE YOUTUBE PLAYER
  // =========================

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
              // =========================
              // PLAYER READY
              // =========================

              onReady: (event: any) => {
                if (
                  startSeconds > 0
                ) {
                  event.target.seekTo(
                    Math.floor(startSeconds),
                    true
                  );
                }
              },

              // =========================
              // PLAYER STATE CHANGE
              // =========================

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
                  // Keep timer stopped while
                  // video is buffering.
                  stopProgressTimer();
                }

                // =========================
                // VIDEO ENDED
                // =========================

                if (
                  event.data ===
                  YTState.ENDED
                ) {
                  stopProgressTimer();

                  // Save final position
                  checkProgress();

                  // Ensure lesson is completed
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

    // =========================
    // YOUTUBE API ALREADY LOADED
    // =========================

    if (window.YT?.Player) {
      createPlayer();
    }

    // =========================
    // LOAD YOUTUBE API
    // =========================

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

    // =========================
    // CLEANUP
    // =========================

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

  // =========================
  // UI
  // =========================

  return (
    <div className="aspect-video w-full bg-black">
      <div
        id="youtube-player"
        className="h-full w-full"
      />
    </div>
  );
}