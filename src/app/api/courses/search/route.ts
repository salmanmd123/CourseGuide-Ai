import { NextResponse } from "next/server";
import { ilike } from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";

import {
  searchYouTubeCourses,
  getYouTubeVideoStatistics,
} from "@/lib/youtube";

function createSlug(title: string, videoId: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);

  return `${slug}-${videoId}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        {
          error:
            "Search query is required",
        },
        { status: 400 }
      );
    }

    // ==================================
    // 1. DATABASE FIRST
    // ==================================

    const existingCourses =
      await db
        .select()
        .from(courses)
        .where(
          ilike(
            courses.title,
            `%${query}%`
          )
        );

    if (existingCourses.length > 0) {
      return NextResponse.json({
        source: "database",
        courses: existingCourses,
      });
    }

    // ==================================
    // 2. YOUTUBE SEARCH
    // ==================================

    const youtubeResults =
      await searchYouTubeCourses(
        query
      );

    if (youtubeResults.length === 0) {
      return NextResponse.json({
        source: "youtube",
        courses: [],
      });
    }

    // ==================================
    // 3. GET STATISTICS
    // ==================================

    const videoIds =
      youtubeResults.map(
        (video) => video.videoId
      );

    const statistics =
      await getYouTubeVideoStatistics(
        videoIds
      );

    const statisticsMap =
      new Map(
        statistics.map((item: any) => [
          item.id,
          item,
        ])
      );

    // ==================================
    // 4. CONVERT YOUTUBE RESULTS
    // ==================================

    const coursesToInsert =
      youtubeResults.map(
        (video) => {
          const stats =
            statisticsMap.get(
              video.videoId
            );

          const views = Number(
            stats?.statistics
              ?.viewCount || 0
          );

          const likes = Number(
            stats?.statistics
              ?.likeCount || 0
          );

          return {
            title: video.title,

            slug: createSlug(
              video.title,
              video.videoId
            ),

            description:
              video.description ||
              "YouTube course",

            category:
              query,

            level:
              "Beginner",

            courseType:
              "VIDEO" as const,

            language:
              "English",

            youtubeUrl:
              `https://www.youtube.com/watch?v=${video.videoId}`,

            youtubeId:
              video.videoId,

            channelName:
              video.channelName,

            thumbnailUrl:
              video.thumbnail,

            views,

            likes,

            duration:
              "Unknown",

            lessonsCount: 1,

            rating: "0",

            students: "0",

            source: "YouTube",

            recommendationScore:
              0,

            adminRecommended:
              false,

            featured:
              false,
          };
        }
      );

    // ==================================
    // 5. SAVE TO DATABASE
    // ==================================

    const insertedCourses =
      await db
        .insert(courses)
        .values(coursesToInsert)
        .returning();

    // ==================================
    // 6. RETURN RESULTS
    // ==================================

    return NextResponse.json({
      source: "youtube",
      courses: insertedCourses,
    });
  } catch (error) {
    console.error(
      "Course search error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to search courses",
      },
      { status: 500 }
    );
  }
}