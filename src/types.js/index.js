export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  currentPage: number;
  totalPages: number;
  file: Blob;
}

export interface Highlight {
  id: string;
  documentId: string;
  page: number;
  text: string;
  createdAt: number;
}

export interface Note {
  id: string;
  documentId: string;
  page: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  documentId: string;
  page: number;
  title: string;
  createdAt: number;
}