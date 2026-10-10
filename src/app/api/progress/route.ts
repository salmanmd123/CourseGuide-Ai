import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

import { db } from "@/db";
import { progress } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(
  request: Request
) {
  try {
    // =====================================================
    // CHECK LOGIN
    // =====================================================

    const userId =
      await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // GET REQUEST DATA
    // =====================================================

    const body =
      await request.json();

    const lessonId =
      Number(body.lessonId);

    const watchedSeconds =
      Math.max(
        0,
        Math.floor(
          Number(
            body.watchedSeconds
          ) || 0
        )
      );

    const watchPercentage =
      Math.min(
        100,
        Math.max(
          0,
          Math.floor(
            Number(
              body.watchPercentage
            ) || 0
          )
        )
      );

    if (
      !Number.isInteger(
        lessonId
      ) ||
      lessonId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Valid lesson ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // AUTOMATIC COMPLETION
    // =====================================================

    /*
     * A lesson becomes completed automatically at 90%.
     */
    const shouldComplete =
      watchPercentage >= 90;

    // =====================================================
    // UPSERT PROGRESS
    // =====================================================

    /*
     * The database already has a unique constraint on:
     *
     * userId + lessonId
     *
     * Therefore we can safely use ON CONFLICT.
     *
     * This replaces the old:
     *
     * SELECT progress
     *       ↓
     * UPDATE progress
     *
     * with a single database operation.
     */

    await db
      .insert(progress)
      .values({
        userId: userId,

        lessonId,

        watchedSeconds,

        watchPercentage,

        completed:
          shouldComplete,

        completedAt:
          shouldComplete
            ? new Date()
            : null,
      })
      .onConflictDoUpdate({
        target: [
          progress.userId,
          progress.lessonId,
        ],

        set: {
          /*
           * Never move the saved position backwards.
           */
          watchedSeconds: sql`
            GREATEST(
              ${progress.watchedSeconds},
              EXCLUDED.watched_seconds
            )
          `,

          /*
           * Never reduce the saved percentage.
           */
          watchPercentage: sql`
            GREATEST(
              ${progress.watchPercentage},
              EXCLUDED.watch_percentage
            )
          `,

          /*
           * Once completed, always remain completed.
           */
          completed: sql`
            ${progress.completed}
            OR EXCLUDED.completed
            OR EXCLUDED.watch_percentage >= 90
          `,

          /*
           * Preserve the original completedAt date.
           *
           * If the lesson becomes completed for the first
           * time, save the current timestamp.
           */
          completedAt: sql`
            CASE
              WHEN
                ${progress.completed}
                OR EXCLUDED.completed
                OR EXCLUDED.watch_percentage >= 90
              THEN
                COALESCE(
                  ${progress.completedAt},
                  NOW()
                )
              ELSE
                NULL
            END
          `,
        },
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Progress error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}