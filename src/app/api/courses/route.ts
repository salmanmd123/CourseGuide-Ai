import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";

/*
 * =========================================================
 * NORMALIZE TEXT
 * =========================================================
 */

function normalizeText(
    value: string | null | undefined
): string {
    return (value || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[\/_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/*
 * =========================================================
 * NORMALIZE CATEGORY
 * =========================================================
 */

function normalizeCategory(
    value: string | null | undefined
): string {
    const category =
        normalizeText(value);

    if (!category) {
        return "";
    }

    if (
        category === "programming" ||
        category === "programming languages" ||
        category === "coding"
    ) {
        return "Programming";
    }

    if (
        category === "computer science" ||
        category === "cs" ||
        category ===
            "computer science fundamentals"
    ) {
        return "Computer Science";
    }

    if (
        category === "ai ml" ||
        category === "ai and ml" ||
        category ===
            "ai machine learning" ||
        category ===
            "artificial intelligence" ||
        category ===
            "machine learning" ||
        category ===
            "artificial intelligence and machine learning"
    ) {
        return "AI & ML";
    }

    if (
        category === "web development" ||
        category === "web dev" ||
        category === "webdevelopment"
    ) {
        return "Web Development";
    }

    if (
        category === "databases" ||
        category === "database" ||
        category ===
            "database management" ||
        category === "dbms"
    ) {
        return "Databases";
    }

    return value?.trim() || "";
}

/*
 * =========================================================
 * GET COURSES
 * =========================================================
 */

export async function GET(
    request: Request
) {
    try {
        const { searchParams } =
            new URL(request.url);

        const language =
            searchParams
                .get("language")
                ?.trim();

        const category =
            searchParams
                .get("category")
                ?.trim();

        /*
         * -----------------------------------------------------
         * DATABASE CONDITIONS
         * -----------------------------------------------------
         */

        const conditions = [];

        /*
         * LANGUAGE
         *
         * Language remains a hard filter.
         */

        if (language) {
            conditions.push(
                eq(
                    courses.language,
                    language
                )
            );
        }

        /*
         * CATEGORY
         *
         * For canonical categories, query the actual database
         * values used by CourseGuide AI.
         */

        if (
            category &&
            category !== "All"
        ) {
            const normalizedCategory =
                normalizeCategory(
                    category
                );

            /*
             * Database currently uses:
             *
             * Programming
             * Computer Science
             * AI & ML
             * Web Development
             * Databases
             */

            conditions.push(
                eq(
                    courses.category,
                    normalizedCategory
                )
            );
        }

        /*
         * -----------------------------------------------------
         * QUERY DATABASE
         * -----------------------------------------------------
         */

        const result =
            conditions.length > 0
                ? await db
                      .select()
                      .from(courses)
                      .where(
                          and(
                              ...conditions
                          )
                      )
                : await db
                      .select()
                      .from(courses);

        return NextResponse.json(
            result
        );
    } catch (error) {
        console.error(
            "Courses API error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to fetch courses",
            },
            {
                status: 500,
            }
        );
    }
}