
import { NextResponse } from "next/server";
import { and, asc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  quizzes,
  quizSubjects,
  quizTopics,
  quizQuestions,
} from "@/db/schema";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const quizId = Number(id);

    if (!Number.isSafeInteger(quizId) || quizId <= 0) {
      return NextResponse.json(
        { error: "Invalid quiz ID." },
        { status: 400 }
      );
    }

    const [quiz] = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        difficulty: quizzes.difficulty,
        quizType: quizzes.quizType,
        questionCount: quizzes.questionCount,
        createdAt: quizzes.createdAt,
        subjectId: quizSubjects.id,
        subjectName: quizSubjects.name,
        subjectSlug: quizSubjects.slug,
        topicId: quizTopics.id,
        topicName: quizTopics.name,
      })
      .from(quizzes)
      .innerJoin(
        quizSubjects,
        eq(quizzes.subjectId, quizSubjects.id)
      )
      .leftJoin(
        quizTopics,
        eq(quizzes.topicId, quizTopics.id)
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
        { error: "Quiz not found." },
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
        sortOrder: quizQuestions.sortOrder,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(
        asc(quizQuestions.sortOrder),
        asc(quizQuestions.id)
      );

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "This quiz does not have any questions yet." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      quiz: {
        ...quiz,
        questionCount: questions.length,
      },
      questions,
    });
  } catch (error) {
    console.error("Fetch quiz API error:", error);

    return NextResponse.json(
      { error: "Failed to load quiz." },
      { status: 500 }
    );
  }
}


