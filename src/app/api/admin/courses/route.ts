import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

/*
=========================================================
GET
/admin/courses
=========================================================
*/

export async function GET() {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 403,
                }
            );
        }

        const result = await db
            .select()
            .from(courses)
            .orderBy(desc(courses.createdAt));

        return NextResponse.json(result);
    } catch (error) {
        console.error(
            "Admin courses GET error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to fetch courses",
            },
            {
                status: 500,
            }
        );
    }
}

/*
=========================================================
PATCH
/admin/courses

Used for:
- featured
- adminRecommended
=========================================================
*/

export async function PATCH(
    request: Request
) {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await request.json();

        const id = Number(body.id);

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                {
                    error: "Invalid course ID",
                },
                {
                    status: 400,
                }
            );
        }

        const updates: {
            featured?: boolean;
            adminRecommended?: boolean;
        } = {};

        if (
            typeof body.featured ===
            "boolean"
        ) {
            updates.featured =
                body.featured;
        }

        if (
            typeof body.adminRecommended ===
            "boolean"
        ) {
            updates.adminRecommended =
                body.adminRecommended;
        }

        if (
            Object.keys(updates).length === 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "No valid update provided",
                },
                {
                    status: 400,
                }
            );
        }

        const [updatedCourse] =
            await db
                .update(courses)
                .set({
                    ...updates,
                    updatedAt: new Date(),
                })
                .where(
                    eq(
                        courses.id,
                        id
                    )
                )
                .returning();

        if (!updatedCourse) {
            return NextResponse.json(
                {
                    error:
                        "Course not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            updatedCourse
        );
    } catch (error) {
        console.error(
            "Admin courses PATCH error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to update course",
            },
            {
                status: 500,
            }
        );
    }
}

/*
=========================================================
DELETE
/admin/courses?id=123
=========================================================
*/

export async function DELETE(
    request: Request
) {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 403,
                }
            );
        }

        const { searchParams } =
            new URL(request.url);

        const id = Number(
            searchParams.get("id")
        );

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                {
                    error:
                        "Invalid course ID",
                },
                {
                    status: 400,
                }
            );
        }

        const [deletedCourse] =
            await db
                .delete(courses)
                .where(
                    eq(
                        courses.id,
                        id
                    )
                )
                .returning();

        if (!deletedCourse) {
            return NextResponse.json(
                {
                    error:
                        "Course not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            course: deletedCourse,
        });
    } catch (error) {
        console.error(
            "Admin courses DELETE error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to delete course",
            },
            {
                status: 500,
            }
        );
    }
}