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
      <div
        className="
          rounded-[20px]
          bg-[#e0e5ec]
          p-6
          sm:p-7
        "
        style={{
          boxShadow:
            "9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.8)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-[12px]
              bg-[#e0e5ec]
            "
            style={{
              boxShadow:
                "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
            }}
          >
            <FileText
              size={18}
              className="text-[#ff4500]"
            />
          </div>

          <div className="space-y-2">
            <div
              className="
                h-3
                w-28
                animate-pulse
                rounded-[12px]
                bg-[#d2d7de]
              "
            />

            <div
              className="
                h-2.5
                w-52
                animate-pulse
                rounded-[12px]
                bg-[#d7dce3]
              "
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-[20px]
        bg-[#e0e5ec]
        p-6
        sm:p-7
      "
      style={{
        boxShadow:
          "9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.8)",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[12px]
              bg-[#e0e5ec]
              text-[#ff4500]
            "
            style={{
              boxShadow:
                "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
            }}
          >
            <FileText
              size={19}
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-black">
              My Notes
            </h2>

            <p className="mt-1 text-xs text-[#3f3e3e]">
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
            className="
              inline-flex
              h-9
              items-center
              justify-center
              gap-2
              rounded-[12px]
              bg-[#e0e5ec]
              px-3
              text-[11px]
              font-semibold
              text-black
              transition-all
              duration-200
              hover:text-[#ff4500]
            "
            style={{
              boxShadow:
                "5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.8)",
            }}
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
            className="
              inline-flex
              h-9
              items-center
              justify-center
              gap-2
              rounded-[12px]
              bg-[#ff4500]
              px-3
              text-[11px]
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            style={{
              boxShadow:
                "5px 5px 12px rgba(79, 70, 229, 0.35), -5px -5px 12px rgba(255, 255, 255, 0.8)",
            }}
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

      <div
        className="
          mt-5
          rounded-[12px]
          bg-[#e0e5ec]
          px-4
          py-3
        "
        style={{
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ff4500]">
          Your notes for
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-black">
          {lessonTitle}
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            mt-4
            rounded-[12px]
            bg-[#e0e5ec]
            px-4
            py-3
            text-xs
            leading-5
            text-red-600
          "
          style={{
            boxShadow:
              "inset 3px 3px 6px rgba(163, 177, 198, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
          }}
        >
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
          className="
            min-h-[360px]
            w-full
            resize-y
            rounded-[12px]
            border-0
            bg-[#e0e5ec]
            p-5
            text-sm
            leading-7
            text-black
            outline-none
            transition-all
            duration-200
            placeholder:text-[#777777]
            focus:ring-0
          "
          style={{
            boxShadow:
              "inset 6px 6px 10px rgba(163, 177, 198, 0.7), inset -6px -6px 10px rgba(255, 255, 255, 0.9)",
          }}
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
              className="animate-spin text-[#ff4500]"
            />

            <span className="text-[10px] text-[#3f3e3e]">
              Saving...
            </span>
          </>
        )}

        {!saving && saved && (
          <>
            <CheckCircle2
              size={12}
              className="text-[#ff4500]"
            />

            <span className="text-[10px] text-[#3f3e3e]">
              Saved on this device
            </span>
          </>
        )}

        {!saving &&
          !saved &&
          content && (
            <span className="text-[10px] text-[#3f3e3e]">
              Changes will be saved automatically.
            </span>
          )}
      </div>

      {/* =====================================================
          PRIVACY NOTICE
      ===================================================== */}

      <div
        className="
          mt-5
          rounded-[12px]
          bg-[#e0e5ec]
          px-4
          py-3
        "
        style={{
          boxShadow:
            "inset 3px 3px 6px rgba(163, 177, 198, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.8)",
        }}
      >
        <p className="text-[10px] leading-5 text-[#3f3e3e]">
          Your personal notes are stored locally in this browser using IndexedDB. They are not saved in the CourseGuide AI database.
        </p>
      </div>
    </div>
  );
}