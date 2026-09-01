export type CourseType = "VIDEO" | "PLAYLIST";

export type YouTubePlaylistLesson = {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelName: string;
    publishedAt: string;
    duration: string;
    durationSeconds: number;
};

export type YouTubeCourseResult = {
    courseType: CourseType;

    videoId: string;

    playlistId?: string;

    title: string;

    description: string;

    thumbnail: string;

    channelName: string;

    publishedAt: string;

    language: string;

    duration?: string;

    durationSeconds?: number;

    views?: number;

    likes?: number;

    lessons?: YouTubePlaylistLesson[];
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

type YouTubePlaylistItem = {
    snippet?: {
        title?: string;

        description?: string;

        channelTitle?: string;

        publishedAt?: string;

        thumbnails?: {
            high?: {
                url?: string;
            };

            medium?: {
                url?: string;
            };

            default?: {
                url?: string;
            };
        };

        resourceId?: {
            videoId?: string;
        };
    };

    contentDetails?: {
        videoId?: string;
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

    return (
        languageMap[normalized] ||
        "Unknown"
    );
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

    const checks = [
        {
            pattern: "#shorts",
            reason: "SHORTS",
        },

        {
            pattern: "youtube shorts",
            reason: "SHORTS",
        },

        {
            pattern: "short video",
            reason: "SHORTS",
        },

        {
            pattern: "salary of",
            reason: "CAREER",
        },

        {
            pattern: "salary",
            reason: "CAREER",
        },

        {
            pattern: "earnings",
            reason: "CAREER",
        },

        {
            pattern: "earning potential",
            reason: "CAREER",
        },

        {
            pattern: "how much does",
            reason: "CAREER",
        },

        {
            pattern: "how much can you earn",
            reason: "CAREER",
        },

        {
            pattern: "career opportunities",
            reason: "CAREER",
        },

        {
            pattern: "career path",
            reason: "CAREER",
        },

        {
            pattern: "career roadmap",
            reason: "CAREER",
        },

        {
            pattern: "job opportunities",
            reason: "CAREER",
        },

        {
            pattern: "job market",
            reason: "CAREER",
        },

        {
            pattern: "future scope",
            reason: "CAREER",
        },

        {
            pattern: "future of",
            reason: "CAREER",
        },

        {
            pattern: "is it worth learning",
            reason: "CAREER",
        },

        {
            pattern: "is it worth it",
            reason: "CAREER",
        },

        {
            pattern: "worth learning",
            reason: "CAREER",
        },

        {
            pattern: "should you learn",
            reason: "CAREER",
        },

        {
            pattern: "roadmap",
            reason: "ROADMAP",
        },

        {
            pattern: "road map",
            reason: "ROADMAP",
        },

        {
            pattern: "learning path",
            reason: "ROADMAP",
        },

        {
            pattern: "study plan",
            reason: "ROADMAP",
        },

        {
            pattern: "interview questions",
            reason: "INTERVIEW",
        },

        {
            pattern: "interview preparation",
            reason: "INTERVIEW",
        },

        {
            pattern: "interview prep",
            reason: "INTERVIEW",
        },

        {
            pattern: "coding interview",
            reason: "INTERVIEW",
        },

        {
            pattern: "technical interview",
            reason: "INTERVIEW",
        },

        {
            pattern: "placement preparation",
            reason: "INTERVIEW",
        },

        {
            pattern: "placement prep",
            reason: "INTERVIEW",
        },

        {
            pattern: " vs ",
            reason: "COMPARISON",
        },

        {
            pattern: " versus ",
            reason: "COMPARISON",
        },

        {
            pattern: "comparison",
            reason: "COMPARISON",
        },

        {
            pattern: "compare ",
            reason: "COMPARISON",
        },

        {
            pattern: "which is better",
            reason: "COMPARISON",
        },

        {
            pattern: "which one is better",
            reason: "COMPARISON",
        },

        {
            pattern: "difference between",
            reason: "COMPARISON",
        },

        {
            pattern: "course review",
            reason: "REVIEW",
        },

        {
            pattern: "course reviews",
            reason: "REVIEW",
        },

        {
            pattern: "tutorial review",
            reason: "REVIEW",
        },

        {
            pattern: "course feedback",
            reason: "REVIEW",
        },

        {
            pattern: "review of",
            reason: "REVIEW",
        },
    ];

    for (
        const item of checks
    ) {
        if (
            normalizedTitle.includes(
                item.pattern
            )
        ) {
            console.log(
                `[REMOVE - ${item.reason}] ${title} -> ${item.pattern}`
            );

            return true;
        }
    }


    /* =====================================================
       TITLE BASED SHORT CONTENT
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
        const pattern of
        shortDurationPatterns
    ) {
        if (
            normalizedTitle.includes(
                pattern
            )
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
        normalizedTitle.includes(
            "full course"
        ) ||
        normalizedTitle.includes(
            "complete course"
        ) ||
        normalizedTitle.includes(
            "full tutorial"
        ) ||
        normalizedTitle.includes(
            "complete tutorial"
        );

    for (
        const pattern of
        introductionPatterns
    ) {
        if (
            normalizedTitle.startsWith(
                pattern
            ) &&
            !hasFullCourseSignal
        ) {
            console.log(
                `[REMOVE - INTRO ONLY] ${title} -> ${pattern}`
            );

            return true;
        }
    }


    /* =====================================================
       PURE SINGLE TOPIC
    ===================================================== */

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

    for (
        const pattern of
        singleTopicPatterns
    ) {
        if (
            normalizedTitle ===
            pattern
        ) {
            console.log(
                `[REMOVE - SINGLE TOPIC] ${title}`
            );

            return true;
        }
    }


    void normalizedDescription;

    return false;
}


/* =========================================================
   COURSE SIGNAL
========================================================= */

function hasCourseSignal(
    title: string,
    description: string
): boolean {
    const text =
        `${normalizeText(title)} ${normalizeText(description)}`;

    const patterns = [
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
        "masterclass",
        "bootcamp",
    ];

    return patterns.some(
        (pattern) =>
            text.includes(pattern)
    );
}


/* =========================================================
   PLAYLIST COURSE SIGNAL
========================================================= */

function hasPlaylistCourseSignal(
    title: string,
    description: string
): boolean {
    const text =
        `${normalizeText(title)} ${normalizeText(description)}`;

    const playlistSignals = [
        "course playlist",
        "complete playlist",
        "full playlist",
        "tutorial playlist",
        "course series",
        "tutorial series",
        "complete series",
        "full series",
        "playlist",
        "masterclass",
        "bootcamp",
        "from scratch",
        "zero to hero",
        "full course",
        "complete course",
    ];

    return playlistSignals.some(
        (pattern) =>
            text.includes(pattern)
    );
}


/* =========================================================
   COURSE RELEVANCE
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


    /* C++ */

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
            /\bcpp\b/i.test(
                normalizedTitle
            ) ||
            normalizedTitle.includes(
                "c plus plus"
            ) ||
            normalizedDescription.includes(
                "c++"
            ) ||
            normalizedDescription.includes(
                "c ++"
            ) ||
            normalizedDescription.includes(
                "c/c++"
            ) ||
            /\bcpp\b/i.test(
                normalizedDescription
            ) ||
            normalizedDescription.includes(
                "c plus plus"
            )
        );
    }


    /* C */

    if (
        normalizedQuery === "c" ||
        normalizedQuery === "c programming"
    ) {
        return (
            /\bc programming\b/i.test(
                text
            ) ||
            /\bc language\b/i.test(
                text
            ) ||
            /\bc programming language\b/i.test(
                text
            )
        );
    }


    /* JAVA */

    if (
        normalizedQuery === "java"
    ) {
        return (
            /\bjava\b/i.test(text) &&
            !/\bjavascript\b/i.test(text)
        );
    }


    /* JAVASCRIPT */

    if (
        normalizedQuery ===
            "javascript" ||
        normalizedQuery ===
            "java script" ||
        normalizedQuery === "js"
    ) {
        return (
            /\bjavascript\b/i.test(text) ||
            /\bjava script\b/i.test(text) ||
            /\becmascript\b/i.test(text)
        );
    }


    /* TYPESCRIPT */

    if (
        normalizedQuery ===
            "typescript" ||
        normalizedQuery ===
            "type script" ||
        normalizedQuery === "ts"
    ) {
        return (
            /\btypescript\b/i.test(text) ||
            /\btype script\b/i.test(text)
        );
    }


    /* PYTHON */

    if (
        normalizedQuery ===
            "python" ||
        normalizedQuery === "py"
    ) {
        return /\bpython\b/i.test(
            text
        );
    }


    /* REACT */

    if (
        normalizedQuery ===
            "react" ||
        normalizedQuery ===
            "reactjs"
    ) {
        return (
            /\breact\b/i.test(text) ||
            /\breactjs\b/i.test(text)
        );
    }


    /* PHP */

    if (
        normalizedQuery === "php"
    ) {
        return /\bphp\b/i.test(
            text
        );
    }


    /* MERN */

    if (
        normalizedQuery ===
            "mern" ||
        normalizedQuery ===
            "mern stack"
    ) {
        return (
            /\bmern\b/i.test(text) ||
            /\bmern stack\b/i.test(text)
        );
    }


    /* SQL */

    if (
        normalizedQuery === "sql"
    ) {
        return /\bsql\b/i.test(
            text
        );
    }


    /* HTML */

    if (
        normalizedQuery === "html" ||
        normalizedQuery === "html5"
    ) {
        return (
            /\bhtml\b/i.test(text) ||
            /\bhtml5\b/i.test(text)
        );
    }


    /* CSS */

    if (
        normalizedQuery === "css" ||
        normalizedQuery === "css3"
    ) {
        return (
            /\bcss\b/i.test(text) ||
            /\bcss3\b/i.test(text)
        );
    }


    /* NODE */

    if (
        normalizedQuery === "node" ||
        normalizedQuery ===
            "nodejs" ||
        normalizedQuery ===
            "node.js"
    ) {
        return (
            /\bnode\.?js\b/i.test(text) ||
            /\bnode js\b/i.test(text)
        );
    }


    /* MONGODB */

    if (
        normalizedQuery ===
            "mongodb" ||
        normalizedQuery ===
            "mongo db"
    ) {
        return (
            /\bmongodb\b/i.test(text) ||
            /\bmongo db\b/i.test(text)
        );
    }


    /* EXPRESS */

    if (
        normalizedQuery ===
            "express" ||
        normalizedQuery ===
            "expressjs"
    ) {
        return (
            /\bexpress\.?js\b/i.test(text) ||
            /\bexpress js\b/i.test(text)
        );
    }


    /* NORMAL */

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
   CREATE SEARCH QUERY
========================================================= */

function createYouTubeSearchQuery(
    query: string
): string {
    const normalizedQuery =
        normalizeQuery(query);

    if (
        normalizedQuery === "c++" ||
        normalizedQuery === "cpp" ||
        normalizedQuery === "c ++" ||
        normalizedQuery === "c plus plus"
    ) {
        return `"C++" programming full course`;
    }

    if (
        normalizedQuery === "c" ||
        normalizedQuery === "c programming"
    ) {
        return `"C programming" full course`;
    }

    if (
        normalizedQuery === "java"
    ) {
        return `"Java programming" full course`;
    }

    if (
        normalizedQuery ===
            "javascript" ||
        normalizedQuery ===
            "java script" ||
        normalizedQuery === "js"
    ) {
        return `"JavaScript" full course`;
    }

    if (
        normalizedQuery ===
            "typescript" ||
        normalizedQuery ===
            "type script" ||
        normalizedQuery === "ts"
    ) {
        return `"TypeScript" full course`;
    }

    if (
        normalizedQuery === "python" ||
        normalizedQuery === "py"
    ) {
        return `"Python" full course`;
    }

    if (
        normalizedQuery === "react" ||
        normalizedQuery === "reactjs"
    ) {
        return `"React JS" full course`;
    }

    if (
        normalizedQuery === "php"
    ) {
        return `"PHP" full course tutorial`;
    }

    if (
        normalizedQuery === "mern" ||
        normalizedQuery ===
            "mern stack"
    ) {
        return `"MERN Stack" full course tutorial`;
    }

    if (
        normalizedQuery === "sql"
    ) {
        return `"SQL" full course tutorial`;
    }

    if (
        normalizedQuery === "node" ||
        normalizedQuery ===
            "nodejs" ||
        normalizedQuery ===
            "node.js"
    ) {
        return `"Node.js" full course`;
    }

    if (
        normalizedQuery ===
            "mongodb" ||
        normalizedQuery ===
            "mongo db"
    ) {
        return `"MongoDB" full course`;
    }

    return `"${query}" full course tutorial`;
}


/* =========================================================
   KNOWN LANGUAGE OVERRIDES
========================================================= */

const KNOWN_VIDEO_LANGUAGE_OVERRIDES:
    Record<string, string> = {
        hlGoQC332VM: "Hindi",
    };


/* =========================================================
   GET KNOWN VIDEO LANGUAGE
========================================================= */

export function getKnownVideoLanguage(
    videoId: string
): string | null {
    return (
        KNOWN_VIDEO_LANGUAGE_OVERRIDES[
            videoId
        ] ||
        null
    );
}


/* =========================================================
   DETECT LANGUAGE FROM YOUTUBE CODE
========================================================= */

function detectFromYouTubeLanguageCode(
    languageCode:
        | string
        | null
        | undefined
): string | null {
    if (!languageCode) {
        return null;
    }

    const language =
        normalizeLanguage(
            languageCode
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
            language
        )
    ) {
        return displayLanguage(
            language
        );
    }

    return null;
}


/* =========================================================
   DETECT INDIAN SCRIPT
========================================================= */

function detectIndianScriptLanguage(
    text: string
): string | null {
    if (
        /[\u0900-\u097F]/.test(
            text
        )
    ) {
        if (
            /\b(आहे|आणि|मध्ये|करण्यासाठी|मराठी)\b/.test(
                text
            )
        ) {
            return "Marathi";
        }

        if (
            /\b(नेपाली|छ|छन्|लाई|बाट|को)\b/.test(
                text
            )
        ) {
            return "Nepali";
        }

        return "Hindi";
    }

    if (
        /[\u0B80-\u0BFF]/.test(
            text
        )
    ) {
        return "Tamil";
    }

    if (
        /[\u0C00-\u0C7F]/.test(
            text
        )
    ) {
        return "Telugu";
    }

    if (
        /[\u0C80-\u0CFF]/.test(
            text
        )
    ) {
        return "Kannada";
    }

    if (
        /[\u0D00-\u0D7F]/.test(
            text
        )
    ) {
        return "Malayalam";
    }

    if (
        /[\u0980-\u09FF]/.test(
            text
        )
    ) {
        return "Bengali";
    }

    if (
        /[\u0A80-\u0AFF]/.test(
            text
        )
    ) {
        return "Gujarati";
    }

    if (
        /[\u0A00-\u0A7F]/.test(
            text
        )
    ) {
        return "Punjabi";
    }

    if (
        /[\u0B00-\u0B7F]/.test(
            text
        )
    ) {
        return "Odia";
    }

    if (
        /[\u0600-\u06FF]/.test(
            text
        )
    ) {
        return "Urdu";
    }

    return null;
}


/* =========================================================
   DETECT COURSE LANGUAGE FROM TEXT
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

    const scriptLanguage =
        detectIndianScriptLanguage(
            combinedText
        );

    if (
        scriptLanguage
    ) {
        return scriptLanguage;
    }

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

    if (
        hindiSignals.some(
            (signal) =>
                titleText.includes(
                    signal
                ) ||
                descriptionText.includes(
                    signal
                )
        )
    ) {
        return "Hindi";
    }

    const englishSignals = [
        "english",
        "in english",
        "english tutorial",
        "english course",
        "english language",
    ];

    if (
        englishSignals.some(
            (signal) =>
                titleText.includes(
                    signal
                ) ||
                descriptionText.includes(
                    signal
                )
        )
    ) {
        return "English";
    }

    return null;
}


/* =========================================================
   RESOLVE VIDEO LANGUAGE
========================================================= */

export function resolveVideoLanguage(
    storedLanguage:
        | string
        | null
        | undefined,
    youtubeLanguageCode?:
        | string
        | null
): string {
    const youtubeLanguage =
        detectFromYouTubeLanguageCode(
            youtubeLanguageCode
        );

    if (
        youtubeLanguage
    ) {
        return youtubeLanguage;
    }

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

    if (!match) {
        return 0;
    }

    return (
        Number(match[1] || 0) * 60 * 60 +
        Number(match[2] || 0) * 60 +
        Number(match[3] || 0)
    );
}


/* =========================================================
   FAKE FULL COURSE CHECK
========================================================= */

function isFakeFullCourse(
    title: string,
    isoDuration: string
): boolean {
    const normalizedTitle =
        normalizeText(title);

    const durationSeconds =
        getDurationSeconds(
            isoDuration
        );

    const claimsFullCourse =
        normalizedTitle.includes(
            "full course"
        ) ||
        normalizedTitle.includes(
            "complete course"
        ) ||
        normalizedTitle.includes(
            "full tutorial"
        ) ||
        normalizedTitle.includes(
            "complete tutorial"
        ) ||
        normalizedTitle.includes(
            "full programming course"
        ) ||
        normalizedTitle.includes(
            "complete programming course"
        ) ||
        normalizedTitle.includes(
            "all in one"
        ) ||
        normalizedTitle.includes(
            "zero to hero"
        ) ||
        normalizedTitle.includes(
            "learn from scratch"
        ) ||
        normalizedTitle.includes(
            "from scratch"
        );

    if (
        claimsFullCourse &&
        durationSeconds > 0 &&
        durationSeconds <
            30 * 60
    ) {
        console.log(
            `[REMOVE - FAKE FULL COURSE] ${title} -> ${formatYouTubeDuration(
                isoDuration
            )}`
        );

        return true;
    }

    return false;
}


/* =========================================================
   GET VIDEO STATISTICS
========================================================= */

export async function getYouTubeVideoStatistics(
    videoIds: string[]
): Promise<
    YouTubeVideoStatistics[]
> {
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

    const allStatistics:
        YouTubeVideoStatistics[] = [];

    for (
        let i = 0;
        i < videoIds.length;
        i += 50
    ) {
        const chunk =
            videoIds.slice(
                i,
                i + 50
            );

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

        if (
            !response.ok
        ) {
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
   GET PLAYLIST ITEMS
========================================================= */

async function getYouTubePlaylistItems(
    playlistId: string
): Promise<
    YouTubePlaylistItem[]
> {
    const apiKey =
        process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "YOUTUBE_API_KEY is not configured"
        );
    }

    const items:
        YouTubePlaylistItem[] = [];

    let pageToken = "";

    /*
     * Safety limit.
     *
     * Most educational playlists are well
     * below this. It also prevents an accidental
     * giant playlist from creating hundreds of
     * lessons/API requests.
     */

    const maxLessons = 200;

    while (
        items.length <
        maxLessons
    ) {
        const url =
            new URL(
                "https://www.googleapis.com/youtube/v3/playlistItems"
            );

        url.searchParams.set(
            "part",
            "snippet,contentDetails"
        );

        url.searchParams.set(
            "playlistId",
            playlistId
        );

        url.searchParams.set(
            "maxResults",
            "50"
        );

        url.searchParams.set(
            "key",
            apiKey
        );

        if (
            pageToken
        ) {
            url.searchParams.set(
                "pageToken",
                pageToken
            );
        }

        const response =
            await fetch(
                url.toString(),
                {
                    cache: "no-store",
                }
            );

        if (
            !response.ok
        ) {
            const error =
                await response.text();

            console.error(
                "YouTube playlist items error:",
                error
            );

            break;
        }

        const data =
            await response.json();

        items.push(
            ...(data.items || [])
        );

        pageToken =
            data.nextPageToken ||
            "";

        if (
            !pageToken
        ) {
            break;
        }
    }

    return items.slice(
        0,
        maxLessons
    );
}


/* =========================================================
   THUMBNAIL
========================================================= */

function getThumbnail(
    snippet: any
): string {
    return (
        snippet?.thumbnails?.high?.url ||
        snippet?.thumbnails?.medium?.url ||
        snippet?.thumbnails?.default?.url ||
        ""
    );
}


/* =========================================================
   PLAYLIST LANGUAGE
========================================================= */

function determinePlaylistLanguage(
    playlistTitle: string,
    playlistDescription: string,
    channelName: string,
    playlistLessons:
        YouTubePlaylistLesson[],
    statisticsMap:
        Map<
            string,
            YouTubeVideoStatistics
        >
): string {
    const textLanguage =
        detectCourseLanguageFromText(
            playlistTitle,
            playlistDescription,
            channelName
        );

    if (
        textLanguage
    ) {
        return textLanguage;
    }

    const detectedLanguages:
        string[] = [];

    for (
        const lesson of
        playlistLessons.slice(
            0,
            10
        )
    ) {
        const stats =
            statisticsMap.get(
                lesson.videoId
            );

        const language =
            detectFromYouTubeLanguageCode(
                stats
                    ?.snippet
                    ?.defaultAudioLanguage
            ) ||
            detectFromYouTubeLanguageCode(
                stats
                    ?.snippet
                    ?.defaultLanguage
            ) ||
            detectCourseLanguageFromText(
                lesson.title,
                lesson.description,
                lesson.channelName
            );

        if (
            language
        ) {
            detectedLanguages.push(
                language
            );
        }
    }

    if (
        detectedLanguages.length === 0
    ) {
        return "Unknown";
    }

    const counts =
        new Map<
            string,
            number
        >();

    for (
        const language of
        detectedLanguages
    ) {
        counts.set(
            language,
            (counts.get(
                language
            ) || 0) + 1
        );
    }

    return [
        ...counts.entries(),
    ].sort(
        (a, b) =>
            b[1] - a[1]
    )[0][0];
}


/* =========================================================
   BUILD TOTAL DURATION ISO
========================================================= */

function secondsToIsoDuration(
    totalSeconds: number
): string {
    const safeSeconds =
        Math.max(
            0,
            Math.floor(
                totalSeconds
            )
        );

    const hours =
        Math.floor(
            safeSeconds / 3600
        );

    const minutes =
        Math.floor(
            (safeSeconds % 3600) /
                60
        );

    const seconds =
        safeSeconds % 60;

    return `PT${hours}H${minutes}M${seconds}S`;
}


/* =========================================================
   SEARCH YOUTUBE COURSES
========================================================= */

export async function searchYouTubeCourses(
    query: string,
    preferredLanguage:
        string = "English"
): Promise<
    YouTubeCourseResult[]
> {
    const apiKey =
        process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "YOUTUBE_API_KEY is not configured"
        );
    }

    const language =
        normalizeLanguage(
            preferredLanguage
        );

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

    let languageQuery =
        createYouTubeSearchQuery(
            query
        );

    if (
        language === "hindi"
    ) {
        languageQuery +=
            " Hindi";
    }

    if (
        language === "english"
    ) {
        languageQuery +=
            " English";
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
       IMPORTANT

       type is intentionally NOT set.

       This lets one search.list call return:
       - videos
       - playlists
       - channels

       We then ignore channels.

       This is much better for quota than
       performing separate video + playlist searches.
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
        "maxResults",
        "50"
    );

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

    if (
        !response.ok
    ) {
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

    const rawItems =
        Array.isArray(
            data.items
        )
            ? data.items
            : [];

    const rawVideoItems =
        rawItems.filter(
            (item: any) =>
                item.id?.videoId &&
                item.snippet
        );

    const rawPlaylistItems =
        rawItems.filter(
            (item: any) =>
                item.id?.playlistId &&
                item.snippet
        );

    console.log(
        "YouTube raw videos:",
        rawVideoItems.length
    );

    console.log(
        "YouTube raw playlists:",
        rawPlaylistItems.length
    );


    /* =====================================================
       VIDEO METADATA
    ===================================================== */

    const videoIds =
        rawVideoItems.map(
            (item: any) =>
                item.id.videoId
        );

    const videoStatistics =
        await getYouTubeVideoStatistics(
            videoIds
        );

    const videoStatisticsMap =
        new Map(
            videoStatistics.map(
                (item) => [
                    item.id,
                    item,
                ]
            )
        );


    const results:
        YouTubeCourseResult[] = [];


    /* =====================================================
       PROCESS VIDEO COURSES
    ===================================================== */

    for (
        const item of
        rawVideoItems
    ) {
        const videoId =
            item.id.videoId;

        const title =
            item.snippet.title ||
            "";

        const description =
            item.snippet.description ||
            "";

        const channelName =
            item.snippet.channelTitle ||
            "";

        const stats =
            videoStatisticsMap.get(
                videoId
            );

        const durationISO =
            stats
                ?.contentDetails
                ?.duration || "";

        const knownLanguage =
            getKnownVideoLanguage(
                videoId
            );

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

        const textLanguage =
            detectCourseLanguageFromText(
                title,
                description,
                channelName
            );

        const actualLanguage =
            knownLanguage ||
            youtubeLanguage ||
            textLanguage ||
            "Unknown";


        if (
            isFakeFullCourse(
                title,
                durationISO
            )
        ) {
            continue;
        }

        if (
            isBadVideo(
                title,
                description
            )
        ) {
            continue;
        }

        if (
            !isRelevantCourse(
                title,
                description,
                query
            )
        ) {
            console.log(
                `[REMOVE - IRRELEVANT] ${title}`
            );

            continue;
        }

        if (
            !hasCourseSignal(
                title,
                description
            )
        ) {
            console.log(
                `[REMOVE - NOT A COURSE] ${title}`
            );

            continue;
        }

        if (
            normalizeLanguage(
                actualLanguage
            ) !== language
        ) {
            console.log(
                `[REMOVE - NON-PREFERRED LANGUAGE] ${title} -> ${actualLanguage}`
            );

            continue;
        }


        results.push({
            courseType:
                "VIDEO",

            videoId,

            title,

            description,

            thumbnail:
                getThumbnail(
                    item.snippet
                ),

            channelName,

            publishedAt:
                item.snippet
                    .publishedAt ||
                "",

            language:
                actualLanguage,

            duration:
                formatYouTubeDuration(
                    durationISO
                ),

            durationSeconds:
                getDurationSeconds(
                    durationISO
                ),

            views:
                Number(
                    stats
                        ?.statistics
                        ?.viewCount ||
                    0
                ),

            likes:
                Number(
                    stats
                        ?.statistics
                        ?.likeCount ||
                    0
                ),
        });
    }


    /* =====================================================
       PROCESS PLAYLIST COURSES
    ===================================================== */

    for (
        const item of
        rawPlaylistItems.slice(
            0,
            10
        )
    ) {
        const playlistId =
            item.id.playlistId;

        const title =
            item.snippet.title ||
            "";

        const description =
            item.snippet.description ||
            "";

        const channelName =
            item.snippet.channelTitle ||
            "";


        if (
            isBadVideo(
                title,
                description
            )
        ) {
            continue;
        }

        if (
            !isRelevantCourse(
                title,
                description,
                query
            )
        ) {
            console.log(
                `[REMOVE - PLAYLIST IRRELEVANT] ${title}`
            );

            continue;
        }

        if (
            !hasPlaylistCourseSignal(
                title,
                description
            )
        ) {
            console.log(
                `[REMOVE - PLAYLIST NOT COURSE] ${title}`
            );

            continue;
        }


        /* =================================================
           GET PLAYLIST LESSONS
        ================================================= */

        const playlistItems =
            await getYouTubePlaylistItems(
                playlistId
            );

        const playlistVideoIds =
            playlistItems
                .map(
                    (playlistItem) =>
                        playlistItem
                            .snippet
                            ?.resourceId
                            ?.videoId ||
                        playlistItem
                            .contentDetails
                            ?.videoId
                )
                .filter(
                    (
                        id
                    ): id is string =>
                        Boolean(id)
                );


        if (
            playlistVideoIds.length === 0
        ) {
            console.log(
                `[REMOVE - EMPTY PLAYLIST] ${title}`
            );

            continue;
        }


        const playlistStatistics =
            await getYouTubeVideoStatistics(
                playlistVideoIds
            );

        const playlistStatisticsMap =
            new Map(
                playlistStatistics.map(
                    (item) => [
                        item.id,
                        item,
                    ]
                )
            );


        const playlistLessons:
            YouTubePlaylistLesson[] = [];

        const seenLessonIds =
            new Set<string>();


        for (
            const playlistItem of
            playlistItems
        ) {
            const lessonVideoId =
                playlistItem
                    .snippet
                    ?.resourceId
                    ?.videoId ||
                playlistItem
                    .contentDetails
                    ?.videoId;

            if (
                !lessonVideoId
            ) {
                continue;
            }

            if (
                seenLessonIds.has(
                    lessonVideoId
                )
            ) {
                continue;
            }

            seenLessonIds.add(
                lessonVideoId
            );


            const lessonTitle =
                playlistItem
                    .snippet
                    ?.title ||
                "Untitled lesson";

            const lessonDescription =
                playlistItem
                    .snippet
                    ?.description ||
                "";

            const lessonChannel =
                playlistItem
                    .snippet
                    ?.channelTitle ||
                channelName;

            const stats =
                playlistStatisticsMap.get(
                    lessonVideoId
                );

            const durationISO =
                stats
                    ?.contentDetails
                    ?.duration ||
                "";


            /*
             * Do not apply isBadVideo()
             * to individual playlist lessons.
             *
             * A valid course can naturally contain
             * lessons named "Part 1", "Introduction",
             * "Getting Started", etc.
             */

            playlistLessons.push({
                videoId:
                    lessonVideoId,

                title:
                    lessonTitle,

                description:
                    lessonDescription,

                thumbnail:
                    playlistItem
                        .snippet
                        ?.thumbnails
                        ?.high
                        ?.url ||
                    playlistItem
                        .snippet
                        ?.thumbnails
                        ?.medium
                        ?.url ||
                    playlistItem
                        .snippet
                        ?.thumbnails
                        ?.default
                        ?.url ||
                    "",

                channelName:
                    lessonChannel,

                publishedAt:
                    playlistItem
                        .snippet
                        ?.publishedAt ||
                    "",

                duration:
                    formatYouTubeDuration(
                        durationISO
                    ),

                durationSeconds:
                    getDurationSeconds(
                        durationISO
                    ),
            });
        }


        if (
            playlistLessons.length === 0
        ) {
            continue;
        }


        /* =================================================
           PLAYLIST LANGUAGE
        ================================================= */

        const playlistLanguage =
            determinePlaylistLanguage(
                title,
                description,
                channelName,
                playlistLessons,
                playlistStatisticsMap
            );


        if (
            normalizeLanguage(
                playlistLanguage
            ) !== language
        ) {
            console.log(
                `[REMOVE - PLAYLIST LANGUAGE] ${title} -> ${playlistLanguage}`
            );

            continue;
        }


        /* =================================================
           TOTAL PLAYLIST DURATION
        ================================================= */

        const totalDurationSeconds =
            playlistLessons.reduce(
                (
                    total,
                    lesson
                ) =>
                    total +
                    lesson.durationSeconds,
                0
            );


        if (
            totalDurationSeconds <= 0
        ) {
            console.log(
                `[REMOVE - PLAYLIST NO DURATION] ${title}`
            );

            continue;
        }


        const totalDurationISO =
            secondsToIsoDuration(
                totalDurationSeconds
            );


        const totalViews =
            playlistLessons.reduce(
                (
                    total,
                    lesson
                ) =>
                    total +
                    Number(
                        playlistStatisticsMap.get(
                            lesson.videoId
                        )
                            ?.statistics
                            ?.viewCount ||
                        0
                    ),
                0
            );


        const totalLikes =
            playlistLessons.reduce(
                (
                    total,
                    lesson
                ) =>
                    total +
                    Number(
                        playlistStatisticsMap.get(
                            lesson.videoId
                        )
                            ?.statistics
                            ?.likeCount ||
                        0
                    ),
                0
            );


        results.push({
            courseType:
                "PLAYLIST",

            videoId:
                "",

            playlistId,

            title,

            description,

            thumbnail:
                getThumbnail(
                    item.snippet
                ),

            channelName,

            publishedAt:
                item.snippet
                    .publishedAt ||
                "",

            language:
                playlistLanguage,

            duration:
                formatYouTubeDuration(
                    totalDurationISO
                ),

            durationSeconds:
                totalDurationSeconds,

            views:
                totalViews,

            likes:
                totalLikes,

            lessons:
                playlistLessons,
        });
    }


    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const uniqueResults =
        Array.from(
            new Map(
                results.map(
                    (course) => {
                        const key =
                            course.courseType ===
                                "PLAYLIST"
                                ? `playlist:${course.playlistId}`
                                : `video:${course.videoId}`;

                        return [
                            key,
                            course,
                        ];
                    }
                )
            ).values()
        );


    console.log(
        "YouTube final results:",
        uniqueResults.length
    );

    console.log(
        "Videos:",
        uniqueResults.filter(
            (item) =>
                item.courseType ===
                "VIDEO"
        ).length
    );

    console.log(
        "Playlists:",
        uniqueResults.filter(
            (item) =>
                item.courseType ===
                "PLAYLIST"
        ).length
    );


    return uniqueResults;
}