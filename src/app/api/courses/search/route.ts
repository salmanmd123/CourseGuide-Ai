import { NextResponse } from "next/server";

import {
    and,
    ilike,
    inArray,
    or,
} from "drizzle-orm";

import { db } from "@/db";

import {
    courses,
    lessons,
} from "@/db/schema";

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
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   NORMALIZE QUERY
========================================================= */

function normalizeCourseQuery(
    query: string
): string {

    const normalized =
        normalizeText(query);

    /* C++ aliases */

    if (
        normalized === "cpp" ||
        normalized === "c ++" ||
        normalized === "c plus plus"
    ) {
        return "c++";
    }

    /* JavaScript aliases */

    if (
        normalized === "java script" ||
        normalized === "js"
    ) {
        return "javascript";
    }

    /* TypeScript aliases */

    if (
        normalized === "type script" ||
        normalized === "ts"
    ) {
        return "typescript";
    }

    /* React aliases */

    if (
        normalized === "reactjs"
    ) {
        return "react";
    }

    /* Node aliases */

    if (
        normalized === "nodejs" ||
        normalized === "node.js"
    ) {
        return "node";
    }

    /* MongoDB aliases */

    if (
        normalized === "mongo db"
    ) {
        return "mongodb";
    }

    return normalized;
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

    const normalizedQuery =
        normalizeCourseQuery(query);

    const normalizedTitle =
        normalizeText(title);

    const normalizedCategory =
        normalizeText(category);


    /*
     * IMPORTANT:
     *
     * Description and channel name are deliberately
     * NOT used for deciding the actual subject.
     *
     * Example:
     *
     * SQL Full Course
     * Description: Learn SQL with Python...
     *
     * Searching Python should NOT return SQL.
     */


    /* =====================================================
       C++
    ===================================================== */

    if (
        normalizedQuery === "c++"
    ) {

        return (
            normalizedTitle.includes("c++") ||
            normalizedTitle.includes("cpp") ||
            normalizedCategory.includes("c++") ||
            normalizedCategory.includes("cpp")
        );
    }


    /* =====================================================
       JAVASCRIPT
    ===================================================== */

    if (
        normalizedQuery === "javascript"
    ) {

        return (
            /\bjavascript\b/i.test(
                normalizedTitle
            ) ||

            /\bjava script\b/i.test(
                normalizedTitle
            ) ||

            /\becmascript\b/i.test(
                normalizedTitle
            ) ||

            /\bjs\b/i.test(
                normalizedTitle
            ) ||

            normalizedCategory.includes(
                "javascript"
            )
        );
    }


    /* =====================================================
       TYPESCRIPT
    ===================================================== */

    if (
        normalizedQuery === "typescript"
    ) {

        return (
            /\btypescript\b/i.test(
                normalizedTitle
            ) ||

            /\btype script\b/i.test(
                normalizedTitle
            ) ||

            /\bts\b/i.test(
                normalizedTitle
            ) ||

            normalizedCategory.includes(
                "typescript"
            )
        );
    }


    /* =====================================================
       JAVA
    ===================================================== */

    if (
        normalizedQuery === "java"
    ) {

        return (
            /\bjava\b/i.test(
                normalizedTitle
            ) &&

            !/\bjavascript\b/i.test(
                normalizedTitle
            )
        );
    }


    /* =====================================================
       PYTHON
    ===================================================== */

    if (
        normalizedQuery === "python"
    ) {

        return (
            /\bpython\b/i.test(
                normalizedTitle
            ) ||

            normalizedCategory ===
                "python" ||

            normalizedCategory.includes(
                "python"
            )
        );
    }


    /* =====================================================
       REACT
    ===================================================== */

    if (
        normalizedQuery === "react"
    ) {

        return (
            /\breact\b/i.test(
                normalizedTitle
            ) ||

            /\breactjs\b/i.test(
                normalizedTitle
            ) ||

            normalizedCategory.includes(
                "react"
            )
        );
    }


    /* =====================================================
       SQL
    ===================================================== */

    if (
        normalizedQuery === "sql"
    ) {

        return (
            /\bsql\b/i.test(
                normalizedTitle
            ) ||

            /\bsql\b/i.test(
                normalizedCategory
            )
        );
    }


    /* =====================================================
       HTML
    ===================================================== */

    if (
        normalizedQuery === "html"
    ) {

        return (
            /\bhtml\b/i.test(
                normalizedTitle
            ) ||

            /\bhtml5\b/i.test(
                normalizedTitle
            ) ||

            /\bhtml\b/i.test(
                normalizedCategory
            )
        );
    }


    /* =====================================================
       CSS
    ===================================================== */

    if (
        normalizedQuery === "css"
    ) {

        return (
            /\bcss\b/i.test(
                normalizedTitle
            ) ||

            /\bcss3\b/i.test(
                normalizedTitle
            ) ||

            /\bcss\b/i.test(
                normalizedCategory
            )
        );
    }


    /* =====================================================
       NODE.JS
    ===================================================== */

    if (
        normalizedQuery === "node"
    ) {

        return (
            /\bnode\.?js\b/i.test(
                normalizedTitle
            ) ||

            /\bnode js\b/i.test(
                normalizedTitle
            ) ||

            normalizedCategory.includes(
                "node"
            )
        );
    }


    /* =====================================================
       MONGODB
    ===================================================== */

    if (
        normalizedQuery === "mongodb"
    ) {

        return (
            /\bmongodb\b/i.test(
                normalizedTitle
            ) ||

            /\bmongo db\b/i.test(
                normalizedTitle
            ) ||

            normalizedCategory.includes(
                "mongodb"
            ) ||

            normalizedCategory.includes(
                "mongo"
            )
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


    /*
     * EVERY word must appear in:
     *
     * TITLE OR CATEGORY
     *
     * Never description/channel.
     */

    return queryWords.every(
        (word) =>
            normalizedTitle.includes(word) ||
            normalizedCategory.includes(word)
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
        normalizeCourseQuery(query);

    let score = 0;


    /* =====================================================
       1. SEARCH RELEVANCE
       MAX 30
    ===================================================== */

    let matchedWords = 0;


    if (
        searchQuery === "c++"
    ) {

        if (
            text.includes("c++") ||
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
     * URLSearchParams issue:
     *
     * ?q=C++
     *
     * may arrive as:
     *
     * C
     */

    if (
        trimmed.toLowerCase() === "c"
    ) {
        return "C++";
    }


    return trimmed;
}


/* =========================================================
   NORMALIZE LANGUAGE
========================================================= */

function normalizeLanguage(
    language: string | null
): string {

    const value =
        normalizeText(
            language || "English"
        );


    if (
        value === "hindi"
    ) {
        return "Hindi";
    }


    if (
        value === "hinglish"
    ) {
        return "Hinglish";
    }


    return "English";
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


        const url =
            new URL(
                request.url
            );


        const preferredLanguage =
            normalizeLanguage(
                url.searchParams.get(
                    "language"
                )
            );


        console.log(
            "================================"
        );

        console.log(
            "Searching courses for:",
            query
        );

        console.log(
            "Preferred language:",
            preferredLanguage
        );

        console.log(
            "================================"
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


        /* =====================================================
           1. DATABASE SEARCH
        ===================================================== */

        /*
         * Search title/category only.
         *
         * This prevents:
         *
         * SQL + description mentions Python
         *
         * from appearing in Python search.
         */

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
                            courses.category,
                            `%${query}%`
                        )

                    )
                );


        console.log(
            "Database courses found:",
            existingCourses.length
        );


        /* =====================================================
           2. STRICT SUBJECT FILTER
        ===================================================== */

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
            "Strictly relevant database courses:",
            relevantDatabaseCourses.length
        );


        console.log(
            "Relevant database titles:",
            relevantDatabaseCourses.map(
                (course) =>
                    course.title
            )
        );


        /* =====================================================
           3. LANGUAGE HARD FILTER
        ===================================================== */

        const preferred =
            preferredLanguage
                .toLowerCase()
                .trim();


        const languageFilteredCourses =
            relevantDatabaseCourses.filter(
                (course) => {

                    const courseLanguage =
                        normalizeLanguage(
                            course.language
                        )
                            .toLowerCase()
                            .trim();


                    return (
                        courseLanguage ===
                        preferred
                    );
                }
            );


        console.log(
            "Database courses after language filter:",
            languageFilteredCourses.length
        );


        /* =====================================================
           4. RETURN DATABASE RESULTS
        ===================================================== */

        if (
            languageFilteredCourses.length >
            0
        ) {

            languageFilteredCourses.sort(
                (a, b) =>
                    (
                        b.recommendationScore ??
                        0
                    ) -
                    (
                        a.recommendationScore ??
                        0
                    )
            );


            return NextResponse.json({

                source:
                    "database",

                courses:
                    languageFilteredCourses,

            });
        }


        console.log(
            "No matching database courses in preferred language."
        );


        console.log(
            "Searching YouTube..."
        );


        /* =====================================================
           5. YOUTUBE SEARCH
        ===================================================== */

        const youtubeResults =
            await searchYouTubeCourses(
                query,
                preferredLanguage
            );


        console.log(
            "YouTube relevant results:",
            youtubeResults.length
        );


        if (
            youtubeResults.length === 0
        ) {

            return NextResponse.json({

                source:
                    "youtube",

                courses: [],

            });
        }


        /* =====================================================
           6. YOUTUBE LANGUAGE HARD FILTER
        ===================================================== */

        const languageMatchedResults =
            youtubeResults.filter(
                (video) => {

                    const videoLanguage =
                        normalizeLanguage(
                            video.language
                        )
                            .toLowerCase()
                            .trim();


                    const matches =
                        videoLanguage ===
                        preferred;


                    if (!matches) {

                        console.log(
                            "[REMOVE - LANGUAGE]",
                            video.title,
                            "->",
                            video.language
                        );
                    }


                    return matches;
                }
            );


        console.log(
            "YouTube courses after language filter:",
            languageMatchedResults.length
        );


        if (
            languageMatchedResults.length === 0
        ) {

            return NextResponse.json({

                source:
                    "youtube",

                courses: [],

            });
        }


        /* =====================================================
           7. GET YOUTUBE STATISTICS
        ===================================================== */

        const videoIds =
            languageMatchedResults.map(
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


        /* =====================================================
           8. BUILD SCORED COURSES
        ===================================================== */

        const scoredCourses =
            languageMatchedResults.map(
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


                    let recommendationScore =
                        calculateRecommendationScore({

                            title:
                                video.title,

                            description:
                                video.description,

                            views,

                            likes,

                            durationSeconds,

                            query,

                        });


                    /*
                     * Language is already a hard filter.
                     *
                     * Keep a small boost for consistency,
                     * but all courses here already match.
                     */

                    recommendationScore +=
                        15;


                    recommendationScore =
                        Math.min(
                            100,
                            recommendationScore
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

                        /*
                         * IMPORTANT:
                         *
                         * Save actual detected language.
                         */

                        language:
                            video.language,

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


        /* =====================================================
           9. SORT
        ===================================================== */

        scoredCourses.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );


        /* =====================================================
           10. TOP 10
        ===================================================== */

        const topCourses =
            scoredCourses.slice(
                0,
                10
            );


        /* =====================================================
           11. CHECK EXISTING YOUTUBE COURSES
        ===================================================== */

        const existingYouTubeCourses =
            await db
                .select()
                .from(courses)
                .where(
                    and(

                        inArray(
                            courses.youtubeId,
                            topCourses.map(
                                (course) =>
                                    course.youtubeId
                            )
                        ),

                        ilike(
                            courses.language,
                            preferredLanguage
                        )

                    )
                );


        console.log(
            "Existing YouTube courses in preferred language:",
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


        /* =====================================================
           12. INSERT COURSES + LESSONS
        ===================================================== */

        if (
            newCourses.length > 0
        ) {

            for (
                const course
                of newCourses
            ) {

                try {

                    const [insertedCourse] =
                        await db
                            .insert(courses)
                            .values(course)
                            .onConflictDoNothing({
                                target:
                                    courses.youtubeId,
                            })
                            .returning();


                    if (
                        insertedCourse
                    ) {

                        await db
                            .insert(lessons)
                            .values({

                                courseId:
                                    insertedCourse.id,

                                title:
                                    insertedCourse.title,

                                description:
                                    insertedCourse.description,

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


                } catch (
                    error
                ) {

                    console.error(
                        `[COURSE INSERT ERROR] ${course.title}`,
                        error
                    );
                }
            }
        }


        /* =====================================================
           13. FINAL FETCH
        ===================================================== */

        const finalCourses =
            await db
                .select()
                .from(courses)
                .where(
                    and(

                        inArray(
                            courses.youtubeId,
                            topCourses.map(
                                (course) =>
                                    course.youtubeId
                            )
                        ),

                        ilike(
                            courses.language,
                            preferredLanguage
                        )

                    )
                );


        /* =====================================================
           14. FINAL RELEVANCE FILTER
        ===================================================== */

        const finalRelevantCourses =
            finalCourses.filter(
                (course) =>
                    isRelevantDatabaseCourse(
                        course.title,
                        course.description,
                        course.category,
                        course.channelName,
                        query
                    )
            );


        /* =====================================================
           15. FINAL SORT
        ===================================================== */

        finalRelevantCourses.sort(
            (a, b) =>
                (
                    b.recommendationScore ??
                    0
                ) -
                (
                    a.recommendationScore ??
                    0
                )
        );


        console.log(
            "Final courses:",
            finalRelevantCourses.length
        );


        /* =====================================================
           16. RETURN
        ===================================================== */

        return NextResponse.json({

            source:
                "youtube",

            courses:
                finalRelevantCourses.slice(
                    0,
                    10
                ),

        });

    } catch (
        error
    ) {

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