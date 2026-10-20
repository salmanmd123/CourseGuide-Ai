
import { NextResponse } from "next/server";
import { and, desc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  quizAttempts,
  quizzes,
  quizSubjects,
  quizTopics,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to view your quiz history." },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const requestedPage = Number(
      url.searchParams.get("page") ?? 1
    );
    const requestedLimit = Number(
      url.searchParams.get("limit") ?? 10
    );

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    const offset = (page - 1) * limit;

    // Include only attempts belonging to non-career subjects.
    const historyConditions = and(
      eq(quizAttempts.userId, user.id),
      ne(quizSubjects.category, "CAREER")
    );

    const [summary] = await db
      .select({
        totalAttempts: sql<number>`count(*)::int`,
        totalCorrect: sql<number>`
          coalesce(sum(${quizAttempts.score}), 0)::int
        `,
        totalQuestions: sql<number>`
          coalesce(sum(${quizAttempts.totalQuestions}), 0)::int
        `,
        averagePercentage: sql<number>`
          coalesce(
            round(
              avg(
                ${quizAttempts.score}::numeric
                / nullif(${quizAttempts.totalQuestions}, 0)
                * 100
              ),
              1
            ),
            0
          )::float
        `,
      })
      .from(quizAttempts)
      .innerJoin(
        quizzes,
        eq(quizAttempts.quizId, quizzes.id)
      )
      .innerJoin(
        quizSubjects,
        eq(quizzes.subjectId, quizSubjects.id)
      )
      .where(historyConditions);

    const [countResult] = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(quizAttempts)
      .innerJoin(
        quizzes,
        eq(quizAttempts.quizId, quizzes.id)
      )
      .innerJoin(
        quizSubjects,
        eq(quizzes.subjectId, quizSubjects.id)
      )
      .where(historyConditions);

    const attempts = await db
      .select({
        attemptId: quizAttempts.id,
        score: quizAttempts.score,
        totalQuestions: quizAttempts.totalQuestions,
        completedAt: quizAttempts.completedAt,
        quizId: quizzes.id,
        quizTitle: quizzes.title,
        difficulty: quizzes.difficulty,
        quizType: quizzes.quizType,
        subjectId: quizSubjects.id,
        subjectName: quizSubjects.name,
        topicName: quizTopics.name,
      })
      .from(quizAttempts)
      .innerJoin(
        quizzes,
        eq(quizAttempts.quizId, quizzes.id)
      )
      .innerJoin(
        quizSubjects,
        eq(quizzes.subjectId, quizSubjects.id)
      )
      .leftJoin(
        quizTopics,
        eq(quizzes.topicId, quizTopics.id)
      )
      .where(historyConditions)
      .orderBy(desc(quizAttempts.completedAt))
      .limit(limit)
      .offset(offset);

    const total = countResult?.total ?? 0;

    return NextResponse.json({
      summary: {
        totalAttempts: summary?.totalAttempts ?? 0,
        totalCorrect: summary?.totalCorrect ?? 0,
        totalQuestions: summary?.totalQuestions ?? 0,
        averagePercentage: summary?.averagePercentage ?? 0,
      },
      attempts: attempts.map((attempt) => ({
        ...attempt,
        percentage:
          attempt.totalQuestions > 0
            ? Math.round(
                (attempt.score / attempt.totalQuestions) * 100
              )
            : 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Quiz history API error:", error);

    return NextResponse.json(
      { error: "Failed to load quiz history." },
      { status: 500 }
    );
  }
}
