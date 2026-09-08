import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { fetchTranscript } from "youtube-transcript";

import { db } from "@/db";
import {
    aiNotes,
    courses,
    lessons,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const NVIDIA_API_URL =
    "https://integrate.api.nvidia.com/v1/chat/completions";

const DEFAULT_MODEL =
    "nvidia/nemotron-3.5-lightning-30b-a3b";

/* =========================================================
   CLEAN AI OUTPUT
========================================================= */

function cleanGeneratedNotes(
    content: string
): string {
    let cleaned =
        content.trim();

    /*
     * Remove reasoning/thinking that
     * accidentally appears before notes.
     */

    const lessonSummaryIndex =
        cleaned.indexOf(
            "## Lesson Summary"
        );

    if (
        lessonSummaryIndex > 0
    ) {
        cleaned =
            cleaned.slice(
                lessonSummaryIndex
            );
    }

    /*
     * Remove accidental meta sections.
     */

    const unwantedSections = [
        "## Check against constraints",
        "## Constraint Check",
        "## Analysis",
        "## Thinking Process",
        "## Reasoning",
        "## Let's analyze",
        "## Analysis of the user input",
    ];

    for (
        const section of
            unwantedSections
    ) {
        const index =
            cleaned.indexOf(
                section
            );

        if (index >= 0) {
            cleaned =
                cleaned
                    .slice(
                        0,
                        index
                    )
                    .trim();
        }
    }

    return cleaned.trim();
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(
    data: unknown
): string {
    if (
        typeof data ===
            "object" &&
        data !== null &&
        "error" in data
    ) {
        const error =
            (
                data as {
                    error?: unknown;
                }
            ).error;

        if (
            typeof error ===
                "object" &&
            error !== null &&
            "message" in error
        ) {
            const message =
                (
                    error as {
                        message?: unknown;
                    }
                ).message;

            if (
                typeof message ===
                "string"
            ) {
                return message;
            }
        }

        if (
            typeof error ===
            "string"
        ) {
            return error;
        }
    }

    return "NVIDIA AI request failed";
}

/* =========================================================
   TRANSCRIPT TYPE
========================================================= */

type TranscriptItem = {
    text?: string;
    duration?: number;
    offset?: number;
};

/* =========================================================
   GET YOUTUBE TRANSCRIPT
========================================================= */

async function getYouTubeTranscript(
    videoUrl: string
): Promise<string> {
    if (!videoUrl?.trim()) {
        throw new Error(
            "This lesson does not have a YouTube video URL."
        );
    }

    const transcript =
        (await fetchTranscript(
            videoUrl
        )) as TranscriptItem[];

    if (
        !Array.isArray(
            transcript
        ) ||
        transcript.length === 0
    ) {
        throw new Error(
            "No YouTube transcript is available for this lesson."
        );
    }

    const transcriptText =
        transcript
            .map(
                (
                    item,
                    index
                ) => {
                    const text =
                        item?.text?.trim();

                    if (!text) {
                        return "";
                    }

                    /*
                     * Keep timestamps so the AI
                     * understands the lesson flow.
                     */

                    const offset =
                        Number(
                            item?.offset ??
                                0
                        );

                    const minutes =
                        Math.floor(
                            offset /
                                60
                        );

                    const seconds =
                        Math.floor(
                            offset %
                                60
                        );

                    const timestamp =
                        `${String(
                            minutes
                        ).padStart(
                            2,
                            "0"
                        )}:${String(
                            seconds
                        ).padStart(
                            2,
                            "0"
                        )}`;

                    return `[${timestamp}] ${text}`;
                }
            )
            .filter(Boolean)
            .join("\n");

    if (
        !transcriptText.trim()
    ) {
        throw new Error(
            "The YouTube transcript was empty."
        );
    }

    return transcriptText.trim();
}

/* =========================================================
   GET SHARED AI NOTES
========================================================= */

export async function GET(
    request: Request
) {
    try {
        const user =
            await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Authentication required",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            searchParams,
        } =
            new URL(
                request.url
            );

        const lessonId =
            Number.parseInt(
                searchParams.get(
                    "lessonId"
                ) || "",
                10
            );

        if (
            !Number.isInteger(
                lessonId
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid lessonId",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * IMPORTANT:
         *
         * Notes are shared by lesson.
         * We DO NOT filter by userId.
         */

        const [
            note,
        ] = await db
            .select()
            .from(aiNotes)
            .where(
                eq(
                    aiNotes.lessonId,
                    lessonId
                )
            )
            .limit(1);

        return NextResponse.json({
            note:
                note ?? null,
        });
    } catch (error) {
        console.error(
            "AI Notes GET error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to load AI notes",
            },
            {
                status: 500,
            }
        );
    }
}

/* =========================================================
   GENERATE AI NOTES
========================================================= */

export async function POST(
    request: Request
) {
    try {
        /* =====================================================
           AUTHENTICATION
        ===================================================== */

        const user =
            await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Authentication required",
                },
                {
                    status: 401,
                }
            );
        }

        /* =====================================================
           REQUEST BODY
        ===================================================== */

        const body =
            await request.json();

        const lessonId =
            Number(
                body?.lessonId
            );

        if (
            !Number.isInteger(
                lessonId
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid lessonId",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CHECK EXISTING NOTE
           
           If a note already exists:
           
           - Don't call YouTube
           - Don't call NVIDIA
           - Don't regenerate
           - Don't update
           
           Return the existing shared note.
        ===================================================== */

        const [
            existingNote,
        ] = await db
            .select()
            .from(aiNotes)
            .where(
                eq(
                    aiNotes.lessonId,
                    lessonId
                )
            )
            .limit(1);

        if (existingNote) {
            return NextResponse.json({
                note:
                    existingNote,
                alreadyExists:
                    true,
            });
        }

        /* =====================================================
           GET LESSON
        ===================================================== */

        const [
            lesson,
        ] = await db
            .select()
            .from(lessons)
            .where(
                eq(
                    lessons.id,
                    lessonId
                )
            )
            .limit(1);

        if (!lesson) {
            return NextResponse.json(
                {
                    error:
                        "Lesson not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* =====================================================
           GET COURSE
        ===================================================== */

        const [
            course,
        ] = await db
            .select({
                id:
                    courses.id,

                title:
                    courses.title,
            })
            .from(courses)
            .where(
                eq(
                    courses.id,
                    lesson.courseId
                )
            )
            .limit(1);

        if (!course) {
            return NextResponse.json(
                {
                    error:
                        "Course not found",
                },
                {
                    status: 404,
                }
            );
        }

        /* =====================================================
           YOUTUBE TRANSCRIPT
        ===================================================== */

        let transcript: string;

        try {
            transcript =
                await getYouTubeTranscript(
                    lesson.videoUrl ||
                        ""
                );
        } catch (error) {
            console.error(
                "YouTube transcript error:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        error instanceof
                        Error
                            ? error.message
                            : "Unable to retrieve the YouTube transcript.",
                },
                {
                    status: 422,
                }
            );
        }

        /* =====================================================
           NVIDIA API KEY
        ===================================================== */

        const apiKey =
            process.env
                .NVIDIA_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "NVIDIA_API_KEY is not configured. Add it to .env.local.",
                },
                {
                    status: 500,
                }
            );
        }

        /* =====================================================
           MODEL
        ===================================================== */

        const model =
            process.env
                .NVIDIA_NIM_MODEL ||
            DEFAULT_MODEL;

        /* =====================================================
           LESSON INFORMATION
        ===================================================== */

        const description =
            lesson.description?.trim() ||
            "No lesson description was provided.";

        const duration =
            lesson.duration ||
            "Not specified";

        /* =====================================================
           AI PROMPT
        ===================================================== */

        const prompt = `
You are CourseGuide AI.

Create high-quality study notes from the
ACTUAL YouTube transcript provided below.

The notes will be generated ONCE and then
shared with every learner studying this
lesson.

Therefore:

- Be accurate.
- Focus on what is actually taught.
- Do not invent facts.
- Do not add information that is not
  supported by the transcript.
- Ignore advertisements, promotions,
  social-media plugs, discount links and
  unrelated promotional content.
- Focus on the educational content.

COURSE:
${course.title}

LESSON:
${lesson.title}

DURATION:
${duration}

LESSON DESCRIPTION:
${description}

==================================================
YOUTUBE TRANSCRIPT
==================================================

${transcript}

==================================================
END OF TRANSCRIPT
==================================================

IMPORTANT:

The transcript is the primary source.

Use the transcript to understand:

- What the instructor teaches
- Concepts explained
- Steps demonstrated
- Examples shown
- Important definitions
- Important commands or code
- Important practical instructions
- The order in which concepts are introduced

Do NOT say that you watched the video.

Do NOT say that you listened to the video.

Do NOT mention the transcript as a limitation.

Do NOT invent missing information.

If something is unclear in the transcript,
do not guess.

==================================================
OUTPUT
==================================================

Your response must contain ONLY the final
study notes.

Do not output:

- reasoning
- thinking process
- analysis
- planning
- constraint checking
- self-criticism
- meta commentary
- explanations about generating the notes

Start DIRECTLY with:

## Lesson Summary

Use exactly these sections:

## Lesson Summary

Give a clear summary of what the lesson
teaches.

## Key Concepts

List the important concepts taught in
the lesson.

For each concept:

- Give the concept.
- Give a simple explanation.
- Include important technical details
  when they are present in the transcript.

## Important Points

List the most important things a student
should remember.

Include useful:

- definitions
- steps
- commands
- code-related points
- practical instructions
- important warnings

Only include information supported by
the transcript.

## Example

Give useful examples from the lesson.

If the instructor demonstrates code,
commands or a practical example, explain
the example clearly.

If there is genuinely no example in the
transcript, write:

No example was provided in the lesson.

## Quick Revision

Create short revision points covering
the most important parts of the lesson.

Make these useful for a student preparing
for an exam or quickly revising the lesson.

STYLE:

- Simple English.
- College-student friendly.
- Clear.
- Accurate.
- Well structured.
- Concise but complete.
- Do not repeat the same information.
- Do not include promotional content.
- Do not include social-media information
  unless it is directly relevant to learning.
- Do not add unsupported facts.
- Only output the final notes.
`;

        /* =====================================================
           CALL NVIDIA NIM
        ===================================================== */

        const nvidiaResponse =
            await fetch(
                NVIDIA_API_URL,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${apiKey}`,
                    },

                    body:
                        JSON.stringify({
                            model,

                            messages: [
                                {
                                    role:
                                        "system",

                                    content:
                                        "You are CourseGuide AI, an accurate educational notes assistant. Return only the requested final notes.",
                                },

                                {
                                    role:
                                        "user",

                                    content:
                                        prompt,
                                },
                            ],

                            temperature:
                                0.2,

                            top_p:
                                0.7,

                            max_tokens:
                                4000,

                            stream:
                                false,

                            /*
                             * IMPORTANT:
                             *
                             * Disable visible
                             * reasoning/thinking.
                             *
                             * This prevents the
                             * model from returning
                             * the long thinking
                             * process you saw.
                             */

                            chat_template_kwargs:
                                {
                                    enable_thinking:
                                        false,
                                },
                        }),
                }
            );

        const responseData =
            await nvidiaResponse.json();

        /* =====================================================
           NVIDIA ERROR
        ===================================================== */

        if (
            !nvidiaResponse.ok
        ) {
            console.error(
                "NVIDIA API error:",
                responseData
            );

            return NextResponse.json(
                {
                    error:
                        getErrorMessage(
                            responseData
                        ),
                },
                {
                    status: 502,
                }
            );
        }

        /* =====================================================
           EXTRACT AI CONTENT
        ===================================================== */

        const content =
            responseData
                ?.choices?.[0]
                ?.message
                ?.content;

        if (
            typeof content !==
                "string" ||
            !content.trim()
        ) {
            console.error(
                "Unexpected NVIDIA response:",
                responseData
            );

            return NextResponse.json(
                {
                    error:
                        "NVIDIA AI returned empty notes.",
                },
                {
                    status: 502,
                }
            );
        }

        /* =====================================================
           CLEAN CONTENT
        ===================================================== */

        const noteContent =
            cleanGeneratedNotes(
                content
            );

        if (
            !noteContent
        ) {
            return NextResponse.json(
                {
                    error:
                        "Generated notes were empty after cleaning.",
                },
                {
                    status: 502,
                }
            );
        }

        /* =====================================================
           SAVE SHARED NOTE
           
           This note belongs to the lesson,
           NOT to the individual learner.
        ===================================================== */

        const [
            createdNote,
        ] = await db
            .insert(aiNotes)
            .values({
                userId:
                    user.id,

                lessonId,

                content:
                    noteContent,
            })
            .returning();

        /* =====================================================
           RESPONSE
        ===================================================== */

        return NextResponse.json({
            note:
                createdNote,

            alreadyExists:
                false,
        });
    } catch (error) {
        console.error(
            "AI Notes POST error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to generate AI notes",
            },
            {
                status: 500,
            }
        );
    }
}