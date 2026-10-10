import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { fetchTranscript } from "youtube-transcript";

import { db } from "@/db";
import { aiNotes, courses, lessons } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const NVIDIA_API_URL =
    "https://integrate.api.nvidia.com/v1/chat/completions";

const DEFAULT_MODEL =
    "nvidia/nemotron-3.5-lightning-30b-a3b";

/* =========================================================
   CLEAN AI OUTPUT
========================================================= */

function cleanGeneratedNotes(content: string): string {
    let cleaned = content.trim();

    // Remove a wrapping Markdown code fence if the entire
    // response was incorrectly returned inside one.
    cleaned = cleaned
        .replace(/^```(?:markdown|md)?\s*\n/i, "")
        .replace(/\n```\s*$/, "")
        .trim();

    // Remove accidental reasoning sections.
    const unwantedSections = [
        "## Check against constraints",
        "## Constraint Check",
        "## Thinking Process",
        "## Analysis of the user input",
    ];

    for (const section of unwantedSections) {
        const index = cleaned.indexOf(section);

        if (index >= 0) {
            cleaned = cleaned.slice(0, index).trim();
        }
    }

    // Remove accidental introductory text before the notes.
    const firstHeading = cleaned.search(/^#{1,3}\s+\S/m);

    if (firstHeading > 0) {
        cleaned = cleaned.slice(firstHeading).trim();
    }

    return cleaned.trim();
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(data: unknown): string {
    if (
        typeof data === "object" &&
        data !== null &&
        "error" in data
    ) {
        const error = (
            data as { error?: unknown }
        ).error;

        if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
        ) {
            const message = (
                error as { message?: unknown }
            ).message;

            if (typeof message === "string") {
                return message;
            }
        }

        if (typeof error === "string") {
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

    const transcript = (
        await fetchTranscript(videoUrl)
    ) as TranscriptItem[];

    if (!Array.isArray(transcript) || transcript.length === 0) {
        throw new Error(
            "No YouTube transcript is available for this lesson."
        );
    }

    const transcriptText = transcript
        .map((item) => {
            const text = item?.text?.trim();

            if (!text) {
                return "";
            }

            const rawOffset = Number(item?.offset ?? 0);

            const offset =
                Number.isFinite(rawOffset) && rawOffset >= 0
                    ? rawOffset
                    : 0;

            const minutes = Math.floor(offset / 60);
            const seconds = Math.floor(offset % 60);

            const timestamp =
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`;

            return `[${timestamp}] ${text}`;
        })
        .filter(Boolean)
        .join("\n");

    if (!transcriptText.trim()) {
        throw new Error(
            "The YouTube transcript was empty."
        );
    }

    return transcriptText.trim();
}

/* =========================================================
   GET SHARED AI NOTES
========================================================= */

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const lessonId = Number.parseInt(
            searchParams.get("lessonId") || "",
            10
        );

        if (!Number.isInteger(lessonId) || lessonId <= 0) {
            return NextResponse.json(
                { error: "Invalid lessonId" },
                { status: 400 }
            );
        }

        // AI notes are shared by lesson, not by user.
        const [note] = await db
            .select()
            .from(aiNotes)
            .where(eq(aiNotes.lessonId, lessonId))
            .limit(1);

        return NextResponse.json({
            note: note ?? null,
        });
    } catch (error) {
        console.error("AI Notes GET error:", error);

        return NextResponse.json(
            { error: "Failed to load AI notes" },
            { status: 500 }
        );
    }
}

/* =========================================================
   GENERATE AI NOTES
========================================================= */

export async function POST(request: Request) {
    try {
        /* -----------------------------------------------
           AUTHENTICATION
        ----------------------------------------------- */

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        /* -----------------------------------------------
           REQUEST BODY
        ----------------------------------------------- */

        const body = await request.json();
        const lessonId = Number(body?.lessonId);

        if (!Number.isInteger(lessonId) || lessonId <= 0) {
            return NextResponse.json(
                { error: "Invalid lessonId" },
                { status: 400 }
            );
        }

        /* -----------------------------------------------
           REUSE EXISTING SHARED NOTES
        ----------------------------------------------- */

        const [existingNote] = await db
            .select()
            .from(aiNotes)
            .where(eq(aiNotes.lessonId, lessonId))
            .limit(1);

        if (existingNote) {
            return NextResponse.json({
                note: existingNote,
                alreadyExists: true,
            });
        }

        /* -----------------------------------------------
           GET LESSON
        ----------------------------------------------- */

        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, lessonId))
            .limit(1);

        if (!lesson) {
            return NextResponse.json(
                { error: "Lesson not found" },
                { status: 404 }
            );
        }

        /* -----------------------------------------------
           GET COURSE
        ----------------------------------------------- */

        const [course] = await db
            .select({
                id: courses.id,
                title: courses.title,
            })
            .from(courses)
            .where(eq(courses.id, lesson.courseId))
            .limit(1);

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        /* -----------------------------------------------
           FETCH TRANSCRIPT
        ----------------------------------------------- */

        let transcript: string;

        try {
            transcript = await getYouTubeTranscript(
                lesson.videoUrl || ""
            );
        } catch (error) {
            console.error("YouTube transcript error:", error);

            return NextResponse.json(
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unable to retrieve the YouTube transcript.",
                },
                { status: 422 }
            );
        }

        /* -----------------------------------------------
           NVIDIA CONFIGURATION
        ----------------------------------------------- */

        const apiKey = process.env.NVIDIA_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "NVIDIA_API_KEY is not configured. Add it to .env.local.",
                },
                { status: 500 }
            );
        }

        const model =
            process.env.NVIDIA_NIM_MODEL ||
            DEFAULT_MODEL;

        const description =
            lesson.description?.trim() ||
            "No lesson description was provided.";

        const duration =
            lesson.duration || "Not specified";

        /* -----------------------------------------------
           TEXTBOOK + PRACTICAL TUTORIAL PROMPT
        ----------------------------------------------- */

        const prompt = `
You are CourseGuide AI, an expert technical educator
and textbook author.

Your task is to transform the supplied lesson transcript
into complete, useful, student-friendly study material.

The output must teach the actual subject directly.
It must not report what happened in a video.

COURSE:
${course.title}

LESSON:
${lesson.title}

DURATION:
${duration}

LESSON DESCRIPTION:
${description}

SOURCE TRANSCRIPT:
<source_transcript>
${transcript}
</source_transcript>

==================================================
PRIMARY OBJECTIVE
==================================================

Transform the source into a combination of:

1. Textbook-style explanations.
2. Step-by-step practical tutorials.
3. Accurate code examples and explanations.
4. Important technical concepts and definitions.
5. Troubleshooting instructions when the source
   demonstrates a problem and its solution.
6. Revision material for students.

A student should be able to study from these notes
without needing to read a report about the video.

The transcript is your source material. Reorganize it
to make learning easier instead of following the video's
timeline mechanically.

==================================================
RULE 1: EXPLAIN THE SUBJECT DIRECTLY
==================================================

Never narrate the instructor's actions.

Never write:
- The instructor explains...
- The instructor demonstrates...
- He installs...
- She opens...
- The instructor clicks...
- The video shows...
- In this lesson, we learn...
- The teacher tells us...
- The speaker mentions...
- Next, the instructor...
- At the end of the video...
- The instructor gives an example...

Instead, write the information the student needs.

BAD:
"The instructor explains how to install VS Code."

GOOD:
"## Installing Visual Studio Code

1. Open the official website:
   https://code.visualstudio.com
2. Download the installer for your operating system.
3. Run the installer and follow its instructions."

BAD:
"The instructor demonstrates how to link a stylesheet."

GOOD:
"An external CSS file is connected to an HTML document
using the link element inside the head element."

BAD:
"The instructor shows how to use alert()."

GOOD:
"The JavaScript alert() function displays a dialog box
containing a message."

BAD:
"The instructor creates three files."

GOOD:
"Create the following files in your project folder:
index.html, style.css, and script.js."

These are examples of the required transformation.
Apply this writing style to every topic.

==================================================
RULE 2: TURN DEMONSTRATIONS INTO INSTRUCTIONS
==================================================

When the source shows a practical task, convert it into
direct instructions that the student can follow.

For software installation:
- Provide the official website if it is known reliably
  from the source or can be identified with confidence.
- Explain which installer or option to select when known.
- Give the actual steps shown or supported by the source.
- Explain how to recognize successful completion only
  when that information is supported.

For setting up a development environment:
- Identify the required software and tools.
- Give the setup sequence.
- Include project folder and file names when available.
- Explain the purpose of relevant settings or extensions.

For commands:
- Show the actual command.
- Explain what it does.
- Identify where it should be executed when known.

For code:
- Preserve important code from the source.
- Use properly labelled Markdown code blocks.
- Explain important lines, attributes, and syntax.
- Describe the result only when it is supported.

For procedures:
- Use numbered steps in the correct order.
- Explain necessary prerequisites.
- Include important warnings or common mistakes when
  they are present in the source.

For troubleshooting:
- State the problem.
- Give the demonstrated cause.
- Provide the solution when supported by the source.

Do not merely say that a task was demonstrated.
Write the useful instructions themselves.

==================================================
RULE 3: WRITE REAL TEXTBOOK EXPLANATIONS
==================================================

For conceptual material:
- Start with the concept's name or definition.
- Explain what it means in clear language.
- Explain how it works when supported.
- Explain its purpose and practical use when supported.
- Include relevant technical terminology.
- Use examples to clarify difficult ideas.

Use paragraphs for explanations and bullet points for
lists, features, and short facts.

Use headings that describe the subject being taught.

Do not force every topic into a generic summary format.

==================================================
RULE 4: SOURCE ACCURACY
==================================================

The transcript is the primary source.

- Preserve actual facts, commands, examples, and code.
- Do not invent demonstrations or claim they occurred.
- Do not fabricate terminal output or application results.
- Do not guess missing steps.
- Do not invent error solutions that were never established.
- Do not claim a website or installer was used unless
  the source supports that claim.
- When a step is missing, include only the steps that
  are supported.
- You may add a basic explanation needed to understand
  an explicitly taught concept, but do not expand into
  unrelated material.
- Remove advertisements, unrelated promotions, and
  social-media requests.
- Preserve relevant warnings, limitations, and mistakes.

If the transcript contains only a conceptual explanation,
write conceptual notes. Do not invent a practical tutorial
for a task that was not covered.

If the transcript contains a practical demonstration,
extract the actionable details instead of describing it.

==================================================
RULE 5: ORGANIZE NOTES BY TOPIC
==================================================

Choose headings that match the actual content.

For a web development lesson, appropriate headings might
include:

## Lesson Summary

## Development Environment

### Installing Required Software

### Configuring the Code Editor

## Creating the Project

## HTML Structure

## CSS Styling

## Adding JavaScript

## Client-Server Model

## Important Points

## Quick Revision

These headings are examples, not mandatory topics.
Only include topics supported by the source.

Combine related ideas and remove repetition.

==================================================
OUTPUT STRUCTURE
==================================================

Return only the completed notes in Markdown.

## Lesson Summary

Briefly explain the subject and the main skills or
concepts covered. Describe the knowledge itself, not
what the instructor did.

## Key Concepts

Organize the main concepts under meaningful headings.

Explain each concept directly, like a textbook.

When a topic involves practical work, include actionable
steps, relevant code, and explanations under that topic.

Do not describe demonstrations as events in a video.

## Important Points

List essential definitions, commands, syntax, rules,
technical distinctions, and warnings.

Avoid duplicating whole paragraphs from the main notes.

## Example

Include relevant examples from the source.

For code examples:
- Show the code in a labelled Markdown code block.
- Explain the code and important lines.
- State the result only when supported.

For practical examples, provide usable instructions.

If the source genuinely contains no useful example, write:
"No example was provided in the lesson."

## Quick Revision

Give concise revision points for exam preparation.

Include important definitions, commands, syntax, and
relationships between concepts.

These headings provide structure, but the content under
Key Concepts must be a complete learning resource, not
a narration or a superficial summary.

==================================================
FINAL QUALITY CHECK
==================================================

Before returning the answer, silently check:

1. Does the content directly teach the subject?
2. Have all references to what the instructor did or
   said been removed?
3. Have demonstrations become actionable instructions
   wherever the source supports them?
4. Are code examples and commands accurate?
5. Are practical steps in a useful order?
6. Have unsupported steps and claims been avoided?
7. Are concepts explained rather than merely listed?
8. Is the content organized by topic?
9. Is the response free from reasoning and meta-commentary?

If a sentence describes an event in the video, rewrite it
as a direct explanation, instruction, or example.

Return only the finished study notes.
`;

        /* -----------------------------------------------
           CALL NVIDIA NIM
        ----------------------------------------------- */

        const nvidiaResponse = await fetch(
            NVIDIA_API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: [
                                "You are CourseGuide AI, a textbook and practical tutorial generator.",
                                "Transform the provided source transcript into direct educational notes.",
                                "Convert demonstrations into actionable instructions when supported.",
                                "Never narrate the instructor or video.",
                                "Never ask the user to provide information already included in the request.",
                                "Return only the finished Markdown study notes.",
                            ].join("\n"),
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: 0.2,
                    top_p: 0.7,
                    max_tokens: 4000,
                    stream: false,
                    chat_template_kwargs: {
                        enable_thinking: false,
                    },
                }),
            }
        );

        const responseData = await nvidiaResponse.json();

        /* -----------------------------------------------
           NVIDIA ERROR
        ----------------------------------------------- */

        if (!nvidiaResponse.ok) {
            console.error("NVIDIA API error:", responseData);

            return NextResponse.json(
                { error: getErrorMessage(responseData) },
                { status: 502 }
            );
        }

        /* -----------------------------------------------
           EXTRACT CONTENT
        ----------------------------------------------- */

        const content =
            responseData?.choices?.[0]?.message?.content;

        if (typeof content !== "string" || !content.trim()) {
            console.error(
                "Unexpected NVIDIA response:",
                responseData
            );

            return NextResponse.json(
                { error: "NVIDIA AI returned empty notes." },
                { status: 502 }
            );
        }

        /* -----------------------------------------------
           CLEAN AND VALIDATE CONTENT
        ----------------------------------------------- */

        const noteContent = cleanGeneratedNotes(content);

        if (!noteContent) {
            return NextResponse.json(
                {
                    error:
                        "Generated notes were empty after cleaning.",
                },
                { status: 502 }
            );
        }

        // Do not save a response that asks the student to
        // supply the transcript or course details.
        const invalidResponsePatterns = [
            /please provide (the )?(following )?(course|lesson|transcript)/i,
            /to generate .* notes,? please provide/i,
            /the source transcript (was not|is not) provided/i,
            /the required course details .* were not included/i,
            /once you provide these details/i,
        ];

        if (
            invalidResponsePatterns.some((pattern) =>
                pattern.test(noteContent)
            )
        ) {
            console.error(
                "AI returned a request for missing input instead of notes."
            );

            return NextResponse.json(
                {
                    error:
                        "The AI did not generate study notes. Please try again.",
                },
                { status: 502 }
            );
        }

        /* -----------------------------------------------
           SAVE SHARED NOTES

           One saved note per lesson.
           Existing notes are reused for all learners.
        ----------------------------------------------- */

        const [createdNote] = await db
            .insert(aiNotes)
            .values({
                userId: user.id,
                lessonId,
                content: noteContent,
            })
            .returning();

        /* -----------------------------------------------
           RESPONSE
        ----------------------------------------------- */

        return NextResponse.json({
            note: createdNote,
            alreadyExists: false,
        });
    } catch (error) {
        console.error("AI Notes POST error:", error);

        return NextResponse.json(
            { error: "Failed to generate AI notes" },
            { status: 500 }
        );
    }
}
