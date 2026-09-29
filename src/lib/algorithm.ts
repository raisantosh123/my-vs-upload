import type {
  PDFDocument,
  Highlight,
  Note,
  Bookmark,
} from "../types";

export function clampPage(
  page: number,
  totalPages: number
): number {
  if (totalPages <= 0) return 1;

  return Math.max(
    1,
    Math.min(page, totalPages)
  );
}

export function searchLibrary(
  documents: PDFDocument[],
  query: string
): PDFDocument[] {
  const normalized = query
    .trim()
    .toLowerCase();

  if (!normalized) {
    return documents;
  }

  return documents.filter((document) =>
    document.name
      .toLowerCase()
      .includes(normalized)
  );
}

export function findTextMatches(
  pageTexts: string[],
  query: string
) {
  const normalized = query
    .trim()
    .toLowerCase();

  if (!normalized) {
    return [];
  }

  const results: {
    page: number;
    preview: string;
  }[] = [];

  for (let i = 0; i < pageTexts.length; i++) {
    const text = pageTexts[i];
    const lower = text.toLowerCase();

    const index = lower.indexOf(normalized);

    if (index !== -1) {
      const start = Math.max(
        0,
        index - 60
      );

      const end = Math.min(
        text.length,
        index + normalized.length + 100
      );

      results.push({
        page: i + 1,
        preview: text.slice(start, end),
      });
    }
  }

  return results;
}

export function sortBookmarks(
  bookmarks: Bookmark[]
) {
  return [...bookmarks].sort(
    (a, b) => a.page - b.page
  );
}

export function getPageAnnotations(
  page: number,
  highlights: Highlight[],
  notes: Note[],
  bookmarks: Bookmark[]
) {
  return {
    highlights: highlights.filter(
      (item) => item.page === page
    ),

    notes: notes.filter(
      (item) => item.page === page
    ),

    bookmarks: bookmarks.filter(
      (item) => item.page === page
    ),
  };
}