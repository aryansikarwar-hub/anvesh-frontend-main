'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type PageInfo } from '@/lib/types';
import { Button } from './button';

export function Pagination({
  pageInfo,
  onPageChange,
}: {
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
}) {
  if (pageInfo.totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-4 pt-2" aria-label="Pagination">
      <p className="text-sm text-ink-muted">
        Page {pageInfo.page} of {pageInfo.totalPages}
        <span className="text-ink-faint"> · {pageInfo.total} results</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pageInfo.page <= 1}
          onClick={() => onPageChange(pageInfo.page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pageInfo.hasNext}
          onClick={() => onPageChange(pageInfo.page + 1)}
        >
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}