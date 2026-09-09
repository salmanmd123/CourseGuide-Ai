"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";

import {
  getMyNote,
  saveMyNote,
  type MyNote,
} from "@/lib/my-notes-db";

type MyNotesProps = {
  courseId: number;
  lessonId: number;
  courseTitle: string;
  lessonTitle: string;
};

/* =========================================================
   CREATE MARKDOWN
========================================================= */

function createMarkdown(
  note: MyNote
): string {
  return `# ${note.courseTitle}

## ${note.lessonTitle}

### My Notes

${note.content}
`;
}

/* =========================================================
   DOWNLOAD FILE
========================================================= */

function downloadMarkdown(
  note: MyNote
) {
  const markdown =
    createMarkdown(note);

  const blob =
    new Blob(
      [markdown],
      {
        type: "text/markdown;charset=utf-8",
      }
    );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;

  anchor.download =
    `${sanitizeFileName(
      note.courseTitle
    )}-${sanitizeFileName(
      note.lessonTitle
    )}-notes.md`;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   SANITIZE FILE NAME
========================================================= */

function sanitizeFileName(
  value: string
): string {
  return value
    .trim()
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .slice(
      0,
      100
    ) || "notes";
}

/* =========================================================
   IMPORT MARKDOWN
========================================================= */

function extractImportedNote(
  text: string,
  fallbackCourseTitle: string,
  fallbackLessonTitle: string
): string {
  let content = text.trim();

  /*
   * Remove the CourseGuide generated
   * metadata headings when importing
   * our own exported file.
   */

  const lines =
    content.split("\n");

  const myNotesIndex =
    lines.findIndex(
      (line) =>
        line.trim().toLowerCase() ===
        "### my notes"
    );

  if (myNotesIndex >= 0) {
    content =
      lines
        .slice(
          myNotesIndex + 1
        )
        .join("\n")
        .trim();
  } else {
    /*
     * If it is a normal Markdown file,
     * preserve the content.
     *
     * Remove only our known metadata
     * headings if present.
     */

    const courseHeading =
      `# ${fallbackCourseTitle}`;

    const lessonHeading =
      `## ${fallbackLessonTitle}`;

    content =
      content
        .replace(
          new RegExp(
            `^${escapeRegExp(
              courseHeading
            )}\\s*`,
            "i"
          ),
          ""
        )
        .replace(
          new RegExp(
            `^${escapeRegExp(
              lessonHeading
            )}\\s*`,
            "i"
          ),
          ""
        )
        .trim();
  }

  return content;
}

/* =========================================================
   ESCAPE REGEX
========================================================= */

function escapeRegExp(
  value: string
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/* =========================================================
   MY NOTES COMPONENT
========================================================= */

export default function MyNotes({
  courseId,
  lessonId,
  courseTitle,
  lessonTitle,
}: MyNotesProps) {
  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const saveTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  /* =======================================================
     LOAD NOTE
  ======================================================= */

  const loadNote =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const existing =
            await getMyNote(
              lessonId
            );

          if (existing) {
            setContent(
              existing.content
            );
          } else {
            setContent("");
          }

          setSaved(
            Boolean(existing)
          );
        } catch (error) {
          console.error(
            "Load My Notes error:",
            error
          );

          setError(
            "Unable to load your notes from this browser."
          );
        } finally {
          setLoading(false);
        }
      },
      [lessonId]
    );

  /* =======================================================
     LOAD WHEN LESSON CHANGES
  ======================================================= */

  useEffect(() => {
    void loadNote();

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(
          saveTimerRef.current
        );
      }
    };
  }, [loadNote]);

  /* =======================================================
     SAVE NOTE
  ======================================================= */

  const saveNote =
    useCallback(
      async (
        value: string
      ) => {
        try {
          setSaving(true);
          setSaved(false);
          setError("");

          const now =
            new Date().toISOString();

          const existing =
            await getMyNote(
              lessonId
            );

          const note: MyNote = {
            id: `lesson-${lessonId}`,
            courseId,
            lessonId,
            courseTitle,
            lessonTitle,
            content: value,
            createdAt:
              existing?.createdAt ??
              now,
            updatedAt: now,
          };

          await saveMyNote(
            note
          );

          setSaved(true);
        } catch (error) {
          console.error(
            "Save My Notes error:",
            error
          );

          setError(
            "Unable to save your notes."
          );
        } finally {
          setSaving(false);
        }
      },
      [
        courseId,
        courseTitle,
        lessonId,
        lessonTitle,
      ]
    );

  /* =======================================================
     HANDLE TYPING
  ======================================================= */

  function handleChange(
    value: string
  ) {
    setContent(value);

    setSaved(false);

    if (saveTimerRef.current) {
      clearTimeout(
        saveTimerRef.current
      );
    }

    saveTimerRef.current =
      setTimeout(() => {
        void saveNote(value);
      }, 600);
  }

  /* =======================================================
     EXPORT
  ======================================================= */

  function handleExport() {
    const now =
      new Date().toISOString();

    const note: MyNote = {
      id: `lesson-${lessonId}`,
      courseId,
      lessonId,
      courseTitle,
      lessonTitle,
      content,
      createdAt: now,
      updatedAt: now,
    };

    downloadMarkdown(note);
  }

  /* =======================================================
     OPEN IMPORT
  ======================================================= */

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  /* =======================================================
     IMPORT FILE
  ======================================================= */

  async function handleFileImport(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    /*
     * Allow selecting the same file
     * again later.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setError("");

      const text =
        await file.text();

      if (!text.trim()) {
        setError(
          "The selected file is empty."
        );

        return;
      }

      const importedContent =
        extractImportedNote(
          text,
          courseTitle,
          lessonTitle
        );

      setContent(
        importedContent
      );

      await saveNote(
        importedContent
      );
    } catch (error) {
      console.error(
        "Import My Notes error:",
        error
      );

      setError(
        "Unable to import this notes file."
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">

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

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">

            <FileText
              size={19}
            />

          </div>

          <div className="min-w-0">

            <h2 className="font-bold text-zinc-950 dark:text-white">
              My Notes
            </h2>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Write and save your personal notes for this lesson.
            </p>

          </div>

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex shrink-0 items-center gap-2">

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown,text/plain"
            onChange={
              handleFileImport
            }
            className="hidden"
          />

          <button
            type="button"
            onClick={
              handleImportClick
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[11px] font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >

            <Upload
              size={13}
            />

            Import

          </button>

          <button
            type="button"
            onClick={
              handleExport
            }
            disabled={
              !content.trim()
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 text-[11px] font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >

            <Download
              size={13}
            />

            Export .md

          </button>

        </div>

      </div>

      {/* =====================================================
          LESSON
      ===================================================== */}

      <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">

        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Your notes for
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-white">
          {lessonTitle}
        </p>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =====================================================
          EDITOR
      ===================================================== */}

      <div className="mt-5">

        <textarea
          value={content}
          onChange={(event) =>
            handleChange(
              event.target.value
            )
          }
          placeholder="Start writing your notes..."
          spellCheck
          className="min-h-[360px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-7 text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder:text-zinc-600"
        />

      </div>

      {/* =====================================================
          SAVE STATUS
      ===================================================== */}

      <div className="mt-3 flex min-h-5 items-center gap-2">

        {saving && (
          <>
            <Loader2
              size={12}
              className="animate-spin text-indigo-500"
            />

            <span className="text-[10px] text-zinc-400">
              Saving...
            </span>
          </>
        )}

        {!saving && saved && (
          <>
            <CheckCircle2
              size={12}
              className="text-emerald-500"
            />

            <span className="text-[10px] text-zinc-400">
              Saved on this device
            </span>
          </>
        )}

        {!saving &&
          !saved &&
          content && (
            <span className="text-[10px] text-zinc-400">
              Changes will be saved automatically.
            </span>
          )}

      </div>

      {/* =====================================================
          PRIVACY NOTICE
      ===================================================== */}

      <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-950/20">

        <p className="text-[10px] leading-5 text-indigo-700 dark:text-indigo-300">
          Your personal notes are stored locally in this browser using IndexedDB. They are not saved in the CourseGuide AI database.
        </p>

      </div>

    </div>
  );
}