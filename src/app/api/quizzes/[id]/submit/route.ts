import { NextResponse } from "next/server";
import { and, asc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { quizzes, quizSubjects, quizAttempts, quizQuestions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { decryptQuizPayload, type SignedQuizQuestion } from "@/lib/quiz-token";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ id: string }> };
const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in to submit a quiz." }, { status: 401 });

    const { id } = await params;
    const quizId = Number(id);
    if (!Number.isSafeInteger(quizId) || quizId <= 0) {
      return NextResponse.json({ error: "Invalid quiz ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body) || !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Please provide your answers." }, { status: 400 });
    }

    let questions: SignedQuizQuestion[];
    if (typeof body.quizToken === "string" && body.quizToken.length > 0) {
      let payload;
      try {
        payload = decryptQuizPayload(body.quizToken);
      } catch {
        return NextResponse.json({ error: "This saved quiz is invalid or damaged. Generate a new quiz to continue." }, { status: 400 });
      }
      if (payload.quizId !== quizId || payload.userId !== user.id) {
        return NextResponse.json({ error: "This quiz does not belong to your current session." }, { status: 403 });
      }
      questions = payload.questions;
    } else {
      // Backward compatibility for older quizzes whose questions were already
      // stored in Neon before the local IndexedDB change.
      const oldQuestions = await db.select({
        id: quizQuestions.id,
        question: quizQuestions.question,
        optionA: quizQuestions.optionA,
        optionB: quizQuestions.optionB,
        optionC: quizQuestions.optionC,
        optionD: quizQuestions.optionD,
        correctAnswer: quizQuestions.correctAnswer,
        explanation: quizQuestions.explanation,
        sortOrder: quizQuestions.sortOrder,
      }).from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(asc(quizQuestions.sortOrder), asc(quizQuestions.id));
      if (!oldQuestions.length) {
        return NextResponse.json({ error: "This saved quiz is missing its local key. Generate a new quiz to continue." }, { status: 400 });
      }
      questions = oldQuestions.map((question) => ({
        ...question,
        correctAnswer: question.correctAnswer.toUpperCase() as "A" | "B" | "C" | "D",
      }));
    }

    const [quiz] = await db
      .select({ id: quizzes.id, title: quizzes.title, questionCount: quizzes.questionCount })
      .from(quizzes)
      .innerJoin(quizSubjects, eq(quizzes.subjectId, quizSubjects.id))
      .where(and(
        eq(quizzes.id, quizId),
        eq(quizzes.isPublished, true),
        eq(quizSubjects.isActive, true),
        ne(quizSubjects.category, "CAREER"),
      ))
      .limit(1);

    if (!quiz) return NextResponse.json({ error: "Published quiz not found." }, { status: 404 });

    if (!questions.length || questions.length !== quiz.questionCount) {
      return NextResponse.json({ error: "The saved quiz does not match its metadata." }, { status: 409 });
    }

    const submittedAnswers = body.answers as Record<string, unknown>;
    const expectedIds = new Set(questions.map((question) => String(question.id)));
    const submittedIds = Object.keys(submittedAnswers);
    if (submittedIds.length !== questions.length || submittedIds.some((questionId) => !expectedIds.has(questionId))) {
      return NextResponse.json({ error: "Please answer every question before submitting." }, { status: 400 });
    }

    const normalizedAnswers: Record<string, string> = {};
    for (const question of questions) {
      const key = String(question.id);
      const answer = submittedAnswers[key];
      if (typeof answer !== "string" || !VALID_OPTIONS.has(answer.toUpperCase())) {
        return NextResponse.json({ error: "An answer contains an invalid option." }, { status: 400 });
      }
      normalizedAnswers[key] = answer.toUpperCase();
    }

    const score = questions.reduce((total, question) =>
      total + (normalizedAnswers[String(question.id)] === question.correctAnswer ? 1 : 0), 0);

    const [attempt] = await db.insert(quizAttempts).values({
      userId: user.id,
      quizId,
      score,
      totalQuestions: questions.length,
      answers: normalizedAnswers,
    }).returning({
      id: quizAttempts.id,
      score: quizAttempts.score,
      totalQuestions: quizAttempts.totalQuestions,
      completedAt: quizAttempts.completedAt,
    });

    const results = questions.map((question) => {
      const selectedAnswer = normalizedAnswers[String(question.id)];
      return {
        questionId: question.id,
        question: question.question,
        options: { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD },
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
        explanation: question.explanation,
      };
    });

    return NextResponse.json({
      message: "Quiz submitted successfully.",
      attempt,
      quiz: { id: quiz.id, title: quiz.title },
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results,
    });
  } catch (error) {
    console.error("Quiz submission API error:", error);
    return NextResponse.json({ error: "Failed to submit quiz." }, { status: 500 });
  }
}
