type YouTubeCourseResult = {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelName: string;
    publishedAt: string;
};

type YouTubeVideoStatistics = {
    id: string;

    statistics?: {
        viewCount?: string;
        likeCount?: string;
    };

    contentDetails?: {
        duration?: string;
    };
};


/* =========================
   NORMALIZE TEXT
========================= */

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================
   NORMALIZE QUERY
========================= */

function normalizeQuery(query: string): string {
    return normalizeText(query);
}


/* =========================
   CHECK BAD VIDEO
========================= */

function isBadVideo(
    title: string,
    description: string
): boolean {

    const normalizedTitle =
        normalizeText(title);

    const normalizedDescription =
        normalizeText(description);

    const text =
        `${normalizedTitle} ${normalizedDescription}`;


    /* =========================
       1. SHORTS
    ========================= */

    const shortsPatterns = [
        "#shorts",
        "shorts",
        "youtube shorts",
    ];

    for (const pattern of shortsPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - SHORTS] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       2. CAREER / SALARY CONTENT
    ========================= */

    const careerPatterns = [
        "salary of",
        "salary",
        "earnings",
        "earning potential",
        "how much does",
        "how much can you earn",
        "career opportunities",
        "career path",
        "career roadmap",
        "job opportunities",
        "job market",
        "future scope",
        "future of",
        "is it worth learning",
        "is it worth it",
        "worth learning",
        "should you learn",
    ];

    for (const pattern of careerPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - CAREER] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       3. ROADMAP CONTENT
    ========================= */

    const roadmapPatterns = [
        "roadmap",
        "road map",
        "learning path",
        "study plan",
    ];

    for (const pattern of roadmapPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - ROADMAP] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       4. INTERVIEW CONTENT
    ========================= */

    const interviewPatterns = [
        "interview questions",
        "interview preparation",
        "interview prep",
        "coding interview",
        "technical interview",
        "placement preparation",
        "placement prep",
    ];

    for (const pattern of interviewPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - INTERVIEW] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       5. COMPARISON CONTENT
    ========================= */

    const comparisonPatterns = [
        " vs ",
        " versus ",
        "comparison",
        "compare ",
        "which is better",
        "which one is better",
        "difference between",
    ];

    for (const pattern of comparisonPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - COMPARISON] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       6. REVIEW CONTENT
    ========================= */

    const reviewPatterns = [
        "course review",
        "course reviews",
        "tutorial review",
        "course feedback",
        "review of",
    ];

    for (const pattern of reviewPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - REVIEW] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       7. VERY SHORT VIDEOS
    ========================= */

    const shortDurationPatterns = [
        "in 30 seconds",
        "in 60 seconds",
        "in 1 minute",
        "in 2 minutes",
        "in 3 minutes",
        "in 5 minutes",
        "in 10 minutes",
        "in 15 minutes",
        "in 20 minutes",
        "in 30 minutes",
        "in 45 minutes",
        "in 1 hour",
    ];

    for (const pattern of shortDurationPatterns) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - SHORT CONTENT] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       8. INTRODUCTION ONLY
    ========================= */

    const introductionPatterns = [
        "what is",
        "introduction to",
        "introduction of",
        "getting started",
        "basics explained",
        "explained in",
    ];

    const hasFullCourseSignal =
        normalizedTitle.includes("full course") ||
        normalizedTitle.includes("complete course") ||
        normalizedTitle.includes("full tutorial") ||
        normalizedTitle.includes("complete tutorial");

    for (const pattern of introductionPatterns) {

        if (
            normalizedTitle.startsWith(pattern) &&
            !hasFullCourseSignal
        ) {

            console.log(
                `[REMOVE - INTRO ONLY] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =========================
       9. PURE TUTORIAL / SINGLE TOPIC
    ========================= */

    const singleTopicPatterns = [
        "what is",
        "variables",
        "variable tutorial",
        "data types",
        "datatype",
        "functions tutorial",
        "loops tutorial",
        "operators tutorial",
        "syntax tutorial",
        "input tags",
    ];

    for (const pattern of singleTopicPatterns) {

        if (
            normalizedTitle === pattern
        ) {

            console.log(
                `[REMOVE - SINGLE TOPIC] ${title}`
            );

            return true;
        }
    }


    /* =========================
       EVERYTHING ELSE
    ========================= */

    return false;
}


/* =========================
   CHECK COURSE SIGNAL
========================= */

function hasCourseSignal(
    title: string,
    description: string
): boolean {

    const titleText =
        normalizeText(title);

    const descriptionText =
        normalizeText(description);

    const text =
        `${titleText} ${descriptionText}`;


    const strongCoursePatterns = [

        "full course",
        "complete course",
        "full tutorial",
        "complete tutorial",

        "full programming course",
        "complete programming course",

        "course for beginners",
        "beginner course",

        "full stack course",
        "complete course for beginners",

        "learn from scratch",
        "from scratch",

        "zero to hero",

        "one video",
        "all in one",

        "fundamentals full course",
        "fundamentals [full course]",

    ];


    for (
        const pattern
        of strongCoursePatterns
    ) {

        if (
            text.includes(pattern)
        ) {
            return true;
        }
    }


    return false;
}


/* =========================
   CHECK COURSE RELEVANCE
========================= */

function isRelevantCourse(
    title: string,
    description: string,
    query: string
): boolean {

    const normalizedTitle =
        normalizeText(title);

    const normalizedDescription =
        normalizeText(description);

    const normalizedQuery =
        normalizeQuery(query);

    const text =
        `${normalizedTitle} ${normalizedDescription}`;


    /* =========================
       C++
    ========================= */

    if (
        normalizedQuery === "c++" ||
        normalizedQuery === "cpp" ||
        normalizedQuery === "c ++" ||
        normalizedQuery === "c plus plus"
    ) {

        return (
            normalizedTitle.includes("c++") ||
            normalizedTitle.includes("c ++") ||
            normalizedTitle.includes("c/c++") ||
            /\bcpp\b/i.test(normalizedTitle) ||
            normalizedTitle.includes("c plus plus") ||

            normalizedDescription.includes("c++") ||
            normalizedDescription.includes("c ++") ||
            normalizedDescription.includes("c/c++") ||
            /\bcpp\b/i.test(normalizedDescription) ||
            normalizedDescription.includes("c plus plus")
        );
    }


    /* =========================
       C PROGRAMMING
    ========================= */

    if (
        normalizedQuery === "c" ||
        normalizedQuery === "c programming"
    ) {

        return (
            /\bc programming\b/i.test(text) ||
            /\bc language\b/i.test(text) ||
            /\bc programming language\b/i.test(text)
        );
    }


    /* =========================
       JAVA
    ========================= */

    if (
        normalizedQuery === "java"
    ) {

        return (
            /\bjava\b/i.test(text) &&
            !/\bjavascript\b/i.test(text)
        );
    }


    /* =========================
       JAVASCRIPT
    ========================= */

    if (
        normalizedQuery === "javascript" ||
        normalizedQuery === "java script" ||
        normalizedQuery === "js"
    ) {

        return (
            /\bjavascript\b/i.test(text) ||
            /\bjava script\b/i.test(text) ||
            /\becmascript\b/i.test(text)
        );
    }


    /* =========================
       TYPESCRIPT
    ========================= */

    if (
        normalizedQuery === "typescript" ||
        normalizedQuery === "type script" ||
        normalizedQuery === "ts"
    ) {

        return (
            /\btypescript\b/i.test(text) ||
            /\btype script\b/i.test(text)
        );
    }


    /* =========================
       PYTHON
    ========================= */

    if (
        normalizedQuery === "python" ||
        normalizedQuery === "py"
    ) {

        return (
            /\bpython\b/i.test(text)
        );
    }


    /* =========================
       REACT
    ========================= */

    if (
        normalizedQuery === "react" ||
        normalizedQuery === "reactjs"
    ) {

        return (
            /\breact\b/i.test(text) ||
            /\breactjs\b/i.test(text)
        );
    }


    /* =========================
       PHP
    ========================= */

    if (
        normalizedQuery === "php"
    ) {

        return (
            /\bphp\b/i.test(normalizedTitle) ||
            /\bphp\b/i.test(normalizedDescription)
        );
    }


    /* =========================
       MERN STACK
    ========================= */

    if (
        normalizedQuery === "mern" ||
        normalizedQuery === "mern stack"
    ) {

        return (
            /\bmern\b/i.test(text) ||
            /\bmern stack\b/i.test(text)
        );
    }


    /* =========================
       SQL
    ========================= */

    if (
        normalizedQuery === "sql"
    ) {

        return (
            /\bsql\b/i.test(text)
        );
    }


    /* =========================
       HTML
    ========================= */

    if (
        normalizedQuery === "html" ||
        normalizedQuery === "html5"
    ) {

        return (
            /\bhtml\b/i.test(text) ||
            /\bhtml5\b/i.test(text)
        );
    }


    /* =========================
       CSS
    ========================= */

    if (
        normalizedQuery === "css" ||
        normalizedQuery === "css3"
    ) {

        return (
            /\bcss\b/i.test(text) ||
            /\bcss3\b/i.test(text)
        );
    }


    /* =========================
       NODE.JS
    ========================= */

    if (
        normalizedQuery === "node" ||
        normalizedQuery === "nodejs" ||
        normalizedQuery === "node.js"
    ) {

        return (
            /\bnode\.?js\b/i.test(text) ||
            /\bnode js\b/i.test(text)
        );
    }


    /* =========================
       MONGODB
    ========================= */

    if (
        normalizedQuery === "mongodb" ||
        normalizedQuery === "mongo db"
    ) {

        return (
            /\bmongodb\b/i.test(text) ||
            /\bmongo db\b/i.test(text)
        );
    }


    /* =========================
       EXPRESS
    ========================= */

    if (
        normalizedQuery === "express" ||
        normalizedQuery === "expressjs"
    ) {

        return (
            /\bexpress\.?js\b/i.test(text) ||
            /\bexpress js\b/i.test(text)
        );
    }


    /* =========================
       NORMAL SEARCH
    ========================= */

    const words =
        normalizedQuery
            .split(/\s+/)
            .filter(Boolean);

    if (
        words.length === 0
    ) {
        return false;
    }


    return words.every(
        (word) =>
            text.includes(word)
    );
}


/* =========================
   CREATE YOUTUBE SEARCH QUERY
========================= */

function createYouTubeSearchQuery(
    query: string
): string {

    const normalizedQuery =
        normalizeQuery(query);


    /* C++ */

    if (
        normalizedQuery === "c++" ||
        normalizedQuery === "cpp" ||
        normalizedQuery === "c ++" ||
        normalizedQuery === "c plus plus"
    ) {

        return `"C++" programming full course`;
    }


    /* C */

    if (
        normalizedQuery === "c" ||
        normalizedQuery === "c programming"
    ) {

        return `"C programming" full course`;
    }


    /* JAVA */

    if (
        normalizedQuery === "java"
    ) {

        return `"Java programming" full course`;
    }


    /* JAVASCRIPT */

    if (
        normalizedQuery === "javascript" ||
        normalizedQuery === "java script" ||
        normalizedQuery === "js"
    ) {

        return `"JavaScript" full course`;
    }


    /* TYPESCRIPT */

    if (
        normalizedQuery === "typescript" ||
        normalizedQuery === "type script" ||
        normalizedQuery === "ts"
    ) {

        return `"TypeScript" full course`;
    }


    /* PYTHON */

    if (
        normalizedQuery === "python" ||
        normalizedQuery === "py"
    ) {

        return `"Python" full course`;
    }


    /* REACT */

    if (
        normalizedQuery === "react" ||
        normalizedQuery === "reactjs"
    ) {

        return `"React JS" full course`;
    }


    /* PHP */

    if (
        normalizedQuery === "php"
    ) {

        return `"PHP" full course tutorial`;
    }


    /* MERN */

    if (
        normalizedQuery === "mern" ||
        normalizedQuery === "mern stack"
    ) {

        return `"MERN Stack" full course tutorial`;
    }


    /* SQL */

    if (
        normalizedQuery === "sql"
    ) {

        return `"SQL" full course tutorial`;
    }


    /* NODE */

    if (
        normalizedQuery === "node" ||
        normalizedQuery === "nodejs" ||
        normalizedQuery === "node.js"
    ) {

        return `"Node.js" full course`;
    }


    /* MONGODB */

    if (
        normalizedQuery === "mongodb" ||
        normalizedQuery === "mongo db"
    ) {

        return `"MongoDB" full course`;
    }


    /* DEFAULT */

    return `"${query}" full course tutorial`;
}


/* =========================
   SEARCH YOUTUBE COURSES
========================= */

export async function searchYouTubeCourses(
    query: string
): Promise<YouTubeCourseResult[]> {

    const apiKey =
        process.env.YOUTUBE_API_KEY;

    if (!apiKey) {

        throw new Error(
            "YOUTUBE_API_KEY is not configured"
        );
    }


    const youtubeQuery =
        createYouTubeSearchQuery(query);


    console.log(
        "YouTube search query:",
        youtubeQuery
    );


    /* =========================
       YOUTUBE SEARCH API
    ========================= */

    const url =
        new URL(
            "https://www.googleapis.com/youtube/v3/search"
        );


    url.searchParams.set(
        "part",
        "snippet"
    );

    url.searchParams.set(
        "q",
        youtubeQuery
    );

    url.searchParams.set(
        "type",
        "video"
    );

    url.searchParams.set(
        "videoEmbeddable",
        "true"
    );

    url.searchParams.set(
        "videoSyndicated",
        "true"
    );

    url.searchParams.set(
        "maxResults",
        "25"
    );

    url.searchParams.set(
        "key",
        apiKey
    );


    const response =
        await fetch(
            url.toString(),
            {
                cache: "no-store",
            }
        );


    if (!response.ok) {

        const error =
            await response.text();

        console.error(
            "YouTube API error:",
            error
        );

        throw new Error(
            "YouTube search failed"
        );
    }


    const data =
        await response.json();


    /* =========================
       CONVERT RESULTS
    ========================= */

    const results:
        YouTubeCourseResult[] =

        (data.items || [])
            .filter(
                (item: any) =>
                    item.id?.videoId &&
                    item.snippet
            )
            .map(
                (item: any) => ({

                    videoId:
                        item.id.videoId,

                    title:
                        item.snippet.title ||
                        "",

                    description:
                        item.snippet.description ||
                        "",

                    thumbnail:
                        item.snippet
                            .thumbnails
                            ?.high?.url ||

                        item.snippet
                            .thumbnails
                            ?.medium?.url ||

                        item.snippet
                            .thumbnails
                            ?.default?.url ||

                        "",

                    channelName:
                        item.snippet.channelTitle ||
                        "",

                    publishedAt:
                        item.snippet.publishedAt ||
                        "",
                })
            );


    console.log(
        "YouTube raw results:",
        results.length
    );


    /* =========================
       FILTER RESULTS
    ========================= */

    const relevantResults =
        results.filter(
            (video) => {

                /* =========================
                   BAD CONTENT
                ========================= */

                if (
                    isBadVideo(
                        video.title,
                        video.description
                    )
                ) {

                    return false;
                }


                /* =========================
                   RELEVANCE
                ========================= */

                if (
                    !isRelevantCourse(
                        video.title,
                        video.description,
                        query
                    )
                ) {

                    console.log(
                        `[REMOVE - IRRELEVANT] ${video.title}`
                    );

                    return false;
                }


                /* =========================
                   COURSE SIGNAL
                ========================= */

                if (
                    !hasCourseSignal(
                        video.title,
                        video.description
                    )
                ) {

                    console.log(
                        `[REMOVE - NOT A COURSE] ${video.title}`
                    );

                    return false;
                }


                console.log(
                    `[KEEP - COURSE] ${video.title}`
                );

                return true;
            }
        );


    console.log(
        "YouTube relevant results:",
        relevantResults.length
    );


    /* =========================
       REMOVE DUPLICATES
    ========================= */

    const uniqueResults =
        Array.from(
            new Map(
                relevantResults.map(
                    (video) => [
                        video.videoId,
                        video,
                    ]
                )
            ).values()
        );


    console.log(
        "YouTube unique results:",
        uniqueResults.length
    );


    return uniqueResults;
}


/* =========================
   GET VIDEO STATISTICS
========================= */

export async function getYouTubeVideoStatistics(
    videoIds: string[]
): Promise<YouTubeVideoStatistics[]> {

    const apiKey =
        process.env.YOUTUBE_API_KEY;


    if (!apiKey) {

        throw new Error(
            "YOUTUBE_API_KEY is not configured"
        );
    }


    if (
        videoIds.length === 0
    ) {

        return [];
    }


    /* =========================
       CHUNK IDS
       MAX 50 PER REQUEST
    ========================= */

    const chunks: string[][] = [];

    for (
        let i = 0;
        i < videoIds.length;
        i += 50
    ) {

        chunks.push(
            videoIds.slice(
                i,
                i + 50
            )
        );
    }


    const allStatistics:
        YouTubeVideoStatistics[] = [];


    for (
        const chunk of chunks
    ) {

        const url =
            new URL(
                "https://www.googleapis.com/youtube/v3/videos"
            );


        url.searchParams.set(
            "part",
            "statistics,contentDetails"
        );

        url.searchParams.set(
            "id",
            chunk.join(",")
        );

        url.searchParams.set(
            "key",
            apiKey
        );


        const response =
            await fetch(
                url.toString(),
                {
                    cache: "no-store",
                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "YouTube statistics error:",
                error
            );

            throw new Error(
                "Failed to fetch YouTube statistics"
            );
        }


        const data =
            await response.json();


        allStatistics.push(
            ...(data.items || [])
        );
    }


    return allStatistics;
}


/* =========================
   FORMAT YOUTUBE DURATION
========================= */

export function formatYouTubeDuration(
    isoDuration: string
): string {

    if (!isoDuration) {
        return "Unknown";
    }


    const match =
        isoDuration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );


    if (!match) {
        return "Unknown";
    }


    const hours =
        Number(match[1] || 0);

    const minutes =
        Number(match[2] || 0);

    const seconds =
        Number(match[3] || 0);


    const parts: string[] = [];


    if (
        hours > 0
    ) {

        parts.push(
            `${hours}h`
        );
    }


    if (
        minutes > 0
    ) {

        parts.push(
            `${minutes}m`
        );
    }


    if (
        seconds > 0 &&
        hours === 0
    ) {

        parts.push(
            `${seconds}s`
        );
    }


    if (
        parts.length === 0
    ) {

        return "0m";
    }


    return parts.join(" ");
}


/* =========================
   GET DURATION SECONDS
========================= */

export function getDurationSeconds(
    isoDuration: string
): number {

    if (!isoDuration) {
        return 0;
    }


    const match =
        isoDuration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );


    if (!match) {
        return 0;
    }


    const hours =
        Number(match[1] || 0);

    const minutes =
        Number(match[2] || 0);

    const seconds =
        Number(match[3] || 0);


    return (
        hours * 60 * 60 +
        minutes * 60 +
        seconds
    );
}