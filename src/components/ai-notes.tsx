"use client";

import { useEffect, useState } from "react";

import {
    CheckCircle2,
    FileText,
    Sparkles,
} from "lucide-react";

type AiNote = {
    id: number;
    userId: number;
    lessonId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
};

type AiNotesProps = {
    lessonId: number;
};

/* =========================================================
   RENDER AI NOTES
========================================================= */

function renderNotes(text: string) {
    return text
        .split("\n")
        .map((line, index) => {
            const key = `${index}-${line}`;

            /* =====================================================
               H2
            ===================================================== */

            if (line.startsWith("## ")) {
                return (
                    <h3
                        key={key}
                        className="mt-7 border-b border-zinc-200 pb-2 text-base font-bold text-zinc-950 first:mt-0 dark:border-zinc-800 dark:text-white"
                    >
                        {line.slice(3)}
                    </h3>
                );
            }

            /* =====================================================
               H3
            ===================================================== */

            if (line.startsWith("### ")) {
                return (
                    <h4
                        key={key}
                        className="mt-5 text-sm font-bold text-zinc-900 dark:text-white"
                    >
                        {line.slice(4)}
                    </h4>
                );
            }

            /* =====================================================
               BULLET
            ===================================================== */

            if (/^[-*]\s+/.test(line)) {
                return (
                    <div
                        key={key}
                        className="mt-2 flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
                    >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                        <span>
                            {line.replace(/^[-*]\s+/, "")}
                        </span>
                    </div>
                );
            }

            /* =====================================================
               NUMBERED LIST
            ===================================================== */

            if (/^\d+\.\s+/.test(line)) {
                const match = line.match(
                    /^(\d+)\.\s+(.*)$/
                );

                return (
                    <div
                        key={key}
                        className="mt-2 flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
                    >
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            {match?.[1]}
                        </span>

                        <span>
                            {match?.[2]}
                        </span>
                    </div>
                );
            }

            /* =====================================================
               EMPTY LINE
            ===================================================== */

            if (!line.trim()) {
                return (
                    <div
                        key={key}
                        className="h-2"
                    />
                );
            }

            /* =====================================================
               NORMAL TEXT
            ===================================================== */

            return (
                <p
                    key={key}
                    className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
                >
                    {line}
                </p>
            );
        });
}

/* =========================================================
   AI NOTES COMPONENT
========================================================= */

export default function AiNotes({
    lessonId,
}: AiNotesProps) {
    const [note, setNote] =
        useState<AiNote | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [generating, setGenerating] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * IMPORTANT:
     *
     * This is separate from "note".
     *
     * note:
     *   Tells us whether a saved note exists.
     *
     * hasRequested:
     *   Tells us whether the user has already
     *   clicked "Generate notes" for this lesson.
     *
     * This allows the Generate button to appear
     * even when a note already exists in the database.
     */
    const [hasRequested, setHasRequested] =
        useState(false);

    const [showNotes, setShowNotes] =
        useState(false);

    /* =======================================================
       LOAD SAVED NOTE
    ======================================================= */

    async function loadNote() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/ai-notes?lessonId=${lessonId}`,
                {
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to load AI notes"
                );
            }

            setNote(
                data.note ?? null
            );
        } catch (error) {
            console.error(
                "Load AI notes error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load AI notes"
            );
        } finally {
            setLoading(false);
        }
    }

    /* =======================================================
       WAIT 5 SECONDS
    ======================================================= */

    function waitFiveSeconds() {
        return new Promise<void>(
            (resolve) => {
                setTimeout(
                    resolve,
                    5000
                );
            }
        );
    }

    /* =======================================================
       GENERATE / SHOW NOTES
       
       BEHAVIOR:
       
       1. User clicks Generate notes.
       
       2. Button immediately disappears.
       
       3. Generating state is displayed.
       
       4. If note already exists:
          - Do NOT call API.
          - Wait 5 seconds.
          - Show existing saved note.
       
       5. If note does not exist:
          - Start API request.
          - Keep generating UI for at least 5 seconds.
          - API generates and saves note.
          - Show generated note.
       
       6. Button never comes back during this
          lesson session.
    ======================================================= */

    async function handleGenerateNotes() {
        if (generating || hasRequested) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * Set this immediately.
         *
         * This makes the button disappear
         * immediately after clicking it.
         */
        setHasRequested(true);

        setGenerating(true);
        setError("");

        try {
            /*
             * Start the 5-second timer immediately.
             */
            const fiveSecondWait =
                waitFiveSeconds();

            /*
             * =================================================
             * EXISTING NOTE
             * =================================================
             *
             * The note is already stored in the database.
             *
             * Do not call NVIDIA.
             * Do not regenerate.
             */

            if (note) {
                await fiveSecondWait;

                setShowNotes(true);


                /*
                 * Existing note remains unchanged.
                 */
                return;
            }

            /*
             * =================================================
             * FIRST GENERATION
             * =================================================
             *
             * Start the API request immediately while
             * the 5-second generating animation runs.
             *
             * This prevents unnecessary extra waiting.
             */

            const generationRequest =
                fetch(
                    "/api/ai-notes",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            lessonId,
                        }),
                    }
                );

            /*
             * Wait for BOTH:
             *
             * 1. API generation
             * 2. Minimum 5-second UI animation
             *
             * Therefore notes will never appear
             * before the 5-second generating state.
             */

            const [
                response,
            ] = await Promise.all([
                generationRequest,
                fiveSecondWait,
            ]);

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to generate notes"
                );
            }

            /*
             * Save the generated note
             * into component state.
             */
            setNote(
                data.note ?? null
            );
            setShowNotes(true);
        } catch (error) {
            console.error(
                "AI notes error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to generate notes"
            );
        } finally {
            setGenerating(false);
        }
    }

    /* =======================================================
       LOAD NOTES WHEN LESSON CHANGES
    ======================================================= */

    useEffect(() => {
        /*
         * Reset the state for the new lesson.
         */

        setNote(null);
        setError("");
        setHasRequested(false);
        setShowNotes(false);
        setGenerating(false);

        void loadNote();
    }, [lessonId]);

    /* =======================================================
       INITIAL LOADING
    ======================================================= */

    if (loading) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                        <FileText
                            size={18}
                            className="text-indigo-400"
                        />
                    </div>

                    <div className="space-y-2">

                        <div className="h-3 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                        <div className="h-2.5 w-52 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />

                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <Sparkles size={19} />
                </div>

                <div>

                    <div className="flex flex-wrap items-center gap-2">

                        <h2 className="font-bold text-zinc-950 dark:text-white">
                            AI Notes
                        </h2>

                        {note && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">

                                <CheckCircle2
                                    size={11}
                                />

                                Available

                            </span>
                        )}

                    </div>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        AI-generated study notes for this lesson.
                    </p>

                </div>

            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* =====================================================
                GENERATE BUTTON
               
                IMPORTANT:
               
                Show the button when:
               
                hasRequested = false
               
                It does NOT matter whether "note" exists.
               
                Therefore:
               
                Existing note:
                    [ Generate notes ]
               
                No note:
                    [ Generate notes ]
               
                After clicking:
                    button disappears
            ===================================================== */}

            {!hasRequested && !generating && (
                <div className="mt-6">

                    <button
                        type="button"
                        onClick={handleGenerateNotes}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <Sparkles size={14} />

                        Generate notes
                    </button>

                </div>
            )}

            {/* =====================================================
                GENERATING STATE
               
                SHOWN IMMEDIATELY AFTER CLICK
               
                MINIMUM 5 SECONDS
            ===================================================== */}

            {generating && (
                <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 px-5 py-7 dark:border-indigo-900/30 dark:bg-indigo-950/20">

                    <div className="flex items-center gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-900">

                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400" />

                        </div>

                        <div>

                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                Generating notes...
                            </p>

                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                CourseGuide AI is preparing your study notes.
                            </p>

                        </div>

                    </div>

                    {/* =================================================
                        PROGRESS BAR
                    ================================================= */}

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950">

                        <div className="h-full w-full origin-left animate-[aiNotesProgress_5s_linear] rounded-full bg-indigo-600" />

                    </div>

                </div>
            )}

            {/* =====================================================
                GENERATED NOTES
               
                HIDDEN WHILE GENERATING
               
                SHOWN AFTER GENERATING IS COMPLETE
            ===================================================== */}

            {note && showNotes && !generating && (
                <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">

                    <div className="rounded-xl bg-zinc-50 p-5 dark:bg-zinc-950/50 sm:p-6">

                        {renderNotes(
                            note.content
                        )}

                    </div>

                    {/* =================================================
                        READ ONLY NOTICE
                    ================================================= */}

                    <div className="mt-4 flex items-center gap-2 text-[10px] leading-4 text-zinc-400">

                        <CheckCircle2
                            size={12}
                        />

                        <span>
                            These are official CourseGuide AI
                            notes for this lesson and are
                            read-only.
                        </span>

                    </div>

                </div>
            )}

            {/* =====================================================
                PROGRESS BAR ANIMATION
            ===================================================== */}

            <style jsx>{`
                @keyframes aiNotesProgress {
                    from {
                        transform: scaleX(0);
                    }

                    to {
                        transform: scaleX(1);
                    }
                }
            `}</style>

        </div>
    );
}