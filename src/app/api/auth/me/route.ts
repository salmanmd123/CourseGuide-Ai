import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({
                user: null,
            });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "Get current user error:",
            error
        );

        return NextResponse.json(
            { error: "Failed to get current user" },
            { status: 500 }
        );
    }
}
