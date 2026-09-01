type YouTubeCourseResult = {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelName: string;
    publishedAt: string;
    language: string;
};

type YouTubeVideoStatistics = {
    id: string;

    snippet?: {
        defaultAudioLanguage?: string;
        defaultLanguage?: string;
    };

    statistics?: {
        viewCount?: string;
        likeCount?: string;
    };

    contentDetails?: {
        duration?: string;
    };
};


/* =========================================================
   NORMALIZE TEXT
========================================================= */

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


/* =========================================================
   NORMALIZE QUERY
========================================================= */

function normalizeQuery(query: string): string {
    return normalizeText(query);
}


/* =========================================================
   NORMALIZE LANGUAGE
========================================================= */

export function normalizeLanguage(
    language: string | null | undefined
): string {

    const value =
        (language || "")
            .toLowerCase()
            .trim();

    /* English */

    if (
        value === "en" ||
        value === "eng" ||
        value === "english" ||
        value === "en-us" ||
        value === "en-gb"
    ) {
        return "english";
    }

    /* Hindi */

    if (
        value === "hi" ||
        value === "hin" ||
        value === "hindi" ||
        value === "hi-in" ||
        value === "हिंदी" ||
        value === "हिन्दी"
    ) {
        return "hindi";
    }

    /* Tamil */

    if (
        value === "ta" ||
        value === "tam" ||
        value === "tamil" ||
        value === "ta-in"
    ) {
        return "tamil";
    }

    /* Telugu */

    if (
        value === "te" ||
        value === "tel" ||
        value === "telugu" ||
        value === "te-in"
    ) {
        return "telugu";
    }

    /* Kannada */

    if (
        value === "kn" ||
        value === "kan" ||
        value === "kannada" ||
        value === "kn-in"
    ) {
        return "kannada";
    }

    /* Malayalam */

    if (
        value === "ml" ||
        value === "mal" ||
        value === "malayalam" ||
        value === "ml-in"
    ) {
        return "malayalam";
    }

    /* Bengali */

    if (
        value === "bn" ||
        value === "ben" ||
        value === "bengali" ||
        value === "bn-in"
    ) {
        return "bengali";
    }

    /* Marathi */

    if (
        value === "mr" ||
        value === "mar" ||
        value === "marathi" ||
        value === "mr-in"
    ) {
        return "marathi";
    }

    /* Gujarati */

    if (
        value === "gu" ||
        value === "guj" ||
        value === "gujarati" ||
        value === "gu-in"
    ) {
        return "gujarati";
    }

    /* Punjabi */

    if (
        value === "pa" ||
        value === "pan" ||
        value === "punjabi" ||
        value === "pa-in"
    ) {
        return "punjabi";
    }

    /* Urdu */

    if (
        value === "ur" ||
        value === "urd" ||
        value === "urdu" ||
        value === "ur-in"
    ) {
        return "urdu";
    }

    /* Odia */

    if (
        value === "or" ||
        value === "ori" ||
        value === "odia" ||
        value === "oriya" ||
        value === "or-in"
    ) {
        return "odia";
    }

    /* Assamese */

    if (
        value === "as" ||
        value === "asm" ||
        value === "assamese" ||
        value === "as-in"
    ) {
        return "assamese";
    }

    /* Nepali */

    if (
        value === "ne" ||
        value === "nep" ||
        value === "nepali" ||
        value === "ne-np"
    ) {
        return "nepali";
    }

    /* French */

    if (
        value === "fr" ||
        value === "fra" ||
        value === "fre" ||
        value === "french"
    ) {
        return "french";
    }

    /* Spanish */

    if (
        value === "es" ||
        value === "spa" ||
        value === "spanish"
    ) {
        return "spanish";
    }

    /* German */

    if (
        value === "de" ||
        value === "deu" ||
        value === "ger" ||
        value === "german"
    ) {
        return "german";
    }

    /* Portuguese */

    if (
        value === "pt" ||
        value === "por" ||
        value === "portuguese"
    ) {
        return "portuguese";
    }

    return value;
}


/* =========================================================
   DISPLAY LANGUAGE
========================================================= */

export function displayLanguage(
    language: string | null | undefined
): string {

    const normalized =
        normalizeLanguage(language);

    const languageMap: Record<string, string> = {
        english: "English",
        hindi: "Hindi",
        tamil: "Tamil",
        telugu: "Telugu",
        kannada: "Kannada",
        malayalam: "Malayalam",
        bengali: "Bengali",
        marathi: "Marathi",
        gujarati: "Gujarati",
        punjabi: "Punjabi",
        urdu: "Urdu",
        odia: "Odia",
        assamese: "Assamese",
        nepali: "Nepali",
        french: "French",
        spanish: "Spanish",
        german: "German",
        portuguese: "Portuguese",
    };

    return languageMap[normalized] || "Unknown";
}


/* =========================================================
   CHECK BAD VIDEO
========================================================= */

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


    /* =====================================================
       SHORTS
    ===================================================== */

    const shortsPatterns = [
        "#shorts",
        "youtube shorts",
        "short video",
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


    /* =====================================================
       CAREER / SALARY
    ===================================================== */

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
        "part",
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


    /* =====================================================
       ROADMAP
    ===================================================== */

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


    /* =====================================================
       INTERVIEW
    ===================================================== */

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


    /* =====================================================
       COMPARISON
    ===================================================== */

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


    /* =====================================================
       REVIEW
    ===================================================== */

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


    /* =====================================================
       VERY SHORT CONTENT
    ===================================================== */

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

    for (
        const pattern of shortDurationPatterns
    ) {

        if (
            normalizedTitle.includes(pattern)
        ) {

            console.log(
                `[REMOVE - SHORT CONTENT] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =====================================================
       INTRODUCTION ONLY
    ===================================================== */

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

    for (
        const pattern of introductionPatterns
    ) {

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


    return false;
}


/* =========================================================
   CHECK COURSE SIGNAL
========================================================= */

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
        const pattern of strongCoursePatterns
    ) {

        if (
            text.includes(pattern)
        ) {

            return true;
        }
    }


    return false;
}


/* =========================================================
   CHECK COURSE RELEVANCE
========================================================= */

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


    /* =====================================================
       C PROGRAMMING
    ===================================================== */

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


    /* =====================================================
       JAVA
    ===================================================== */

    if (
        normalizedQuery === "java"
    ) {

        return (
            /\bjava\b/i.test(text) &&
            !/\bjavascript\b/i.test(text)
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
            /\bjavascript\b/i.test(text) ||
            /\bjava script\b/i.test(text) ||
            /\becmascript\b/i.test(text)
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
            /\btypescript\b/i.test(text) ||
            /\btype script\b/i.test(text)
        );
    }


    /* =====================================================
       PYTHON
    ===================================================== */

    if (
        normalizedQuery === "python" ||
        normalizedQuery === "py"
    ) {

        return /\bpython\b/i.test(text);
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
       PHP
    ===================================================== */

    if (
        normalizedQuery === "php"
    ) {

        return /\bphp\b/i.test(text);
    }


    /* =====================================================
       MERN
    ===================================================== */

    if (
        normalizedQuery === "mern" ||
        normalizedQuery === "mern stack"
    ) {

        return (
            /\bmern\b/i.test(text) ||
            /\bmern stack\b/i.test(text)
        );
    }


    /* =====================================================
       SQL
    ===================================================== */

    if (
        normalizedQuery === "sql"
    ) {

        return /\bsql\b/i.test(text);
    }


    /* =====================================================
       HTML
    ===================================================== */

    if (
        normalizedQuery === "html" ||
        normalizedQuery === "html5"
    ) {

        return (
            /\bhtml\b/i.test(text) ||
            /\bhtml5\b/i.test(text)
        );
    }


    /* =====================================================
       CSS
    ===================================================== */

    if (
        normalizedQuery === "css" ||
        normalizedQuery === "css3"
    ) {

        return (
            /\bcss\b/i.test(text) ||
            /\bcss3\b/i.test(text)
        );
    }


    /* =====================================================
       NODE.JS
    ===================================================== */

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


    /* =====================================================
       MONGODB
    ===================================================== */

    if (
        normalizedQuery === "mongodb" ||
        normalizedQuery === "mongo db"
    ) {

        return (
            /\bmongodb\b/i.test(text) ||
            /\bmongo db\b/i.test(text)
        );
    }


    /* =====================================================
       EXPRESS
    ===================================================== */

    if (
        normalizedQuery === "express" ||
        normalizedQuery === "expressjs"
    ) {

        return (
            /\bexpress\.?js\b/i.test(text) ||
            /\bexpress js\b/i.test(text)
        );
    }


    /* =====================================================
       NORMAL SEARCH
    ===================================================== */

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


/* =========================================================
   CREATE YOUTUBE SEARCH QUERY
========================================================= */

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


/* =========================================================
   KNOWN VIDEO LANGUAGE OVERRIDES
========================================================= */

const KNOWN_VIDEO_LANGUAGE_OVERRIDES:
    Record<string, string> = {

    /*
     * Add manually verified videos here.
     *
     * Example:
     *
     * "VIDEO_ID": "Hindi",
     * "VIDEO_ID": "English",
     */

    hlGoQC332VM: "Hindi",
};


/* =========================================================
   GET KNOWN VIDEO LANGUAGE
========================================================= */

export function getKnownVideoLanguage(
    videoId: string
): string | null {

    return (
        KNOWN_VIDEO_LANGUAGE_OVERRIDES[videoId] ||
        null
    );
}


/* =========================================================
   DETECT LANGUAGE FROM YOUTUBE CODE
========================================================= */

function detectFromYouTubeLanguageCode(
    languageCode: string | null | undefined
): string | null {

    if (!languageCode) {
        return null;
    }

    const normalized =
        languageCode
            .toLowerCase()
            .trim();

    const language =
        normalizeLanguage(normalized);

    /*
     * If it is a recognized language,
     * return it.
     */

    const recognizedLanguages = [
        "english",
        "hindi",
        "tamil",
        "telugu",
        "kannada",
        "malayalam",
        "bengali",
        "marathi",
        "gujarati",
        "punjabi",
        "urdu",
        "odia",
        "assamese",
        "nepali",
        "french",
        "spanish",
        "german",
        "portuguese",
    ];

    if (
        recognizedLanguages.includes(language)
    ) {

        return displayLanguage(language);
    }

    return null;
}


/* =========================================================
   DETECT NON-ENGLISH SCRIPT
========================================================= */

function detectIndianScriptLanguage(
    text: string
): string | null {

    /*
     * Devanagari
     *
     * Hindi / Marathi / Nepali
     */

    if (
        /[\u0900-\u097F]/.test(text)
    ) {

        /*
         * Marathi-specific common words.
         */

        if (
            /\b(आहे|आणि|मध्ये|करण्यासाठी|मराठी)\b/.test(text)
        ) {

            return "Marathi";
        }

        /*
         * Nepali-specific common words.
         */

        if (
            /\b(नेपाली|छ|छन्|लाई|बाट|को)\b/.test(text)
        ) {

            return "Nepali";
        }

        return "Hindi";
    }


    /*
     * Tamil
     */

    if (
        /[\u0B80-\u0BFF]/.test(text)
    ) {

        return "Tamil";
    }


    /*
     * Telugu
     */

    if (
        /[\u0C00-\u0C7F]/.test(text)
    ) {

        return "Telugu";
    }


    /*
     * Kannada
     */

    if (
        /[\u0C80-\u0CFF]/.test(text)
    ) {

        return "Kannada";
    }


    /*
     * Malayalam
     */

    if (
        /[\u0D00-\u0D7F]/.test(text)
    ) {

        return "Malayalam";
    }


    /*
     * Bengali / Assamese
     */

    if (
        /[\u0980-\u09FF]/.test(text)
    ) {

        if (
            /[\u0985-\u0994]/.test(text)
        ) {

            return "Bengali";
        }

        return "Bengali";
    }


    /*
     * Gujarati
     */

    if (
        /[\u0A80-\u0AFF]/.test(text)
    ) {

        return "Gujarati";
    }


    /*
     * Punjabi / Gurmukhi
     */

    if (
        /[\u0A00-\u0A7F]/.test(text)
    ) {

        return "Punjabi";
    }


    /*
     * Odia
     */

    if (
        /[\u0B00-\u0B7F]/.test(text)
    ) {

        return "Odia";
    }


    /*
     * Urdu / Arabic script
     *
     * This is intentionally broad.
     */

    if (
        /[\u0600-\u06FF]/.test(text)
    ) {

        return "Urdu";
    }


    return null;
}


/* =========================================================
   DETECT LANGUAGE FROM TEXT
========================================================= */

function detectCourseLanguageFromText(
    title: string,
    description: string,
    channelName: string
): string | null {

    const titleText =
        normalizeText(title);

    const descriptionText =
        normalizeText(description);

    const channelText =
        normalizeText(channelName);

    const combinedText =
        `${titleText} ${descriptionText} ${channelText}`;


    /* =====================================================
       FIRST: INDIAN SCRIPTS
    ===================================================== */

    const scriptLanguage =
        detectIndianScriptLanguage(
            combinedText
        );

    if (
        scriptLanguage
    ) {

        return scriptLanguage;
    }


    /* =====================================================
       HINDI KEYWORDS
    ===================================================== */

    const hindiSignals = [

        "hindi",
        "in hindi",
        "hindi tutorial",
        "hindi course",
        "hindi mein",
        "hindi me",

        "हिंदी",
        "हिन्दी",
        "हिंदी में",
        "हिन्दी में",
    ];

    for (
        const signal of hindiSignals
    ) {

        if (
            titleText.includes(signal) ||
            descriptionText.includes(signal)
        ) {

            return "Hindi";
        }
    }


    /* =====================================================
       ENGLISH KEYWORDS
    ===================================================== */

    const englishSignals = [

        "english",
        "in english",
        "english tutorial",
        "english course",
        "english language",

    ];

    for (
        const signal of englishSignals
    ) {

        if (
            titleText.includes(signal) ||
            descriptionText.includes(signal)
        ) {

            return "English";
        }
    }


    /*
     * We intentionally DO NOT automatically return
     * English here.
     *
     * This is important because a Tamil / Telugu /
     * Malayalam video may have an English title.
     */

    return null;
}


/* =========================================================
   RESOLVE VIDEO LANGUAGE
========================================================= */

export function resolveVideoLanguage(
    storedLanguage: string | null | undefined,
    youtubeLanguageCode?: string | null
): string {

    /*
     * 1. YouTube metadata first.
     */

    const youtubeLanguage =
        detectFromYouTubeLanguageCode(
            youtubeLanguageCode
        );

    if (
        youtubeLanguage
    ) {

        return youtubeLanguage;
    }


    /*
     * 2. Stored language.
     */

    const normalizedStored =
        normalizeLanguage(
            storedLanguage
        );

    const recognizedLanguages = [
        "english",
        "hindi",
        "tamil",
        "telugu",
        "kannada",
        "malayalam",
        "bengali",
        "marathi",
        "gujarati",
        "punjabi",
        "urdu",
        "odia",
        "assamese",
        "nepali",
        "french",
        "spanish",
        "german",
        "portuguese",
    ];

    if (
        recognizedLanguages.includes(
            normalizedStored
        )
    ) {

        return displayLanguage(
            normalizedStored
        );
    }


    return "Unknown";
}


/* =========================================================
   SEARCH YOUTUBE COURSES
========================================================= */

export async function searchYouTubeCourses(
    query: string,
    preferredLanguage: string = "English"
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


    const language =
        normalizeLanguage(
            preferredLanguage
        );


    /*
     * Only English and Hindi are supported
     * as requested.
     */

    if (
        language !== "english" &&
        language !== "hindi"
    ) {

        console.log(
            "Unsupported language:",
            preferredLanguage
        );

        return [];
    }


    /*
     * Language-specific search query.
     */

    let languageQuery =
        youtubeQuery;

    if (
        language === "hindi"
    ) {

        languageQuery =
            `${youtubeQuery} Hindi`;
    }


    if (
        language === "english"
    ) {

        languageQuery =
            `${youtubeQuery} English`;
    }


    console.log(
        "YouTube search query:",
        languageQuery
    );

    console.log(
        "Required language:",
        language
    );


    /* =====================================================
       YOUTUBE SEARCH API
    ===================================================== */

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
        languageQuery
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

    /*
     * Get many results because language filtering
     * happens after the API response.
     */

    url.searchParams.set(
        "maxResults",
        "50"
    );


    /*
     * relevanceLanguage is ONLY a hint.
     */

    if (
        language === "english"
    ) {

        url.searchParams.set(
            "relevanceLanguage",
            "en"
        );
    }

    if (
        language === "hindi"
    ) {

        url.searchParams.set(
            "relevanceLanguage",
            "hi"
        );
    }


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


    /* =====================================================
       INITIAL RESULTS
    ===================================================== */

    const initialResults:
        YouTubeCourseResult[] =

        (data.items || [])
            .filter(
                (item: any) =>
                    item.id?.videoId &&
                    item.snippet
            )
            .map(
                (item: any) => {

                    const title =
                        item.snippet.title || "";

                    const description =
                        item.snippet.description || "";

                    const channelName =
                        item.snippet.channelTitle || "";


                    const textLanguage =
                        detectCourseLanguageFromText(
                            title,
                            description,
                            channelName
                        );


                    return {

                        videoId:
                            item.id.videoId,

                        title,

                        description,

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

                        channelName,

                        publishedAt:
                            item.snippet
                                .publishedAt ||
                            "",

                        language:
                            getKnownVideoLanguage(
                                item.id.videoId
                            ) ||
                            textLanguage ||
                            "Unknown",
                    };
                }
            );


    console.log(
        "YouTube raw results:",
        initialResults.length
    );


    /* =====================================================
       GET ACTUAL VIDEO METADATA
    ===================================================== */

    const videoIds =
        initialResults.map(
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
       RESOLVE ACTUAL LANGUAGE
    ===================================================== */

    const results =
        initialResults.map(
            (video) => {

                const stats =
                    statisticsMap.get(
                        video.videoId
                    );


                const knownLanguage =
                    getKnownVideoLanguage(
                        video.videoId
                    );


                /*
                 * YouTube's actual metadata.
                 */

                const youtubeLanguage =
                    detectFromYouTubeLanguageCode(
                        stats
                            ?.snippet
                            ?.defaultAudioLanguage
                    ) ||
                    detectFromYouTubeLanguageCode(
                        stats
                            ?.snippet
                            ?.defaultLanguage
                    );


                /*
                 * Detect from title,
                 * description and channel.
                 */

                const textLanguage =
                    detectCourseLanguageFromText(
                        video.title,
                        video.description,
                        video.channelName
                    );


                /*
                 * Priority:
                 *
                 * 1. Manual override
                 * 2. YouTube language metadata
                 * 3. Script/text detection
                 * 4. Unknown
                 */

                const actualLanguage =
                    knownLanguage ||
                    youtubeLanguage ||
                    textLanguage ||
                    "Unknown";


                return {

                    ...video,

                    language:
                        actualLanguage,
                };
            }
        );


    console.log(
        "YouTube detected languages:",
        results.map(
            (video) => ({
                title:
                    video.title,

                language:
                    video.language,
            })
        )
    );


    /* =====================================================
       FILTER RESULTS
    ===================================================== */

    const relevantResults =
        results.filter(
            (video) => {

                /* =========================================
              FAKE / TOO SHORT FULL COURSE
           ========================================= */

                const stats =
                    statisticsMap.get(
                        video.videoId
                    );

                if (
                    isFakeFullCourse(
                        video.title,
                        stats?.contentDetails?.duration || ""
                    )
                ) {

                    return false;
                }


                /* =========================================
                   BAD CONTENT
                ========================================= */

                if (
                    isBadVideo(
                        video.title,
                        video.description
                    )
                ) {

                    return false;
                }


                /* =========================================
                   RELEVANCE
                ========================================= */

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


                /* =========================================
                   COURSE SIGNAL
                ========================================= */

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


                /* =========================================
                   LANGUAGE HARD FILTER
                ========================================= */

                const actualLanguage =
                    normalizeLanguage(
                        video.language
                    );


                /*
                 * NEVER allow unknown.
                 */

                if (
                    actualLanguage === "" ||
                    actualLanguage === "unknown"
                ) {

                    console.log(
                        `[REMOVE - UNKNOWN LANGUAGE] ${video.title}`
                    );

                    return false;
                }


                /*
                 * ENGLISH SEARCH
                 *
                 * Only English.
                 *
                 * This is the important part that prevents
                 * Tamil, Telugu, Kannada, Malayalam, etc.
                 * from appearing in English search.
                 */

                if (
                    language === "english"
                ) {

                    if (
                        actualLanguage !== "english"
                    ) {

                        console.log(
                            `[REMOVE - NON-ENGLISH] ${video.title} -> ${video.language}`
                        );

                        return false;
                    }
                }


                /*
                 * HINDI SEARCH
                 *
                 * Only Hindi.
                 */

                if (
                    language === "hindi"
                ) {

                    if (
                        actualLanguage !== "hindi"
                    ) {

                        console.log(
                            `[REMOVE - NON-HINDI] ${video.title} -> ${video.language}`
                        );

                        return false;
                    }
                }


                console.log(
                    `[KEEP - ${preferredLanguage}] ${video.title}`
                );


                return true;
            }
        );


    console.log(
        "YouTube relevant results:",
        relevantResults.length
    );


    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

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


/* =========================================================
   GET VIDEO STATISTICS
========================================================= */

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


    /* =====================================================
       CHUNK IDS
       MAX 50 PER REQUEST
    ===================================================== */

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
            "snippet,statistics,contentDetails"
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


/* =========================================================
   FORMAT YOUTUBE DURATION
========================================================= */

export function formatYouTubeDuration(
    isoDuration: string
): string {

    if (
        !isoDuration
    ) {

        return "Unknown";
    }


    const match =
        isoDuration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );


    if (
        !match
    ) {

        return "Unknown";
    }


    const hours =
        Number(
            match[1] || 0
        );

    const minutes =
        Number(
            match[2] || 0
        );

    const seconds =
        Number(
            match[3] || 0
        );


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


/* =========================================================
   GET DURATION SECONDS
========================================================= */

export function getDurationSeconds(
    isoDuration: string
): number {

    if (
        !isoDuration
    ) {

        return 0;
    }


    const match =
        isoDuration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
        );


    if (
        !match
    ) {

        return 0;
    }


    const hours =
        Number(
            match[1] || 0
        );

    const minutes =
        Number(
            match[2] || 0
        );

    const seconds =
        Number(
            match[3] || 0
        );


    return (
        hours * 60 * 60 +
        minutes * 60 +
        seconds
    );
}

/* =========================================================
   CHECK FAKE / TOO SHORT FULL COURSES
========================================================= */

function isFakeFullCourse(
    title: string,
    isoDuration: string
): boolean {

    const normalizedTitle =
        normalizeText(title);

    const durationSeconds =
        getDurationSeconds(isoDuration);

    /*
     * Videos claiming to be a full/complete course
     * must have a reasonable duration.
     *
     * Anything below 30 minutes is rejected.
     */

    const claimsFullCourse =
        normalizedTitle.includes("full course") ||
        normalizedTitle.includes("complete course") ||
        normalizedTitle.includes("full tutorial") ||
        normalizedTitle.includes("complete tutorial") ||
        normalizedTitle.includes("full programming course") ||
        normalizedTitle.includes("complete programming course") ||
        normalizedTitle.includes("all in one") ||
        normalizedTitle.includes("zero to hero") ||
        normalizedTitle.includes("learn from scratch") ||
        normalizedTitle.includes("from scratch");

    if (
        claimsFullCourse &&
        durationSeconds > 0 &&
        durationSeconds < 30 * 60
    ) {

        console.log(
            `[REMOVE - FAKE FULL COURSE] ${title} -> ${formatYouTubeDuration(isoDuration)}`
        );

        return true;
    }

    return false;
}