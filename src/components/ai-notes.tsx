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
                        className="mt-7 border-b border-[#cdd3dc] pb-2 text-base font-bold text-black first:mt-0 dark:border-[#30353e] dark:text-[#f5f7fa]"
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
                        className="mt-5 text-sm font-bold text-black dark:text-[#f5f7fa]"
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
                        className="mt-2 flex gap-3 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]"
                    >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4500] shadow-[1px_1px_3px_rgba(163,177,198,0.6)] dark:bg-[orangered] dark:shadow-[1px_1px_3px_rgba(5,7,10,0.6)]" />

                        <span>
                            {line.replace(
                                /^[-*]\s+/,
                                ""
                            )}
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
                        className="mt-2 flex gap-3 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]"
                    >
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e0e5ec] text-[10px] font-bold text-[#ff4500] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[orangered] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
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
                    className="mt-2 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]"
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
    ======================================================= */

    async function handleGenerateNotes() {
        if (generating || hasRequested) {
            return;
        }

        setHasRequested(true);

        setGenerating(true);
        setError("");

        try {
            const fiveSecondWait =
                waitFiveSeconds();

            /* =================================================
             * EXISTING NOTE
             * ================================================= */

            if (note) {
                await fiveSecondWait;

                setShowNotes(true);

                return;
            }

            /* =================================================
             * FIRST GENERATION
             * ================================================= */

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
            <div className="rounded-[30px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                        <FileText
                            size={18}
                            className="text-[#ff4500] dark:text-[orangered]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="h-3 w-28 animate-pulse rounded-full bg-[#cdd3dc] dark:bg-[#30353e]" />

                        <div className="h-2.5 w-52 animate-pulse rounded-full bg-[#d2d8e1] dark:bg-[#292e36]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[30px] bg-[#e0e5ec] p-6 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)] sm:p-7">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[#ff4500] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[orangered] dark:shadow-[5px_5px_10px_rgba(5,7,10,0.7),-5px_-5px_10px_rgba(43,48,58,0.7)]">
                    <Sparkles size={19} />
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-black dark:text-[#f5f7fa]">
                            AI Notes
                        </h2>

                        {note && (
                            <span className="neo-inset inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2
                                    size={11}
                                />
                                Available
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                        AI-generated study notes for
                        this lesson.
                    </p>
                </div>
            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="neo-inset mt-5 rounded-[20px] px-4 py-3 text-xs leading-5 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* =====================================================
                GENERATE BUTTON
            ===================================================== */}

            {!hasRequested && !generating && (
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={
                            handleGenerateNotes
                        }
                        className="neo-accent-button inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold"
                    >
                        <Sparkles size={14} />

                        Generate notes
                    </button>
                </div>
            )}

            {/* =====================================================
                GENERATING STATE
            ===================================================== */}

            {generating && (
                <div className="neo-inset mt-6 rounded-[20px] px-5 py-7">
                    <div className="flex items-center gap-4">
                        <div className="neo-surface-sm flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#c9cfd8] border-t-[#ff4500] dark:border-[#39404b] dark:border-t-[orangered]" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-black dark:text-[#f5f7fa]">
                                Generating notes...
                            </p>

                            <p className="mt-1 text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                                CourseGuide AI is preparing
                                your study notes.
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        PROGRESS BAR
                    ================================================= */}

                    <div className="neo-inset mt-5 h-2 overflow-hidden rounded-full">
                        <div className="h-full w-full origin-left animate-[aiNotesProgress_5s_linear] rounded-full bg-[#ff4500] dark:bg-[orangered]" />
                    </div>
                </div>
            )}

            {/* =====================================================
                GENERATED NOTES
            ===================================================== */}

            {note && showNotes && !generating && (
                <div className="mt-6 border-t border-[#cdd3dc] pt-6 dark:border-[#30353e]">
                    <div className="neo-inset rounded-[20px] p-5 sm:p-6">
                        {renderNotes(
                            note.content
                        )}
                    </div>

                    {/* =================================================
                        READ ONLY NOTICE
                    ================================================= */}

                    <div className="mt-4 flex items-center gap-2 text-[10px] leading-4 text-[#3f3e3e] dark:text-[#a8adb7]">
                        <CheckCircle2
                            size={12}
                            className="text-[#ff4500] dark:text-[orangered]"
                        />

                        <span>
                            These are official
                            CourseGuide AI notes for
                            this lesson and are
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