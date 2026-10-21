"use client";

export type LocalQuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  sortOrder: number;
};

export type LocalQuizRecord = {
  quizId: number;
  quizToken: string;
  questions: LocalQuizQuestion[];
  savedAt: string;
};

const DB_NAME = "courseguide-quiz-cache";
const DB_VERSION = 1;
const STORE_NAME = "quizzes";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("This browser does not support local quiz storage."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "quizId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open local quiz storage."));
  });
}

export async function saveQuizLocally(record: LocalQuizRecord): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to save this quiz locally."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Saving this quiz was interrupted."));
    });
  } finally {
    database.close();
  }
}

export async function getQuizLocally(quizId: number): Promise<LocalQuizRecord | null> {
  const database = await openDatabase();
  try {
    return await new Promise<LocalQuizRecord | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(quizId);
      request.onsuccess = () => resolve((request.result as LocalQuizRecord | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Unable to read this saved quiz."));
    });
  } finally {
    database.close();
  }
}
