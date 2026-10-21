
import { NextRequest, NextResponse } from "next/server";
import {
  asc,
  desc,
  eq,
  ilike,
  or,
  and,
  ne,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  quizSubjects,
  quizTopics,
  quizzes,
} from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const search = params.get("search")?.trim() ?? "";
    const category = params.get("category") ?? "";
    const subjectId = Number(params.get("subjectId") ?? 0);
    const topicId = Number(params.get("topicId") ?? 0);
    const difficulty = params.get("difficulty") ?? "";
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(
      30,
      Math.max(1, Number(params.get("limit") ?? 12))
    );

    // Never expose Career Prep subjects in the Quiz Center.
    const subjectConditions = [
      eq(quizSubjects.isActive, true),
      ne(quizSubjects.category, "CAREER"),
    ];

    if (category) {
      // A direct CAREER category request must return no subjects.
      if (category.toUpperCase() === "CAREER") {
        return NextResponse.json({
          subjects: [],
          topics: [],
          quizzes: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      subjectConditions.push(
        eq(quizSubjects.category, category)
      );
    }

    // Search filters the subject catalog independently from quiz titles.
    if (search) {
      subjectConditions.push(
        or(
          ilike(quizSubjects.name, `%${search}%`),
          ilike(quizSubjects.description, `%${search}%`)
        )!
      );
    }

    const subjects = await db
      .select()
      .from(quizSubjects)
      .where(and(...subjectConditions))
      .orderBy(
        asc(quizSubjects.sortOrder),
        asc(quizSubjects.name)
      );

    const topics = await db
      .select({
        id: quizTopics.id,
        subjectId: quizTopics.subjectId,
        name: quizTopics.name,
        slug: quizTopics.slug,
        description: quizTopics.description,
      })
      .from(quizTopics)
      .innerJoin(
        quizSubjects,
        eq(quizTopics.subjectId, quizSubjects.id)
      )
      .where(
        and(
          eq(quizTopics.isActive, true),
          eq(quizSubjects.isActive, true),
          ne(quizSubjects.category, "CAREER")
        )
      )
      .orderBy(
        asc(quizTopics.sortOrder),
        asc(quizTopics.name)
      );

    // The Quiz Center's main screen is a generator/catalog, not a list of
    // stored quizzes. Avoid extra Neon queries when only subjects/topics are needed.
    if (params.get("catalogOnly") === "true") {
      return NextResponse.json({ subjects, topics, quizzes: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0 } });
    }

    const conditions = [
      eq(quizzes.isPublished, true),
      ne(quizSubjects.category, "CAREER"),
    ];

    if (subjectId > 0) {
      conditions.push(eq(quizzes.subjectId, subjectId));
    }

    if (topicId > 0) {
      conditions.push(eq(quizzes.topicId, topicId));
    }

    if (difficulty) {
      const normalizedDifficulty = difficulty.toUpperCase();

      if (
        ["EASY", "MEDIUM", "HARD"].includes(
          normalizedDifficulty
        )
      ) {
        conditions.push(
          eq(quizzes.difficulty, normalizedDifficulty)
        );
      }
    }

    if (category) {
      const categorySubjects = await db
        .select({ id: quizSubjects.id })
        .from(quizSubjects)
        .where(
          and(
            eq(quizSubjects.isActive, true),
            ne(quizSubjects.category, "CAREER"),
            eq(quizSubjects.category, category)
          )
        );

      const matchingSubjectIds = categorySubjects.map(
        (subject) => subject.id
      );

      if (matchingSubjectIds.length === 0) {
        return NextResponse.json({
          subjects,
          topics: [],
          quizzes: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      conditions.push(
        sql`${quizzes.subjectId} IN (${sql.join(
          matchingSubjectIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(quizzes.title, `%${search}%`),
          ilike(quizzes.description, `%${search}%`)
        )!
      );
    }

    const whereClause = and(
      ...conditions,
      eq(quizzes.subjectId, quizSubjects.id)
    );

    const [countResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(quizzes)
      .innerJoin(
        quizSubjects,
        eq(quizzes.subjectId, quizSubjects.id)
      )
      .where(whereClause);

    const total = countResult?.count ?? 0;

    const quizList = await db
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
      .where(whereClause)
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      subjects,
      topics,
      quizzes: quizList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Quiz listing API error:", error);

    return NextResponse.json(
      { error: "Failed to load quizzes." },
      { status: 500 }
    );
  }
}
