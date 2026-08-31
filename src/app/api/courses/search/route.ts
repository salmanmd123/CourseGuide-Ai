import { NextResponse } from "next/server";
import {
    ilike,
    inArray,
    or,
} from "drizzle-orm";

import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import {
    searchYouTubeCourses,
    getYouTubeVideoStatistics,
    formatYouTubeDuration,
    getDurationSeconds,
} from "@/lib/youtube";


/* =========================================================
   CREATE SLUG
========================================================= */

function createSlug(
    title: string,
    videoId: string
): string {

    const slug =
        title
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .slice(0, 150);

    return `${slug}-${videoId}`;
}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    text: string
): string {

    return text
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


/* =========================================================
   CHECK DATABASE COURSE RELEVANCE
========================================================= */

function isRelevantDatabaseCourse(
    title: string,
    description: string,
    category: string,
    channelName: string | null,
    query: string
): boolean {

    const text =
        normalizeText(
            `${title} ${description} ${category} ${channelName ?? ""}`
        );

    const normalizedQuery =
        normalizeText(query);


    /* =====================================================
       C++
    ===================================================== */

    if (
        normalizedQuery === "c++" ||
        normalizedQuery === "cpp" ||
        normalizedQuery === "c ++" ||
        normalizedQuery === "c plus plus"
    ) {

        return (
            text.includes("c++") ||
            text.includes("c ++") ||
            text.includes("cpp") ||
            text.includes("c plus plus")
        );
    }


    /* =====================================================
       JAVASCRIPT
    ===================================================== */

    if (
        normalizedQuery === "javascript" ||
        normalizedQuery === "java script" ||
        normalizedQuery === "js"
    ) {

        return (
            text.includes("javascript") ||
            text.includes("java script") ||
            text.includes("ecmascript") ||
            /\bjs\b/i.test(text)
        );
    }


    /* =====================================================
       TYPESCRIPT
    ===================================================== */

    if (
        normalizedQuery === "typescript" ||
        normalizedQuery === "type script" ||
        normalizedQuery === "ts"
    ) {

        return (
            text.includes("typescript") ||
            text.includes("type script") ||
            /\bts\b/i.test(text)
        );
    }


    /* =====================================================
       JAVA
    ===================================================== */

    if (
        normalizedQuery === "java"
    ) {

        return (
            /\bjava\b/i.test(text) &&
            !text.includes("javascript")
        );
    }


    /* =====================================================
       PYTHON
    ===================================================== */

    if (
        normalizedQuery === "python" ||
        normalizedQuery === "py"
    ) {

        return text.includes("python");
    }


    /* =====================================================
       REACT
    ===================================================== */

    if (
        normalizedQuery === "react" ||
        normalizedQuery === "reactjs"
    ) {

        return (
            /\breact\b/i.test(text) ||
            /\breactjs\b/i.test(text)
        );
    }


    /* =====================================================
       NORMAL SEARCH
    ===================================================== */

    const queryWords =
        normalizedQuery
            .split(/\s+/)
            .filter(Boolean);


    if (
        queryWords.length === 0
    ) {

        return false;
    }


    return queryWords.every(
        (word) =>
            text.includes(word)
    );
}


/* =========================================================
   RECOMMENDATION SCORE
========================================================= */

function calculateRecommendationScore({
    title,
    description,
    views,
    likes,
    durationSeconds,
    query,
}: {
    title: string;
    description: string;
    views: number;
    likes: number;
    durationSeconds: number;
    query: string;
}): number {

    const text =
        normalizeText(
            `${title} ${description}`
        );

    const searchQuery =
        normalizeText(query);

    let score = 0;


    /* =====================================================
       1. SEARCH RELEVANCE
       MAX 30
    ===================================================== */

    let matchedWords = 0;


    if (
        searchQuery === "c++" ||
        searchQuery === "cpp" ||
        searchQuery === "c ++" ||
        searchQuery === "c plus plus"
    ) {

        if (
            text.includes("c++") ||
            text.includes("c ++") ||
            text.includes("cpp") ||
            text.includes("c plus plus")
        ) {

            score += 30;
        }

    } else {

        const queryWords =
            searchQuery
                .split(/\s+/)
                .filter(Boolean);


        for (
            const word
            of queryWords
        ) {

            if (
                text.includes(word)
            ) {

                matchedWords++;
            }
        }


        if (
            queryWords.length > 0
        ) {

            score +=
                (
                    matchedWords /
                    queryWords.length
                ) * 30;
        }
    }


    /* =====================================================
       2. VIEWS
       MAX 20
    ===================================================== */

    if (
        views >= 10_000_000
    ) {

        score += 20;

    } else if (
        views >= 5_000_000
    ) {

        score += 18;

    } else if (
        views >= 1_000_000
    ) {

        score += 16;

    } else if (
        views >= 500_000
    ) {

        score += 13;

    } else if (
        views >= 100_000
    ) {

        score += 10;

    } else if (
        views >= 10_000
    ) {

        score += 6;

    } else {

        score += 2;
    }


    /* =====================================================
       3. LIKE ENGAGEMENT
       MAX 15
    ===================================================== */

    const likeRatio =
        views > 0
            ? likes / views
            : 0;


    if (
        likeRatio >= 0.08
    ) {

        score += 15;

    } else if (
        likeRatio >= 0.05
    ) {

        score += 13;

    } else if (
        likeRatio >= 0.03
    ) {

        score += 10;

    } else if (
        likeRatio >= 0.01
    ) {

        score += 7;

    } else {

        score += 3;
    }


    /* =====================================================
       4. COURSE SIGNAL
       MAX 25
    ===================================================== */

    const courseKeywords = [

        "full course",
        "complete course",
        "full tutorial",
        "complete tutorial",
        "course for beginners",
        "beginner course",
        "from basics",
        "from scratch",
        "zero to hero",
        "tutorial",
        "masterclass",
        "bootcamp",

    ];


    const matchedCourseKeyword =
        courseKeywords.some(
            (keyword) =>
                text.includes(keyword)
        );


    if (
        matchedCourseKeyword
    ) {

        score += 25;

    } else {

        score += 5;
    }


    /* =====================================================
       5. DURATION
       MAX 10
    ===================================================== */

    if (
        durationSeconds >=
        8 * 60 * 60
    ) {

        score += 10;

    } else if (
        durationSeconds >=
        4 * 60 * 60
    ) {

        score += 9;

    } else if (
        durationSeconds >=
        2 * 60 * 60
    ) {

        score += 8;

    } else if (
        durationSeconds >=
        60 * 60
    ) {

        score += 6;

    } else if (
        durationSeconds >=
        30 * 60
    ) {

        score += 4;

    } else {

        score += 1;
    }


    return Math.round(
        Math.min(
            100,
            score
        )
    );
}


/* =========================================================
   GET SEARCH QUERY
========================================================= */

function getSearchQuery(
    request: Request
): string {

    const url =
        new URL(request.url);


    const rawQuery =
        url.searchParams.get("q");


    if (!rawQuery) {
        return "";
    }


    const trimmed =
        rawQuery.trim();


    /*
     * Compatibility with the current frontend.
     *
     * A manually written:
     *
     * ?q=C++
     *
     * may arrive as "C".
     */

    if (
        trimmed.toLowerCase() === "c"
    ) {

        return "C++";
    }


    return trimmed;
}


/* =========================================================
   SEARCH API
========================================================= */

export async function GET(
    request: Request
) {

    try {

        const query =
            getSearchQuery(
                request
            );


        console.log(
            "Searching courses for:",
            query
        );


        if (!query) {

            return NextResponse.json(
                {
                    error:
                        "Search query is required",
                },
                {
                    status: 400,
                }
            );
        }


        /* =================================================
           1. DATABASE FIRST
        ================================================= */

        const existingCourses =
            await db
                .select()
                .from(courses)
                .where(
                    or(

                        ilike(
                            courses.title,
                            `%${query}%`
                        ),

                        ilike(
                            courses.description,
                            `%${query}%`
                        ),

                        ilike(
                            courses.category,
                            `%${query}%`
                        ),

                        ilike(
                            courses.channelName,
                            `%${query}%`
                        ),

                    )
                );


        console.log(
            "Database courses found:",
            existingCourses.length
        );


        /* =================================================
           FILTER DATABASE RESULTS
        ================================================= */

        const relevantDatabaseCourses =
            existingCourses.filter(
                (course) =>
                    isRelevantDatabaseCourse(
                        course.title,
                        course.description,
                        course.category,
                        course.channelName,
                        query
                    )
            );


        console.log(
            "Relevant database courses:",
            relevantDatabaseCourses.length
        );


        /* =================================================
           RETURN CACHED DATABASE RESULTS
        ================================================= */

        if (
            relevantDatabaseCourses.length >
            0
        ) {

            relevantDatabaseCourses.sort(
                (a, b) =>
                    b.recommendationScore -
                    a.recommendationScore
            );


            return NextResponse.json({

                source:
                    "database",

                courses:
                    relevantDatabaseCourses,

            });
        }


        console.log(
            "No relevant database courses. Searching YouTube..."
        );


        /* =================================================
           2. YOUTUBE SEARCH
        ================================================= */

        const youtubeResults =
            await searchYouTubeCourses(
                query
            );


        console.log(
            "YouTube relevant results:",
            youtubeResults.length
        );


        if (
            youtubeResults.length ===
            0
        ) {

            return NextResponse.json({

                source:
                    "youtube",

                courses: [],

            });
        }


        /* =================================================
           3. GET YOUTUBE STATISTICS
        ================================================= */

        const videoIds =
            youtubeResults.map(
                (video) =>
                    video.videoId
            );


        const statistics =
            await getYouTubeVideoStatistics(
                videoIds
            );


        const statisticsMap =
            new Map(
                statistics.map(
                    (item) => [
                        item.id,
                        item,
                    ]
                )
            );


        /* =================================================
           4. BUILD SCORED COURSES
        ================================================= */

        const scoredCourses =
            youtubeResults.map(
                (video) => {

                    const stats =
                        statisticsMap.get(
                            video.videoId
                        );


                    const views =
                        Number(
                            stats
                                ?.statistics
                                ?.viewCount ||
                            0
                        );


                    const likes =
                        Number(
                            stats
                                ?.statistics
                                ?.likeCount ||
                            0
                        );


                    const durationISO =
                        stats
                            ?.contentDetails
                            ?.duration ||
                        "";


                    const durationSeconds =
                        getDurationSeconds(
                            durationISO
                        );


                    const duration =
                        formatYouTubeDuration(
                            durationISO
                        );


                    const recommendationScore =
                        calculateRecommendationScore(
                            {
                                title:
                                    video.title,

                                description:
                                    video.description,

                                views,

                                likes,

                                durationSeconds,

                                query,
                            }
                        );


                    return {

                        title:
                            video.title,

                        slug:
                            createSlug(
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

                        duration,

                        lessonsCount:
                            1,

                        rating:
                            "0",

                        students:
                            "0",

                        source:
                            "YouTube",

                        recommendationScore,

                        adminRecommended:
                            false,

                        featured:
                            false,

                    };
                }
            );


        /* =================================================
           5. SORT BY RECOMMENDATION SCORE
        ================================================= */

        scoredCourses.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );


        /* =================================================
           6. TOP 10
        ================================================= */

        const topCourses =
            scoredCourses.slice(
                0,
                10
            );


        /* =================================================
           7. CHECK WHICH VIDEOS
              ALREADY EXIST
        ================================================= */

        const existingYouTubeCourses =
            await db
                .select()
                .from(courses)
                .where(
                    inArray(
                        courses.youtubeId,
                        topCourses.map(
                            (course) =>
                                course.youtubeId
                        )
                    )
                );


        console.log(
            "Existing YouTube courses:",
            existingYouTubeCourses.length
        );


        const existingYouTubeIds =
            new Set(
                existingYouTubeCourses
                    .map(
                        (course) =>
                            course.youtubeId
                    )
                    .filter(
                        (
                            id
                        ): id is string =>
                            Boolean(id)
                    )
            );


        const newCourses =
            topCourses.filter(
                (course) =>
                    !existingYouTubeIds.has(
                        course.youtubeId
                    )
            );


        console.log(
            "New YouTube courses:",
            newCourses.length
        );


        /* =========================================================
   8. INSERT COURSES + CREATE LESSONS
========================================================= */

        if (newCourses.length > 0) {

            for (const course of newCourses) {

                try {

                    /* =========================
                       INSERT COURSE
                    ========================= */

                    const [insertedCourse] =
                        await db
                            .insert(courses)
                            .values(course)
                            .onConflictDoNothing({
                                target: courses.youtubeId,
                            })
                            .returning();

                    /* =========================
                       COURSE WAS INSERTED
                    ========================= */

                    if (insertedCourse) {

                        await db
                            .insert(lessons)
                            .values({
                                courseId:
                                    insertedCourse.id,

                                title:
                                    insertedCourse.title,

                                description:
                                    insertedCourse.description,

                                /* IMPORTANT:
                                   LessonVideo passes this
                                   value to YouTubePlayer
                                */

                                videoUrl:
                                    insertedCourse.youtubeId!,

                                duration:
                                    insertedCourse.duration,

                                order:
                                    1,
                            });

                        console.log(
                            `[LESSON CREATED] ${insertedCourse.title}`
                        );

                    }

                } catch (error) {

                    console.error(
                        `[COURSE INSERT ERROR] ${course.title}`,
                        error
                    );

                }
            }

            console.log(
                "New courses processed:",
                newCourses.length
            );
        }


        /* =================================================
           9. FETCH FINAL RESULTS
        ================================================= */

        /*
         * Fetch the top YouTube IDs again.
         *
         * This ensures we return both:
         *
         * - already cached courses
         * - newly inserted courses
         */

        const finalCourses =
            await db
                .select()
                .from(courses)
                .where(
                    inArray(
                        courses.youtubeId,
                        topCourses.map(
                            (course) =>
                                course.youtubeId
                        )
                    )
                );


        /* =================================================
           10. SORT FINAL RESULTS
        ================================================= */

        finalCourses.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );


        /* =================================================
           11. RETURN TOP 10
        ================================================= */

        return NextResponse.json({

            source:
                "youtube",

            courses:
                finalCourses.slice(
                    0,
                    10
                ),

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
            {
                status: 500,
            }
        );
    }
}