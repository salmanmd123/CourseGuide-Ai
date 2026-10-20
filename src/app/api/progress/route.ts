
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { progress } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";

type WatchInterval = [number, number];

function mergeIntervals(
  intervals: WatchInterval[],
  duration: number
): WatchInterval[] {
  const sorted = intervals
    .filter(
      (interval) =>
        Array.isArray(interval) &&
        interval.length === 2 &&
        Number.isFinite(interval[0]) &&
        Number.isFinite(interval[1]) &&
        interval[0] >= 0 &&
        interval[1] > interval[0]
    )
    .map(([start, end]) => [
      Math.max(0, Math.min(start, duration)),
      Math.max(0, Math.min(end, duration)),
    ] as WatchInterval)
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);

  const merged: WatchInterval[] = [];

  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];

    if (!last || start > last[1]) {
      merged.push([start, end]);
    } else {
      last[1] = Math.max(last[1], end);
    }
  }

  return merged;
}

function getWatchedSeconds(intervals: WatchInterval[]): number {
  return Math.floor(
    intervals.reduce(
      (total, [start, end]) => total + end - start,
      0
    )
  );
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const lessonId = Number(body.lessonId);
    const durationSeconds = Number(body.durationSeconds);
    const positionSeconds = Number(body.positionSeconds);

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return NextResponse.json(
        { error: "Valid lesson ID is required" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 ||
      !Number.isFinite(positionSeconds)
    ) {
      return NextResponse.json(
        { error: "Valid video duration and position are required" },
        { status: 400 }
      );
    }

    const duration = Math.floor(durationSeconds);
    const position = Math.floor(
      Math.max(0, Math.min(positionSeconds, duration))
    );

    const incomingIntervals: WatchInterval[] =
      Array.isArray(body.watchedIntervals)
        ? body.watchedIntervals
        : [];

    // Load previously watched intervals for this user and lesson.
    const existingRows = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.lessonId, lessonId)
        )
      )
      .limit(1);

    const existing = existingRows[0];

    const existingIntervals: WatchInterval[] =
      Array.isArray(existing?.watchedIntervals)
        ? (existing.watchedIntervals as WatchInterval[])
        : [];

    // Merge intervals so overlapping or repeated viewing isn't double-counted.
    const watchedIntervals = mergeIntervals(
      [...existingIntervals, ...incomingIntervals],
      duration
    );

    // Always derive watched time and percentage from the merged intervals.
    const watchedSeconds = Math.min(
      duration,
      getWatchedSeconds(watchedIntervals)
    );

    const watchPercentage = Math.min(
      100,
      Math.floor((watchedSeconds / duration) * 100)
    );

    // Completion is based on actual unique watched time.
    const completed = watchPercentage >= 90;

    const completedAt = completed
      ? existing?.completedAt ?? new Date()
      : null;

    await db
      .insert(progress)
      .values({
        userId,
        lessonId,
        watchedSeconds,
        watchPercentage,
        watchedIntervals,
        positionSeconds: position,
        completed,
        completedAt,
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: {
          // Do not use GREATEST here. These values must match the intervals.
          watchedSeconds,
          watchPercentage,
          watchedIntervals,
          positionSeconds: position,
          completed,
          completedAt,
        },
      });

    return NextResponse.json({
      success: true,
      watchedSeconds,
      watchPercentage,
      positionSeconds: position,
      watchedIntervals,
      completed,
    });
  } catch (error) {
    console.error("Progress error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
