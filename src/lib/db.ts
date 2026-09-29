import type {
  PDFDocument,
  Highlight,
  Note,
  Bookmark,
} from "../types";

const DB_NAME = "interactive-pdf-reader";
const DB_VERSION = 1;

const STORES = {
  documents: "documents",
  highlights: "highlights",
  notes: "notes",
  bookmarks: "bookmarks",
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.documents)) {
        db.createObjectStore(STORES.documents, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.highlights)) {
        db.createObjectStore(STORES.highlights, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.notes)) {
        db.createObjectStore(STORES.notes, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.bookmarks)) {
        db.createObjectStore(STORES.bookmarks, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function put<T>(
  storeName: string,
  value: T
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.put(value);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAll<T>(
  storeName: string
): Promise<T[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(
  storeName: string,
  id: string
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getDocuments(): Promise<PDFDocument[]> {
  return getAll<PDFDocument>(STORES.documents);
}

export async function getHighlights(): Promise<Highlight[]> {
  return getAll<Highlight>(STORES.highlights);
}

export async function getNotes(): Promise<Note[]> {
  return getAll<Note>(STORES.notes);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return getAll<Bookmark>(STORES.bookmarks);
}

export async function saveDocument(
  document: PDFDocument
) {
  await put(STORES.documents, document);
}

export async function saveHighlight(
  highlight: Highlight
) {
  await put(STORES.highlights, highlight);
}

export async function saveNote(note: Note) {
  await put(STORES.notes, note);
}

export async function saveBookmark(
  bookmark: Bookmark
) {
  await put(STORES.bookmarks, bookmark);
}

export async function deleteDocument(
  documentId: string
) {
  const highlights = await getHighlights();
  const notes = await getNotes();
  const bookmarks = await getBookmarks();

  for (const item of highlights) {
    if (item.documentId === documentId) {
      await remove(STORES.highlights, item.id);
    }
  }

  for (const item of notes) {
    if (item.documentId === documentId) {
      await remove(STORES.notes, item.id);
    }
  }

  for (const item of bookmarks) {
    if (item.documentId === documentId) {
      await remove(STORES.bookmarks, item.id);
    }
  }

  await remove(STORES.documents, documentId);
}