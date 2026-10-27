
"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Clipboard,
    ClipboardCheck,
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

type InlinePart = {
    type: "text" | "bold" | "italic" | "code";
    value: string;
};

function parseInline(text: string): InlinePart[] {
    const parts: InlinePart[] = [];
    const pattern = /(\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                value: text.slice(lastIndex, match.index),
            });
        }

        const token = match[0];

        if (token.startsWith("**")) {
            parts.push({
                type: "bold",
                value: token.slice(2, -2),
            });
        } else if (token.startsWith("`")) {
            parts.push({
                type: "code",
                value: token.slice(1, -1),
            });
        } else {
            parts.push({
                type: "italic",
                value: token.slice(1, -1),
            });
        }

        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: "text",
            value: text.slice(lastIndex),
        });
    }

    return parts;
}

function renderInline(text: string) {
    return parseInline(text).map((part, index) => {
        const key = `${index}-${part.value}`;

        switch (part.type) {
            case "bold":
                return (
                    <strong
                        key={key}
                        className="font-semibold text-black dark:text-[#f5f7fa]"
                    >
                        {part.value}
                    </strong>
                );

            case "italic":
                return <em key={key}>{part.value}</em>;

            case "code":
                return (
                    <code
                        key={key}
                        className="rounded-md bg-[#d2d8e1] px-1.5 py-0.5 font-mono text-[12px] text-[#d83b01] dark:bg-[#292e36] dark:text-[#ff885f]"
                    >
                        {part.value}
                    </code>
                );

            default:
                return <span key={key}>{part.value}</span>;
        }
    });
}

/*
 * Lightweight Markdown renderer.
 * No extra package is required.
 */
function renderNotes(
    text: string,
    onCopyCode: (code: string) => void,
) {
    const lines = text
        .replace(/\r\n/g, "\n")
        .split("\n");

    const elements: React.ReactNode[] = [];

    let index = 0;
    let codeCounter = 0;
    let listCounter = 0;

    while (index < lines.length) {
        const line = lines[index];
        const key = `note-${index}`;

        // Fenced code blocks
        if (line.trim().startsWith("```")) {
            const language = line
                .trim()
                .slice(3)
                .trim();

            index++;

            const codeLines: string[] = [];

            while (
                index < lines.length &&
                !lines[index].trim().startsWith("```")
            ) {
                codeLines.push(lines[index]);
                index++;
            }

            if (index < lines.length) {
                index++;
            }

            const code = codeLines.join("\n");
            const codeId = `code-${codeCounter++}`;

            elements.push(
                <div
                    key={codeId}
                    className="mt-5 overflow-hidden rounded-[18px] border border-[#cdd3dc] bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] dark:border-[#30353e] dark:bg-[#171a20] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.5),inset_-3px_-3px_6px_rgba(43,48,58,0.25)]"
                >
                    <div className="flex items-center justify-between gap-3 border-b border-[#cdd3dc] px-4 py-2.5 dark:border-[#30353e]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666d79] dark:text-[#a8adb7]">
                            {language || "Code"}
                        </span>

                        <button
                            type="button"
                            onClick={() => onCopyCode(code)}
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#ff4500] transition hover:bg-[#d2d8e1] dark:text-[#ff885f] dark:hover:bg-[#292e36]"
                            aria-label="Copy code"
                        >
                            <Clipboard size={12} />
                            Copy code
                        </button>
                    </div>

                    <pre className="overflow-x-auto p-4 text-[12px] leading-6 text-[#282c34] dark:text-[#e2e6ed]">
                        <code>{code}</code>
                    </pre>
                </div>,
            );

            continue;
        }

        // Headings
        if (line.startsWith("## ")) {
            elements.push(
                <h3
                    key={key}
                    className="mt-8 border-b border-[#cdd3dc] pb-2.5 text-base font-bold text-black first:mt-0 dark:border-[#30353e] dark:text-[#f5f7fa]"
                >
                    {renderInline(line.slice(3))}
                </h3>,
            );

            index++;
            continue;
        }

        if (line.startsWith("### ")) {
            elements.push(
                <h4
                    key={key}
                    className="mt-5 text-sm font-bold text-black dark:text-[#f5f7fa]"
                >
                    {renderInline(line.slice(4))}
                </h4>,
            );

            index++;
            continue;
        }

        if (line.startsWith("# ")) {
            elements.push(
                <h3
                    key={key}
                    className="mt-2 text-lg font-bold text-black dark:text-[#f5f7fa]"
                >
                    {renderInline(line.slice(2))}
                </h3>,
            );

            index++;
            continue;
        }

        // Blockquotes
        if (line.startsWith("> ")) {
            elements.push(
                <blockquote
                    key={key}
                    className="mt-4 rounded-r-xl border-l-[3px] border-[#ff4500] bg-[#d7dde6] px-4 py-3 text-sm leading-6 text-[#3f3e3e] dark:bg-[#20252d] dark:text-[#c1c7d0]"
                >
                    {renderInline(line.slice(2))}
                </blockquote>,
            );

            index++;
            continue;
        }

        // Bulleted lists
        if (/^\s*[-*]\s+/.test(line)) {
            const content = line.replace(/^\s*[-*]\s+/, "");

            elements.push(
                <div
                    key={key}
                    className="mt-2 flex items-start gap-3 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]"
                >
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4500] shadow-[1px_1px_3px_rgba(163,177,198,0.6)] dark:bg-[orangered] dark:shadow-[1px_1px_3px_rgba(5,7,10,0.6)]" />

                    <span className="min-w-0 flex-1">
                        {renderInline(content)}
                    </span>
                </div>,
            );

            listCounter++;
            index++;
            continue;
        }

        // Numbered lists
        const numberedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);

        if (numberedMatch) {
            elements.push(
                <div
                    key={key}
                    className="mt-2 flex items-start gap-3 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]"
                >
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[10px] font-bold text-[#ff4500] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[orangered] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.7),inset_-3px_-3px_6px_rgba(43,48,58,0.7)]">
                        {numberedMatch[1]}
                    </span>

                    <span className="min-w-0 flex-1">
                        {renderInline(numberedMatch[2])}
                    </span>
                </div>,
            );

            listCounter++;
            index++;
            continue;
        }

        if (!line.trim()) {
            index++;
            continue;
        }

        // Normal paragraphs
        elements.push(
            <p
                key={key}
                className="mt-3 text-sm leading-7 text-[#3f3e3e] dark:text-[#a8adb7]"
            >
                {renderInline(line)}
            </p>,
        );

        index++;
    }

    return elements;
}

export default function AiNotes({
    lessonId,
}: AiNotesProps) {
    const [note, setNote] = useState<AiNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [hasRequested, setHasRequested] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [copied, setCopied] = useState(false);

    async function loadNote() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/ai-notes?lessonId=${lessonId}`,
                { cache: "no-store" },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to load AI notes",
                );
            }

            setNote(data.note ?? null);
        } catch (err) {
            console.error("Load AI notes error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load AI notes",
            );
        } finally {
            setLoading(false);
        }
    }

    async function copyText(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error("Copy notes error:", err);
            setError("Could not copy text. Please try again.");
        }
    }

    async function handleGenerateNotes() {
        if (generating || hasRequested) return;

        setHasRequested(true);
        setGenerating(true);
        setError("");

        try {
            // Existing shared notes are reused without another AI call.
            if (note) {
                setShowNotes(true);
                return;
            }

            const response = await fetch("/api/ai-notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lessonId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to generate notes",
                );
            }

            setNote(data.note ?? null);
            setShowNotes(Boolean(data.note));
        } catch (err) {
            console.error("AI notes error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate notes",
            );

            // Allow the user to retry after a failure.
            setHasRequested(false);
        } finally {
            setGenerating(false);
        }
    }

    useEffect(() => {
        setNote(null);
        setError("");
        setHasRequested(false);
        setShowNotes(false);
        setGenerating(false);

        void loadNote();
    }, [lessonId]);

    if (loading) {
        return (
            <div className="py-2">
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
        <div className="py-2 sm:py-3">
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
                                <CheckCircle2 size={11} />
                                Available
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                        Clear explanations and key concepts for this lesson.
                    </p>
                </div>
            </div>

            {error && (
                <div className="neo-inset mt-5 rounded-[20px] px-4 py-3 text-xs leading-5 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {!hasRequested && !generating && (
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleGenerateNotes}
                        className="neo-accent-button inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold"
                    >
                        <Sparkles size={14} />
                        {note ? "View notes" : "Generate notes"}
                    </button>
                </div>
            )}

            {generating && (
                <div className="neo-inset mt-6 rounded-[20px] px-5 py-7">
                    <div className="flex items-center gap-4">
                        <div className="neo-surface-sm flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#c9cfd8] border-t-[#ff4500] dark:border-[#39404b] dark:border-t-[orangered]" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-black dark:text-[#f5f7fa]">
                                Preparing your notes...
                            </p>
                            <p className="mt-1 text-xs text-[#3f3e3e] dark:text-[#a8adb7]">
                                Explaining the important concepts clearly.
                            </p>
                        </div>
                    </div>

                    <div className="neo-inset mt-5 h-2 overflow-hidden rounded-full">
                        <div className="h-full w-full origin-left animate-[aiNotesProgress_5s_linear] rounded-full bg-[#ff4500] dark:bg-[orangered]" />
                    </div>
                </div>
            )}

            {note && showNotes && !generating && (
                <div className="mt-6 border-t border-[#cdd3dc] pt-6 dark:border-[#30353e]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-[#666d79] dark:text-[#a8adb7]">
                            Straightforward lesson explanations
                        </p>

                        <button
                            type="button"
                            onClick={() => copyText(note.content)}
                            className="neo-surface-sm inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold text-[#3f3e3e] transition hover:text-[#ff4500] dark:text-[#c1c7d0] dark:hover:text-[orangered]"
                        >
                            {copied ? (
                                <ClipboardCheck size={13} />
                            ) : (
                                <Clipboard size={13} />
                            )}
                            {copied ? "Copied" : "Copy notes"}
                        </button>
                    </div>

                    <div className="min-w-0">
                        <div className="min-w-0 break-words">
                            {renderNotes(
                                note.content,
                                (code) => void copyText(code),
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] leading-4 text-[#3f3e3e] dark:text-[#a8adb7]">
                        <CheckCircle2
                            size={12}
                            className="text-[#ff4500] dark:text-[orangered]"
                        />
                        <span>
                            Shared CourseGuide AI notes for this lesson. Personal notes remain separate.
                        </span>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes aiNotesProgress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
}
