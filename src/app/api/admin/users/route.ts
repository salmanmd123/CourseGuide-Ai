import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

/* =========================================================
   GET USERS
========================================================= */

export async function GET() {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .orderBy(desc(users.createdAt));

        return NextResponse.json({
            users: allUsers,
        });
    } catch (error) {
        console.error("Admin users GET error:", error);

        return NextResponse.json(
            {
                error: "Failed to load users",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   UPDATE USER ROLE
========================================================= */

export async function PATCH(request: Request) {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const id = Number(body.id);
        const role = body.role;

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    error: "Invalid user ID",
                },
                {
                    status: 400,
                }
            );
        }

        if (role !== "USER" && role !== "ADMIN") {
            return NextResponse.json(
                {
                    error: "Invalid role",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Prevent the currently logged-in admin
         * from accidentally removing their own admin access.
         */

        if (id === admin.id && role !== "ADMIN") {
            return NextResponse.json(
                {
                    error: "You cannot remove your own admin access.",
                },
                {
                    status: 400,
                }
            );
        }

        const [updatedUser] = await db
            .update(users)
            .set({
                role,
            })
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            });

        if (!updatedUser) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            user: updatedUser,
        });
    } catch (error) {
        console.error("Admin users PATCH error:", error);

        return NextResponse.json(
            {
                error: "Failed to update user role",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   DELETE USER
========================================================= */

export async function DELETE(request: Request) {
    try {
        const admin = await requireAdmin();

        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const id = Number(body.id);

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    error: "Invalid user ID",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Never allow an admin to delete
         * their own account from this panel.
         */

        if (id === admin.id) {
            return NextResponse.json(
                {
                    error: "You cannot delete your own account.",
                },
                {
                    status: 400,
                }
            );
        }

        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
            });

        if (!deletedUser) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            user: deletedUser,
        });
    } catch (error) {
        console.error("Admin users DELETE error:", error);

        return NextResponse.json(
            {
                error: "Failed to delete user",
            },
            {
                status: 500,
            }
        );
    }
}