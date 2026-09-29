import {
  useEffect,
  useRef,
  useState,
} from "react";

import Library from "./components/Library";
import Reader from "./components/Reader";

import type {
  PDFDocument,
  Highlight,
  Note,
  Bookmark,
} from "./types";

import {
  getDocuments,
  getHighlights,
  getNotes,
  getBookmarks,
  saveDocument,
  saveHighlight,
  saveNote,
  saveBookmark,
  deleteDocument,
} from "./lib/db";

import { clampPage } from "./lib/algorithms";

import "./styles.css";

export default function App() {
  const [documents, setDocuments] =
    useState<PDFDocument[]>([]);

  const [highlights, setHighlights] =
    useState<Highlight[]>([]);

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [bookmarks, setBookmarks] =
    useState<Bookmark[]>([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [librarySearch, setLibrarySearch] =
    useState("");

  const fileInput =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const [
        docs,
        savedHighlights,
        savedNotes,
        savedBookmarks,
      ] = await Promise.all([
        getDocuments(),
        getHighlights(),
        getNotes(),
        getBookmarks(),
      ]);

      setDocuments(docs);
      setHighlights(savedHighlights);
      setNotes(savedNotes);
      setBookmarks(savedBookmarks);

      if (docs.length > 0) {
        setSelectedId(docs[0].id);
      }
    }

    loadData();
  }, []);

  const selectedDocument =
    documents.find(
      (doc) => doc.id === selectedId
    ) || null;

  function openFileDialog() {
    fileInput.current?.click();
  }

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    const id =
      crypto.randomUUID();

    const document: PDFDocument = {
      id,
      name: file.name,
      size: file.size,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPage: 1,
      totalPages: 0,
      file,
    };

    await saveDocument(document);

    setDocuments((current) => [
      ...current,
      document,
    ]);

    setSelectedId(id);

    event.target.value = "";
  }

  async function updatePage(
    page: number
  ) {
    if (!selectedDocument) return;

    const safePage = clampPage(
      page,
      selectedDocument.totalPages
    );

    const updated = {
      ...selectedDocument,
      currentPage: safePage,
      updatedAt: Date.now(),
    };

    await saveDocument(updated);

    setDocuments((current) =>
      current.map((doc) =>
        doc.id === updated.id
          ? updated
          : doc
      )
    );
  }

  async function handleDocumentLoaded(
    pages: number
  ) {
    if (!selectedDocument) return;

    if (
      selectedDocument.totalPages === pages
    ) {
      return;
    }

    const updated = {
      ...selectedDocument,
      totalPages: pages,
      currentPage: clampPage(
        selectedDocument.currentPage,
        pages
      ),
      updatedAt: Date.now(),
    };

    await saveDocument(updated);

    setDocuments((current) =>
      current.map((doc) =>
        doc.id === updated.id
          ? updated
          : doc
      )
    );
  }

  async function addHighlight(
    text: string,
    page: number
  ) {
    if (!selectedDocument) return;

    const highlight: Highlight = {
      id: crypto.randomUUID(),
      documentId: selectedDocument.id,
      page,
      text,
      createdAt: Date.now(),
    };

    await saveHighlight(highlight);

    setHighlights((current) => [
      ...current,
      highlight,
    ]);
  }

  async function addNote(
    text: string,
    page: number
  ) {
    if (!selectedDocument) return;

    const note: Note = {
      id: crypto.randomUUID(),
      documentId: selectedDocument.id,
      page,
      text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveNote(note);

    setNotes((current) => [
      ...current,
      note,
    ]);
  }

  async function addBookmark(
    page: number
  ) {
    if (!selectedDocument) return;

    const exists = bookmarks.some(
      (bookmark) =>
        bookmark.documentId ===
          selectedDocument.id &&
        bookmark.page === page
    );

    if (exists) return;

    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      documentId: selectedDocument.id,
      page,
      title: `Page ${page}`,
      createdAt: Date.now(),
    };

    await saveBookmark(bookmark);

    setBookmarks((current) => [
      ...current,
      bookmark,
    ]);
  }

  async function removeDocument(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this PDF and its annotations?"
      );

    if (!confirmed) return;

    await deleteDocument(id);

    setDocuments((current) =>
      current.filter(
        (doc) => doc.id !== id
      )
    );

    setHighlights((current) =>
      current.filter(
        (item) => item.documentId !== id
      )
    );

    setNotes((current) =>
      current.filter(
        (item) => item.documentId !== id
      )
    );

    setBookmarks((current) =>
      current.filter(
        (item) => item.documentId !== id
      )
    );

    if (selectedId === id) {
      const remaining =
        documents.filter(
          (doc) => doc.id !== id
        );

      setSelectedId(
        remaining[0]?.id || null
      );
    }
  }

  return (
    <div className="app">
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        hidden
        onChange={handleFile}
      />

      <Library
        documents={documents}
        selectedId={selectedId}
        search={librarySearch}
        onSearch={setLibrarySearch}
        onOpen={openFileDialog}
        onSelect={setSelectedId}
        onDelete={removeDocument}
      />

      {selectedDocument ? (
        <Reader
          document={selectedDocument}
          highlights={highlights.filter(
            (item) =>
              item.documentId ===
              selectedDocument.id
          )}
          notes={notes.filter(
            (item) =>
              item.documentId ===
              selectedDocument.id
          )}
          bookmarks={bookmarks.filter(
            (item) =>
              item.documentId ===
              selectedDocument.id
          )}
          onPageChange={updatePage}
          onHighlight={addHighlight}
          onNote={addNote}
          onBookmark={addBookmark}
          onDocumentLoaded={
            handleDocumentLoaded
          }
        />
      ) : (
        <main className="welcome">
          <div className="welcome-card">
            <h1>
              Interactive PDF Reader
            </h1>

            <p>
              Open a PDF to start reading.
            </p>

            <button
              onClick={openFileDialog}
            >
              Open PDF
            </button>
          </div>
        </main>
      )}
    </div>
  );
}