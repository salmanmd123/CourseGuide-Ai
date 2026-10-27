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
  // REFS
  const playerRef = useRef<any>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);

  // KEEP CALLBACKS UPDATED
  useEffect(() => {
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
  }, [onProgress, onComplete]);

  // STOP PROGRESS TIMER
  function stopProgressTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // CHECK + SEND PROGRESS
  function checkProgress() {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    try {
      const currentTime = Number(player.getCurrentTime());
      const duration = Number(player.getDuration());

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

      // Report playback position.
      // Completion is determined by the progress API.
      onProgressRef.current?.(safeCurrentTime, duration);
    } catch (error) {
      console.error(
        "Failed to read YouTube progress:",
        error
      );
    }
  }

  // START TIMER
  function startProgressTimer() {
    stopProgressTimer();

    intervalRef.current = setInterval(() => {
      checkProgress();
    }, 1000);
  }

  // CREATE YOUTUBE PLAYER
  useEffect(() => {
    let mounted = true;

    function createPlayer() {
      if (!mounted || !window.YT?.Player) {
        return;
      }

      // Prevent duplicate player
      if (playerRef.current) {
        return;
      }

      const playerElement = document.getElementById(
        "youtube-player"
      );

      if (!playerElement) {
        return;
      }

      playerRef.current = new window.YT.Player(
        "youtube-player",
        {
          videoId,

          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: Math.max(0, Math.floor(startSeconds)),
          },

          events: {
            // READY
            onReady: (event: any) => {
              // The IFrame API replaces the target div with its own iframe.
              // Explicitly size that generated iframe to the responsive 16:9
              // wrapper; otherwise it can retain a smaller default size on mobile.
              const iframe = event.target.getIframe?.();
              if (iframe) {
                iframe.style.position = "absolute";
                iframe.style.inset = "0";
                iframe.style.display = "block";
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.maxWidth = "100%";
                iframe.style.border = "0";
              }

              if (startSeconds > 0) {
                event.target.seekTo(
                  Math.floor(startSeconds),
                  true
                );
              }

              // Report initial position without completing
              // the lesson.
              setTimeout(() => {
                if (mounted) {
                  checkProgress();
                }
              }, 500);
            },

            // STATE CHANGE
            onStateChange: (event: any) => {
              const YTState = window.YT.PlayerState;

              // PLAYING
              if (event.data === YTState.PLAYING) {
                startProgressTimer();
              }

              // PAUSED
              if (event.data === YTState.PAUSED) {
                stopProgressTimer();
                checkProgress();
              }

              // BUFFERING
              if (event.data === YTState.BUFFERING) {
                stopProgressTimer();
              }

              // ENDED
              if (event.data === YTState.ENDED) {
                stopProgressTimer();

                // Capture final playback position.
                checkProgress();

                // Save progress immediately.
                // The API still decides whether the lesson
                // qualifies as completed.
                onCompleteRef.current?.();
              }
            },
          },
        }
      );
    }

    // API ALREADY LOADED
    if (window.YT?.Player) {
      createPlayer();
    } else {
      // LOAD YOUTUBE API
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.body.appendChild(script);
      }

      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();

        if (mounted) {
          createPlayer();
        }
      };
    }

    // CLEANUP
    return () => {
      mounted = false;

      stopProgressTimer();

      if (playerRef.current?.destroy) {
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
  }, [videoId, startSeconds, lessonId]);

  // Responsive 16:9 player. The API replaces the inner div with an iframe,
  // so the iframe itself is sized in onReady above as well as by these styles.
  return (
    <div className="relative isolate aspect-video w-full min-w-0 max-w-full overflow-hidden rounded-[12px] bg-black shadow-sm">
      <div
        id="youtube-player"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
