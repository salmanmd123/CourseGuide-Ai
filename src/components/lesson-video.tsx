"use client";

import { useCallback, useEffect, useRef } from "react";
import YouTubePlayer from "@/components/youtube-player";

type WatchInterval = [number, number];

type LessonVideoProps = {
  lessonId: number;
  videoUrl: string;
  startSeconds?: number;
  initialWatchedIntervals?: WatchInterval[];
  onWatchProgress?: (watchedSeconds: number, durationSeconds: number) => void;
};

type ProgressSnapshot = {
  positionSeconds: number;
  durationSeconds: number;
  watchedIntervals: WatchInterval[];
  watchedSeconds: number;
  watchPercentage: number;
};

const SAVE_INTERVAL_MS = 20_000;
const MAX_CONTIGUOUS_JUMP_SECONDS = 2.5;

function mergeIntervals(intervals: WatchInterval[]): WatchInterval[] {
  const sorted = intervals
    .filter(([start, end]) =>
      Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start
    )
    .map(([start, end]) => [start, end] as WatchInterval)
    .sort((a, b) => a[0] - b[0]);

  const merged: WatchInterval[] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (!last || start > last[1]) merged.push([start, end]);
    else last[1] = Math.max(last[1], end);
  }
  return merged;
}

function getWatchedSeconds(intervals: WatchInterval[]): number {
  return Math.floor(mergeIntervals(intervals).reduce(
    (total, [start, end]) => total + end - start, 0
  ));
}

export default function LessonVideo({
  lessonId,
  videoUrl,
  startSeconds = 0,
  initialWatchedIntervals = [],
  onWatchProgress,
}: LessonVideoProps) {
  const intervalsRef = useRef<WatchInterval[]>(mergeIntervals(initialWatchedIntervals));
  const previousPositionRef = useRef<number | null>(null);
  const latestProgressRef = useRef<ProgressSnapshot>({
    positionSeconds: Math.max(0, startSeconds),
    durationSeconds: 0,
    watchedIntervals: mergeIntervals(initialWatchedIntervals),
    watchedSeconds: getWatchedSeconds(initialWatchedIntervals),
    watchPercentage: 0,
  });
  const lastSavedAtRef = useRef(0);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const mountedRef = useRef(true);

 
  const saveProgress = useCallback(async (keepalive = false): Promise<void> => {
    if (savingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    if (latestProgressRef.current.durationSeconds <= 0) return;

    savingRef.current = true;

    try {
      do {
        pendingSaveRef.current = false;

        const current = latestProgressRef.current;

        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            positionSeconds: Math.floor(current.positionSeconds),
            durationSeconds: Math.floor(current.durationSeconds),
            watchedIntervals: current.watchedIntervals,
            watchedSeconds: current.watchedSeconds,
            watchPercentage: current.watchPercentage,
          }),
          keepalive,
        });

        if (!response.ok) {
          if (mountedRef.current) {
            console.error("Failed to save video progress:", response.status);
          }
        } else {
          lastSavedAtRef.current = Date.now();
        }
      } while (pendingSaveRef.current && !keepalive);
    } catch (error) {
      if (mountedRef.current) {
        console.error("Failed to save video progress:", error);
      }
    } finally {
      savingRef.current = false;
    }
  }, [lessonId]);


  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Best effort: preserve the latest known position and watched intervals on navigation.
      void saveProgress(true);
    };
  }, [saveProgress]);

  function handleProgress(currentTime: number, duration: number) {
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return;

    const position = Math.max(0, Math.min(currentTime, duration));
    const previous = previousPositionRef.current;

    // Only count small forward movements. A seek produces a large delta and adds no interval.
    if (previous !== null) {
      const delta = position - previous;
      if (delta > 0 && delta <= MAX_CONTIGUOUS_JUMP_SECONDS) {
        intervalsRef.current = mergeIntervals([
          ...intervalsRef.current,
          [previous, position],
        ]);
      }
    }
    previousPositionRef.current = position;

    const watchedIntervals = mergeIntervals(intervalsRef.current);
    const watchedSeconds = Math.min(Math.floor(duration), getWatchedSeconds(watchedIntervals));
    const watchPercentage = Math.min(100, Math.floor((watchedSeconds / duration) * 100));

    latestProgressRef.current = {
      positionSeconds: position,
      durationSeconds: duration,
      watchedIntervals,
      watchedSeconds,
      watchPercentage,
    };

    onWatchProgress?.(watchedSeconds, duration);

    const now = Date.now();
    if (lastSavedAtRef.current === 0 || now - lastSavedAtRef.current >= SAVE_INTERVAL_MS) {
      void saveProgress();
    }
  }

  async function handleComplete() {
    await saveProgress();
  }

  return (
    <YouTubePlayer
      key={`${lessonId}-${videoUrl}`}
      lessonId={lessonId}
      videoId={videoUrl}
      startSeconds={startSeconds}
      onProgress={handleProgress}
      onComplete={handleComplete}
    />
  );
}
