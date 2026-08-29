import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";

export async function GET() {
    try {
        const result = await db.select().from(courses);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Courses API error:", error);

        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}