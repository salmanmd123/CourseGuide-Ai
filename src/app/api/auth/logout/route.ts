import { logout } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await logout();

        return NextResponse.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        );
    }
}