import {
  useEffect,
  useState,
} from "react";

import {
  Document,
  Page,
} from "react-pdf";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bookmark,
  Highlighter,
  Save,
} from "lucide-react";

import type {
  PDFDocument,
  Highlight,
  Note,
  Bookmark as BookmarkType,
} from "../types";

import {
  searchPDF,
} from "../lib/pdfSearch";

interface Props {
  document: PDFDocument;

  highlights: Highlight[];
  notes: Note[];
  bookmarks: BookmarkType[];

  onPageChange: (page: number) => void;

  onHighlight: (
    text: string,
    page: number
  ) => void;

  onNote: (
    text: string,
    page: number
  ) => void;

  onBookmark: (page: number) => void;

  onDocumentLoaded: (
    pages: number
  ) => void;
}

export default function Reader({
  document,
  highlights,
  notes,
  bookmarks,
  onPageChange,
  onHighlight,
  onNote,
  onBookmark,
  onDocumentLoaded,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [results, setResults] =
    useState<
      {
        page: number;
        preview: string;
      }[]
    >([]);

  const [note, setNote] =
    useState("");

  const [numPages, setNumPages] =
    useState(document.totalPages || 0);

  const [scale, setScale] =
    useState(1.15);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      try {
        const matches = await searchPDF(
          document.file,
          search
        );

        setResults(matches);
      } catch (error) {
        console.error(error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, document.file]);

  function handleLoadSuccess({
    numPages,
  }: {
    numPages: number;
  }) {
    setNumPages(numPages);
    onDocumentLoaded(numPages);
  }

  function previousPage() {
    if (document.currentPage > 1) {
      onPageChange(
        document.currentPage - 1
      );
    }
  }

  function nextPage() {
    if (document.currentPage < numPages) {
      onPageChange(
        document.currentPage + 1
      );
    }
  }

  function handleSelection() {
    const selection =
      window.getSelection();

    if (!selection) return;

    const text =
      selection.toString().trim();

    if (!text) return;

    onHighlight(
      text,
      document.currentPage
    );

    selection.removeAllRanges();
  }

  function saveNote() {
    if (!note.trim()) return;

    onNote(
      note.trim(),
      document.currentPage
    );

    setNote("");
  }

  const pageHighlights =
    highlights.filter(
      (item) =>
        item.page === document.currentPage
    );

  const pageNotes =
    notes.filter(
      (item) =>
        item.page === document.currentPage
    );

  const pageBookmarks =
    bookmarks.filter(
      (item) =>
        item.page === document.currentPage
    );

  return (
    <main className="reader">
      <header className="reader-header">
        <div>
          <h1>{document.name}</h1>

          <span>
            Page {document.currentPage} of{" "}
            {numPages}
          </span>
        </div>

        <div className="search-box">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search PDF..."
          />
        </div>
      </header>

      <div className="toolbar">
        <button
          onClick={previousPage}
          disabled={
            document.currentPage <= 1
          }
        >
          <ChevronLeft />
        </button>

        <span>
          {document.currentPage} / {numPages}
        </span>

        <button
          onClick={nextPage}
          disabled={
            document.currentPage >= numPages
          }
        >
          <ChevronRight />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() =>
            setScale(
              Math.max(
                0.7,
                scale - 0.1
              )
            )
          }
        >
          −
        </button>

        <span>
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={() =>
            setScale(
              Math.min(
                2,
                scale + 0.1
              )
            )
          }
        >
          +
        </button>

        <button
          className={
            pageBookmarks.length
              ? "active-tool"
              : ""
          }
          onClick={() =>
            onBookmark(
              document.currentPage
            )
          }
        >
          <Bookmark size={18} />
          Bookmark
        </button>
      </div>

      {results.length > 0 && (
        <div className="search-results">
          <strong>
            {results.length} result(s)
          </strong>

          {results.map((result, index) => (
            <button
              key={index}
              onClick={() =>
                onPageChange(result.page)
              }
            >
              <b>Page {result.page}</b>
              <span>
                {result.preview}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="reader-content">
        <div
          className="pdf-container"
          onMouseUp={handleSelection}
        >
          <Document
            file={document.file}
            onLoadSuccess={
              handleLoadSuccess
            }
            loading={
              <div className="loading">
                Loading PDF...
              </div>
            }
            error={
              <div className="error">
                Unable to load PDF.
              </div>
            }
          >
            <Page
              pageNumber={document.currentPage}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>

        <aside className="annotation-panel">
          <h2>Annotations</h2>

          <section>
            <div className="section-title">
              <Highlighter size={17} />
              Highlights
            </div>

            {pageHighlights.length === 0 ? (
              <p className="muted">
                Select text in the PDF to
                create a highlight.
              </p>
            ) : (
              pageHighlights.map(
                (highlight) => (
                  <div
                    className="highlight-card"
                    key={highlight.id}
                  >
                    {highlight.text}
                  </div>
                )
              )
            )}
          </section>

          <section>
            <div className="section-title">
              Notes
            </div>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Write a note..."
            />

            <button
              className="save-note"
              onClick={saveNote}
            >
              <Save size={16} />
              Save Note
            </button>

            {pageNotes.map((item) => (
              <div
                className="note-card"
                key={item.id}
              >
                {item.text}
              </div>
            ))}
          </section>

          <section>
            <div className="section-title">
              Bookmarks
            </div>

            {bookmarks.length === 0 ? (
              <p className="muted">
                No bookmarks.
              </p>
            ) : (
              bookmarks.map((bookmark) => (
                <button
                  className="bookmark-card"
                  key={bookmark.id}
                  onClick={() =>
                    onPageChange(
                      bookmark.page
                    )
                  }
                >
                  <Bookmark size={15} />
                  Page {bookmark.page}
                </button>
              ))
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}