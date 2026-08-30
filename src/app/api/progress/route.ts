import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { progress, lessons } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // =========================
    // CHECK LOGIN
    // =========================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // GET REQUEST DATA
    // =========================

    const body = await request.json();

    const lessonId = Number(body.lessonId);

    const watchedSeconds = Math.max(
      0,
      Math.floor(Number(body.watchedSeconds) || 0)
    );

    const watchPercentage = Math.min(
      100,
      Math.max(
        0,
        Math.floor(Number(body.watchPercentage) || 0)
      )
    );

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return NextResponse.json(
        { error: "Valid lesson ID is required" },
        { status: 400 }
      );
    }

    // =========================
    // CHECK LESSON
    // =========================

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId));

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // =========================
    // AUTOMATIC COMPLETION
    // =========================

    // User must watch at least 90%
    // No manual completion is accepted.

    const shouldComplete = watchPercentage >= 90;

    // =========================
    // FIND EXISTING PROGRESS
    // =========================

    const [existingProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, user.id),
          eq(progress.lessonId, lessonId)
        )
      );

    // =========================
    // UPDATE EXISTING PROGRESS
    // =========================

    if (existingProgress) {
      const newWatchedSeconds = Math.max(
        existingProgress.watchedSeconds,
        watchedSeconds
      );

      const newWatchPercentage = Math.max(
        existingProgress.watchPercentage,
        watchPercentage
      );

      const newCompleted =
        existingProgress.completed ||
        newWatchPercentage >= 90;

      await db
        .update(progress)
        .set({
          watchedSeconds: newWatchedSeconds,

          watchPercentage: newWatchPercentage,

          completed: newCompleted,

          completedAt:
            existingProgress.completedAt ??
            (newCompleted ? new Date() : null),
        })
        .where(eq(progress.id, existingProgress.id));

      return NextResponse.json({
        success: true,
        completed: newCompleted,
        watchedSeconds: newWatchedSeconds,
        watchPercentage: newWatchPercentage,
      });
    }

    // =========================
    // CREATE NEW PROGRESS
    // =========================

    const completed = shouldComplete;

    await db.insert(progress).values({
      userId: user.id,
      lessonId,

      watchedSeconds,

      watchPercentage,

      completed,

      completedAt: completed
        ? new Date()
        : null,
    });

    return NextResponse.json({
      success: true,
      completed,
      watchedSeconds,
      watchPercentage,
    });
  } catch (error) {
    console.error("Progress error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}