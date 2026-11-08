"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

/** Client-side paging helper: returns the current page slice and controls. */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));

  // Jump back to the first page whenever the underlying list changes.
  useEffect(() => setPage(1), [items]);

  const current = Math.min(page, pages);
  const slice = items.slice((current - 1) * pageSize, current * pageSize);
  return { page: current, pages, setPage, slice, total: items.length, pageSize };
}

export default function Pagination({
  page,
  pages,
  setPage,
  total,
  pageSize,
}: {
  page: number;
  pages: number;
  setPage: (p: number) => void;
  total: number;
  pageSize: number;
}) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="pagination-controls">
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Prev
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="btn btn-ghost"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </button>
      </div>
    </div>
  );
}
