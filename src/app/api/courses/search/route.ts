import { NextResponse } from "next/server";

import {
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
    formatYouTubeDuration,
    normalizeLanguage as normalizeYouTubeLanguage,
} from "@/lib/youtube";


/* =========================================================
   CREATE SLUG
========================================================= */

function createSlug(
    title: string,
    id: string
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
            .slice(
                0,
                150
            );

    return `${slug}-${id}`;
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
   NORMALIZE QUERY
========================================================= */

function normalizeCourseQuery(
    query: string
): string {

    const normalized =
        normalizeText(query);

    if (
        normalized === "cpp" ||
        normalized === "c ++" ||
        normalized === "c plus plus"
    ) {
        return "c++";
    }

    if (
        normalized ===
            "java script" ||
        normalized === "js"
    ) {
        return "javascript";
    }

    if (
        normalized ===
            "type script" ||
        normalized === "ts"
    ) {
        return "typescript";
    }

    if (
        normalized ===
            "reactjs"
    ) {
        return "react";
    }

    if (
        normalized ===
            "nodejs" ||
        normalized ===
            "node.js"
    ) {
        return "node";
    }

    if (
        normalized ===
            "mongo db"
    ) {
        return "mongodb";
    }

    return normalized;
}


/* =========================================================
   DATABASE COURSE RELEVANCE
========================================================= */

function isRelevantDatabaseCourse(
    title: string,
    description: string,
    category: string,
    channelName: string | null,
    query: string
): boolean {

    /*
     * Keep the same intentional behavior:
     *
     * Subject relevance is based mainly on
     * title/category rather than arbitrary
     * description mentions.
     */

    void description;

    void channelName;

    const normalizedQuery =
        normalizeCourseQuery(
            query
        );

    const normalizedTitle =
        normalizeText(
            title
        );

    const normalizedCategory =
        normalizeText(
            category
        );


    /* C++ */

    if (
        normalizedQuery ===
        "c++"
    ) {
        return (
            normalizedTitle.includes(
                "c++"
            ) ||
            normalizedTitle.includes(
                "cpp"
            ) ||
            normalizedCategory.includes(
                "c++"
            ) ||
            normalizedCategory.includes(
                "cpp"
            )
        );
    }


    /* JAVASCRIPT */

    if (
        normalizedQuery ===
        "javascript"
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


    /* TYPESCRIPT */

    if (
        normalizedQuery ===
        "typescript"
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


    /* JAVA */

    if (
        normalizedQuery ===
        "java"
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


    /* PYTHON */

    if (
        normalizedQuery ===
        "python"
    ) {
        return (
            /\bpython\b/i.test(
                normalizedTitle
            ) ||
            normalizedCategory.includes(
                "python"
            )
        );
    }


    /* REACT */

    if (
        normalizedQuery ===
        "react"
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


    /* SQL */

    if (
        normalizedQuery ===
        "sql"
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


    /* HTML */

    if (
        normalizedQuery ===
        "html"
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


    /* CSS */

    if (
        normalizedQuery ===
        "css"
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


    /* NODE */

    if (
        normalizedQuery ===
        "node"
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


    /* MONGODB */

    if (
        normalizedQuery ===
        "mongodb"
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


    /* NORMAL */

    const queryWords =
        normalizedQuery
            .split(
                /\s+/
            )
            .filter(Boolean);

    if (
        queryWords.length === 0
    ) {
        return false;
    }

    return queryWords.every(
        (word) =>
            normalizedTitle.includes(
                word
            ) ||
            normalizedCategory.includes(
                word
            )
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
    lessonCount,
    courseType,
}: {
    title: string;
    description: string;
    views: number;
    likes: number;
    durationSeconds: number;
    query: string;
    lessonCount: number;
    courseType:
        | "VIDEO"
        | "PLAYLIST";
}): number {

    const text =
        normalizeText(
            `${title} ${description}`
        );

    const searchQuery =
        normalizeCourseQuery(
            query
        );

    let score = 0;


    /* =====================================================
       SEARCH RELEVANCE
       MAX 30
    ===================================================== */

    if (
        searchQuery === "c++"
    ) {

        if (
            text.includes("c++") ||
            text.includes("cpp") ||
            text.includes(
                "c plus plus"
            )
        ) {
            score += 30;
        }

    } else {

        const queryWords =
            searchQuery
                .split(/\s+/)
                .filter(Boolean);

        let matchedWords = 0;

        for (
            const word of
            queryWords
        ) {
            if (
                text.includes(
                    word
                )
            ) {
                matchedWords++;
            }
        }

        if (
            queryWords.length >
            0
        ) {
            score +=
                (
                    matchedWords /
                    queryWords.length
                ) *
                30;
        }
    }


    /* =====================================================
       VIEWS
       MAX 20
    ===================================================== */

    if (
        views >=
        10_000_000
    ) {
        score += 20;

    } else if (
        views >=
        5_000_000
    ) {
        score += 18;

    } else if (
        views >=
        1_000_000
    ) {
        score += 16;

    } else if (
        views >=
        500_000
    ) {
        score += 13;

    } else if (
        views >=
        100_000
    ) {
        score += 10;

    } else if (
        views >=
        10_000
    ) {
        score += 6;

    } else {
        score += 2;
    }


    /* =====================================================
       LIKE ENGAGEMENT
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
       COURSE SIGNAL
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

    if (
        courseKeywords.some(
            (keyword) =>
                text.includes(
                    keyword
                )
        )
    ) {
        score += 25;

    } else {
        score += 5;
    }


    /* =====================================================
       DURATION
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


    /* =====================================================
       PLAYLIST BONUS
    ===================================================== */

    if (
        courseType ===
        "PLAYLIST"
    ) {

        if (
            lessonCount >=
            30
        ) {
            score += 10;

        } else if (
            lessonCount >=
            15
        ) {
            score += 8;

        } else if (
            lessonCount >=
            8
        ) {
            score += 6;

        } else if (
            lessonCount >=
            4
        ) {
            score += 3;
        }
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
        new URL(
            request.url
        );

    const rawQuery =
        url.searchParams.get(
            "q"
        );

    if (
        !rawQuery
    ) {
        return "";
    }

    const trimmed =
        rawQuery.trim();

    /*
     * C++ compatibility.
     */

    if (
        trimmed.toLowerCase() ===
        "c"
    ) {
        return "C++";
    }

    return trimmed;
}


/* =========================================================
   NORMALIZE LANGUAGE
========================================================= */

function normalizeLanguage(
    language:
        | string
        | null
): string {

    const normalized =
        normalizeYouTubeLanguage(
            language ||
                "English"
        );

    if (
        normalized ===
        "hindi"
    ) {
        return "Hindi";
    }

    if (
        normalized ===
        "english"
    ) {
        return "English";
    }

    if (
        normalized ===
        "hinglish"
    ) {
        return "Hinglish";
    }

    return (
        language ||
        "English"
    );
}


/* =========================================================
   GET SEARCH API
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

        const normalizedPreferredLanguage =
            normalizeText(
                preferredLanguage
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


        if (
            !query
        ) {

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
                            courses.category,
                            `%${query}%`
                        )
                    )
                );


        console.log(
            "Database courses found:",
            existingCourses.length
        );


        /* =================================================
           2. STRICT SUBJECT FILTER
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


        /* =================================================
           3. LANGUAGE HARD FILTER
        ================================================= */

        const languageFilteredCourses =
            relevantDatabaseCourses.filter(
                (course) => {

                    const courseLanguage =
                        normalizeText(
                            course.language ||
                                "English"
                        );

                    return (
                        courseLanguage ===
                        normalizedPreferredLanguage
                    );
                }
            );


        console.log(
            "Database courses after language filter:",
            languageFilteredCourses.length
        );


        /* =================================================
           RETURN DATABASE COURSES
        ================================================= */

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


        /* =================================================
           4. YOUTUBE SEARCH
        ================================================= */

        const youtubeResults =
            await searchYouTubeCourses(
                query,
                preferredLanguage
            );


        console.log(
            "YouTube results:",
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
           5. LANGUAGE HARD FILTER
        ================================================= */

        const languageMatchedResults =
            youtubeResults.filter(
                (video) => {

                    const videoLanguage =
                        normalizeYouTubeLanguage(
                            video.language
                        );

                    const matches =
                        videoLanguage ===
                        normalizedPreferredLanguage;


                    if (
                        !matches
                    ) {
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


        if (
            languageMatchedResults.length ===
            0
        ) {

            return NextResponse.json({
                source:
                    "youtube",

                courses: [],
            });
        }


        /* =================================================
           6. SCORE VIDEO + PLAYLIST RESULTS
        ================================================= */

        const scoredCourses =
            languageMatchedResults.map(
                (video) => {

                    const views =
                        video.views ||
                        0;

                    const likes =
                        video.likes ||
                        0;

                    const durationSeconds =
                        video.durationSeconds ||
                        0;

                    const lessonCount =
                        video.courseType ===
                        "PLAYLIST"
                            ? (
                                video.lessons
                                    ?.length ||
                                0
                            )
                            : 1;


                    let recommendationScore =
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

                                lessonCount,

                                courseType:
                                    video.courseType,
                            }
                        );


                    /*
                     * Every result already passed
                     * the language hard filter.
                     */

                    recommendationScore +=
                        15;

                    recommendationScore =
                        Math.min(
                            100,
                            recommendationScore
                        );


                    return {
                        video,

                        recommendationScore,
                    };
                }
            );


        /* =================================================
           7. SORT
        ================================================= */

        scoredCourses.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );


        /* =================================================
           8. TOP 10
        ================================================= */

        const topCourses =
            scoredCourses.slice(
                0,
                10
            );


        /* =================================================
           9. EXISTING VIDEO COURSES
        ================================================= */

        const videoIds =
            topCourses
                .filter(
                    (item) =>
                        item.video
                            .courseType ===
                        "VIDEO"
                )
                .map(
                    (item) =>
                        item.video
                            .videoId
                )
                .filter(Boolean);


        /* =================================================
           10. EXISTING PLAYLIST COURSES
        ================================================= */

        const playlistIds =
            topCourses
                .filter(
                    (item) =>
                        item.video
                            .courseType ===
                        "PLAYLIST"
                )
                .map(
                    (item) =>
                        item.video
                            .playlistId
                )
                .filter(
                    (
                        id
                    ): id is string =>
                        Boolean(id)
                );


        const existingVideoCourses =
            videoIds.length > 0
                ? await db
                    .select()
                    .from(courses)
                    .where(
                        inArray(
                            courses.youtubeId,
                            videoIds
                        )
                    )
                : [];


        const existingPlaylistCourses =
            playlistIds.length > 0
                ? await db
                    .select()
                    .from(courses)
                    .where(
                        inArray(
                            courses.youtubePlaylistId,
                            playlistIds
                        )
                    )
                : [];


        const existingVideoIds =
            new Set(
                existingVideoCourses
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


        const existingPlaylistIds =
            new Set(
                existingPlaylistCourses
                    .map(
                        (course) =>
                            course.youtubePlaylistId
                    )
                    .filter(
                        (
                            id
                        ): id is string =>
                            Boolean(id)
                    )
            );


        /* =================================================
           11. INSERT NEW COURSES
        ================================================= */

        for (
            const item of
            topCourses
        ) {

            const video =
                item.video;


            /* =================================================
               PLAYLIST
            ================================================= */

            if (
                video.courseType ===
                "PLAYLIST"
            ) {

                const playlistId =
                    video.playlistId;


                if (
                    !playlistId ||
                    !video.lessons ||
                    video.lessons.length ===
                        0
                ) {
                    continue;
                }


                if (
                    existingPlaylistIds.has(
                        playlistId
                    )
                ) {
                    continue;
                }


                try {

                    const totalDurationSeconds =
                        video.lessons.reduce(
                            (
                                total,
                                lesson
                            ) =>
                                total +
                                lesson.durationSeconds,
                            0
                        );


                    const totalDurationISO =
                        `PT${Math.floor(
                            totalDurationSeconds /
                                3600
                        )}H${Math.floor(
                            (
                                totalDurationSeconds %
                                3600
                            ) /
                                60
                        )}M${totalDurationSeconds % 60
                        }S`;


                    const duration =
                        video.duration ||
                        formatYouTubeDuration(
                            totalDurationISO
                        );


                    const [insertedCourse] =
                        await db
                            .insert(
                                courses
                            )
                            .values({

                                title:
                                    video.title,

                                slug:
                                    createSlug(
                                        video.title,
                                        playlistId
                                    ),

                                description:
                                    video.description ||
                                    "YouTube course playlist",

                                category:
                                    query,

                                level:
                                    "Beginner",

                                courseType:
                                    "PLAYLIST",

                                language:
                                    video.language,

                                youtubeUrl:
                                    `https://www.youtube.com/playlist?list=${playlistId}`,

                                youtubeId:
                                    null,

                                youtubePlaylistId:
                                    playlistId,

                                channelName:
                                    video.channelName,

                                thumbnailUrl:
                                    video.thumbnail,

                                views:
                                    video.views ||
                                    0,

                                likes:
                                    video.likes ||
                                    0,

                                duration,

                                lessonsCount:
                                    video.lessons
                                        .length,

                                rating:
                                    "0",

                                students:
                                    "0",

                                source:
                                    "YouTube",

                                recommendationScore:
                                    item.recommendationScore,

                                adminRecommended:
                                    false,

                                featured:
                                    false,
                            })
                            .onConflictDoNothing(
                                {
                                    target:
                                        courses.youtubePlaylistId,
                                }
                            )
                            .returning();


                    if (
                        insertedCourse
                    ) {

                        for (
                            let index = 0;
                            index <
                            video.lessons.length;
                            index++
                        ) {

                            const lesson =
                                video.lessons[
                                    index
                                ];


                            await db
                                .insert(
                                    lessons
                                )
                                .values({

                                    courseId:
                                        insertedCourse.id,

                                    title:
                                        lesson.title,

                                    description:
                                        lesson.description,

                                    videoUrl:
                                        lesson.videoId,

                                    duration:
                                        lesson.duration,

                                    order:
                                        index + 1,
                                });
                        }


                        console.log(
                            `[PLAYLIST CREATED] ${insertedCourse.title} -> ${video.lessons.length} lessons`
                        );
                    }

                } catch (
                    error
                ) {

                    console.error(
                        `[PLAYLIST INSERT ERROR] ${video.title}`,
                        error
                    );
                }


                continue;
            }


            /* =================================================
               NORMAL VIDEO
            ================================================= */

            if (
                existingVideoIds.has(
                    video.videoId
                )
            ) {
                continue;
            }


            try {

                const [insertedCourse] =
                    await db
                        .insert(
                            courses
                        )
                        .values({

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
                                "VIDEO",

                            language:
                                video.language,

                            youtubeUrl:
                                `https://www.youtube.com/watch?v=${video.videoId}`,

                            youtubeId:
                                video.videoId,

                            youtubePlaylistId:
                                null,

                            channelName:
                                video.channelName,

                            thumbnailUrl:
                                video.thumbnail,

                            views:
                                video.views ||
                                0,

                            likes:
                                video.likes ||
                                0,

                            duration:
                                video.duration ||
                                "Unknown",

                            lessonsCount:
                                1,

                            rating:
                                "0",

                            students:
                                "0",

                            source:
                                "YouTube",

                            recommendationScore:
                                item.recommendationScore,

                            adminRecommended:
                                false,

                            featured:
                                false,
                        })
                        .onConflictDoNothing(
                            {
                                target:
                                    courses.youtubeId,
                            }
                        )
                        .returning();


                if (
                    insertedCourse
                ) {

                    await db
                        .insert(
                            lessons
                        )
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
                    `[COURSE INSERT ERROR] ${video.title}`,
                    error
                );
            }
        }


        /* =================================================
           12. FINAL FETCH
        ================================================= */

        const finalVideoCourses =
            videoIds.length > 0
                ? await db
                    .select()
                    .from(courses)
                    .where(
                        inArray(
                            courses.youtubeId,
                            videoIds
                        )
                    )
                : [];


        const finalPlaylistCourses =
            playlistIds.length > 0
                ? await db
                    .select()
                    .from(courses)
                    .where(
                        inArray(
                            courses.youtubePlaylistId,
                            playlistIds
                        )
                    )
                : [];


        const finalCourses =
            [
                ...finalVideoCourses,
                ...finalPlaylistCourses,
            ];


        /* =================================================
           13. FINAL SUBJECT + LANGUAGE FILTER
        ================================================= */

        const finalRelevantCourses =
            finalCourses.filter(
                (course) => {

                    const language =
                        normalizeText(
                            course.language ||
                                "English"
                        );

                    const languageMatch =
                        language ===
                        normalizedPreferredLanguage;

                    const subjectMatch =
                        isRelevantDatabaseCourse(
                            course.title,
                            course.description,
                            course.category,
                            course.channelName,
                            query
                        );

                    return (
                        languageMatch &&
                        subjectMatch
                    );
                }
            );


        /* =================================================
           14. SORT FINAL RESULTS
        ================================================= */

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


        console.log(
            "Final videos:",
            finalRelevantCourses.filter(
                (course) =>
                    course.courseType ===
                    "VIDEO"
            ).length
        );


        console.log(
            "Final playlists:",
            finalRelevantCourses.filter(
                (course) =>
                    course.courseType ===
                    "PLAYLIST"
            ).length
        );


        /* =================================================
           15. RETURN
        ================================================= */

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