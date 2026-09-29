import {
  BookOpen,
  FileText,
  Search,
  Upload,
  Trash2,
} from "lucide-react";

import type { PDFDocument } from "../types";

interface Props {
  documents: PDFDocument[];
  selectedId: string | null;
  search: string;
  onSearch: (value: string) => void;
  onOpen: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Library({
  documents,
  selectedId,
  search,
  onSearch,
  onOpen,
  onSelect,
  onDelete,
}: Props) {
  const filtered = documents.filter(
    (document) =>
      document.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div className="logo">
        <BookOpen size={24} />
        <span>PDF Reader</span>
      </div>

      <button
        className="upload-button"
        onClick={onOpen}
      >
        <Upload size={18} />
        Open PDF
      </button>

      <div className="library-title">
        My Library
      </div>

      <div className="library-search">
        <Search size={16} />

        <input
          value={search}
          onChange={(e) =>
            onSearch(e.target.value)
          }
          placeholder="Search library..."
        />
      </div>

      <div className="document-list">
        {filtered.map((document) => (
          <div
            key={document.id}
            className={
              selectedId === document.id
                ? "document-item active"
                : "document-item"
            }
            onClick={() =>
              onSelect(document.id)
            }
          >
            <FileText size={18} />

            <div className="document-info">
              <div className="document-name">
                {document.name}
              </div>

              <div className="document-page">
                Page {document.currentPage}
              </div>
            </div>

            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-library">
            No PDF files
          </div>
        )}
      </div>
    </aside>
  );
}