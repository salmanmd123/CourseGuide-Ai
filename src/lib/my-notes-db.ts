const DB_NAME = "courseguide-my-notes";
const DB_VERSION = 1;
const STORE_NAME = "notes";

export type MyNote = {
  id: string;
  courseId: number;
  lessonId: number;
  courseTitle: string;
  lessonTitle: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser."));
      return;
    }

    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(
          STORE_NAME,
          {
            keyPath: "id",
          }
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ||
        new Error("Failed to open notes database.")
      );
    };
  });
}

/* =========================================================
   GET NOTE
========================================================= */

export async function getMyNote(
  lessonId: number
): Promise<MyNote | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readonly"
      );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request =
      store.get(
        `lesson-${lessonId}`
      );

    request.onsuccess = () => {
      resolve(
        (request.result as MyNote | undefined) ??
        null
      );

      database.close();
    };

    request.onerror = () => {
      reject(
        request.error ||
        new Error("Failed to load note.")
      );

      database.close();
    };
  });
}

/* =========================================================
   SAVE NOTE
========================================================= */

export async function saveMyNote(
  note: MyNote
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request =
      store.put(note);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(
        request.error ||
        new Error("Failed to save note.")
      );
    };

    transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      reject(
        transaction.error ||
        new Error("Failed to save note.")
      );

      database.close();
    };
  });
}

/* =========================================================
   DELETE NOTE
========================================================= */

export async function deleteMyNote(
  lessonId: number
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request =
      store.delete(
        `lesson-${lessonId}`
      );

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(
        request.error ||
        new Error("Failed to delete note.")
      );
    };

    transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      reject(
        transaction.error ||
        new Error("Failed to delete note.")
      );

      database.close();
    };
  });
}

/* =========================================================
   GET ALL NOTES
========================================================= */

export async function getAllMyNotes(): Promise<MyNote[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readonly"
      );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request =
      store.getAll();

    request.onsuccess = () => {
      resolve(
        (request.result as MyNote[]) ?? []
      );

      database.close();
    };

    request.onerror = () => {
      reject(
        request.error ||
        new Error("Failed to load notes.")
      );

      database.close();
    };
  });
}