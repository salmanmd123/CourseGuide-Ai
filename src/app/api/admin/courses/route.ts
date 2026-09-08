import { NextResponse } from "next/server";
import {
  desc,
  eq,
} from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

import {
  createAdminYouTubeCourse,
} from "@/lib/admin-youtube";


/* =========================================================
   POST
   /api/admin/courses

   Create:
   - YouTube VIDEO course
   - YouTube PLAYLIST course
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const courseType =
      body.courseType;

    if (
      courseType !==
        "VIDEO" &&
      courseType !==
        "PLAYLIST"
    ) {
      return NextResponse.json(
        {
          error:
            "Course type must be VIDEO or PLAYLIST",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.url !==
        "string" ||
      !body.url.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "YouTube URL is required",
        },
        {
          status: 400,
        }
      );
    }

    const course =
      await createAdminYouTubeCourse(
        {
          url:
            body.url,

          courseType,

          title:
            typeof body.title ===
            "string"
              ? body.title
              : "",

          description:
            typeof body.description ===
            "string"
              ? body.description
              : "",

          category:
            typeof body.category ===
            "string"
              ? body.category
              : "",

          level:
            typeof body.level ===
            "string"
              ? body.level
              : "",

          language:
            typeof body.language ===
            "string"
              ? body.language
              : "",

          featured:
            Boolean(
              body.featured
            ),

          adminRecommended:
            Boolean(
              body.adminRecommended
            ),
        }
      );

    return NextResponse.json(
      {
        success: true,
        course,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Admin courses POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create course",
      },
      {
        status: 400,
      }
    );
  }
}


/* =========================================================
   GET
   /api/admin/courses
========================================================= */

export async function GET() {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const result =
      await db
        .select()
        .from(courses)
        .orderBy(
          desc(
            courses.createdAt
          )
        );

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "Admin courses GET error:",
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


/* =========================================================
   PATCH
   /api/admin/courses

   Used for:
   - featured
   - adminRecommended
========================================================= */

export async function PATCH(
  request: Request
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const id =
      Number(body.id);

    if (
      !Number.isInteger(id)
    ) {
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
      Object.keys(
        updates
      ).length === 0
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

    const [
      updatedCourse,
    ] =
      await db
        .update(courses)
        .set({
          ...updates,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            courses.id,
            id
          )
        )
        .returning();

    if (
      !updatedCourse
    ) {
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


/* =========================================================
   DELETE
   /api/admin/courses?id=123
========================================================= */

export async function DELETE(
  request: Request
) {
  try {
    const admin =
      await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const id =
      Number(
        searchParams.get(
          "id"
        )
      );

    if (
      !Number.isInteger(id)
    ) {
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

    const [
      deletedCourse,
    ] =
      await db
        .delete(courses)
        .where(
          eq(
            courses.id,
            id
          )
        )
        .returning();

    if (
      !deletedCourse
    ) {
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
      {
        success: true,

        course:
          deletedCourse,
      }
    );
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