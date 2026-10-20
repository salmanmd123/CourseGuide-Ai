
import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  quizzes,
  quizSubjects,
  quizQuestions,
  quizAttempts,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to submit a quiz." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const quizId = Number(id);

    if (!Number.isSafeInteger(quizId) || quizId <= 0) {
      return NextResponse.json(
        { error: "Invalid quiz ID." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !body.answers ||
      typeof body.answers !== "object" ||
      Array.isArray(body.answers)
    ) {
      return NextResponse.json(
        { error: "Please provide your answers." },
        { status: 400 }
      );
    }

    const submittedAnswers = body.answers as Record<string, unknown>;

    // Only published quizzes from active, non-career subjects
    // can be submitted in the Quiz Center.
    const [quiz] = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        questionCount: quizzes.questionCount,
      })
      .from(quizzes)
      .innerJoin(
        quizSubjects,
        eq(quizzes.subjectId, quizSubjects.id)
      )
      .where(
        and(
          eq(quizzes.id, quizId),
          eq(quizzes.isPublished, true),
          eq(quizSubjects.isActive, true),
          ne(quizSubjects.category, "CAREER")
        )
      )
      .limit(1);

    if (!quiz) {
      return NextResponse.json(
        { error: "Published quiz not found." },
        { status: 404 }
      );
    }

    const questions = await db
      .select({
        id: quizQuestions.id,
        question: quizQuestions.question,
        optionA: quizQuestions.optionA,
        optionB: quizQuestions.optionB,
        optionC: quizQuestions.optionC,
        optionD: quizQuestions.optionD,
        correctAnswer: quizQuestions.correctAnswer,
        explanation: quizQuestions.explanation,
        sortOrder: quizQuestions.sortOrder,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(
        quizQuestions.sortOrder,
        quizQuestions.id
      );

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "This quiz has no questions." },
        { status: 409 }
      );
    }

    const validQuestionIds = new Set(
      questions.map((question) => String(question.id))
    );

    const submittedQuestionIds = Object.keys(submittedAnswers);

    // Require exactly one submitted answer for every question.
    if (submittedQuestionIds.length !== questions.length) {
      return NextResponse.json(
        { error: "Please answer every question before submitting." },
        { status: 400 }
      );
    }

    const normalizedAnswers: Record<string, string> = {};

    for (const [questionId, answer] of Object.entries(submittedAnswers)) {
      if (!validQuestionIds.has(questionId)) {
        return NextResponse.json(
          { error: "Your submission contains an invalid question ID." },
          { status: 400 }
        );
      }

      if (
        typeof answer !== "string" ||
        !VALID_OPTIONS.has(answer.toUpperCase())
      ) {
        return NextResponse.json(
          { error: "An answer contains an invalid option." },
          { status: 400 }
        );
      }

      normalizedAnswers[questionId] = answer.toUpperCase();
    }

    // Verify every expected question ID is present.
    for (const question of questions) {
      if (
        !Object.prototype.hasOwnProperty.call(
          normalizedAnswers,
          String(question.id)
        )
      ) {
        return NextResponse.json(
          { error: "Please answer every question before submitting." },
          { status: 400 }
        );
      }
    }

    const score = questions.reduce((total, question) => {
      return (
        total +
        (normalizedAnswers[String(question.id)] ===
        question.correctAnswer.toUpperCase()
          ? 1
          : 0)
      );
    }, 0);

    // Save the attempt using the authenticated user's ID.
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId: user.id,
        quizId,
        score,
        totalQuestions: questions.length,
        answers: normalizedAnswers,
      })
      .returning({
        id: quizAttempts.id,
        score: quizAttempts.score,
        totalQuestions: quizAttempts.totalQuestions,
        completedAt: quizAttempts.completedAt,
      });

    const results = questions.map((question) => {
      const selectedAnswer =
        normalizedAnswers[String(question.id)];

      const correctAnswer =
        question.correctAnswer.toUpperCase();

      return {
        questionId: question.id,
        question: question.question,
        options: {
          A: question.optionA,
          B: question.optionB,
          C: question.optionC,
          D: question.optionD,
        },
        selectedAnswer,
        correctAnswer,
        isCorrect: selectedAnswer === correctAnswer,
        explanation: question.explanation,
      };
    });

    return NextResponse.json({
      message: "Quiz submitted successfully.",
      attempt,
      quiz: {
        id: quiz.id,
        title: quiz.title,
      },
      score,
      totalQuestions: questions.length,
      percentage: Math.round(
        (score / questions.length) * 100
      ),
      results,
    });
  } catch (error) {
    console.error("Quiz submission API error:", error);

    return NextResponse.json(
      { error: "Failed to submit quiz." },
      { status: 500 }
    );
  }
}
