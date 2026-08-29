'use client';

import { cn } from '@/ui';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  numeric?: boolean;
}

/** Accessible table shell used across every admin list screen. */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
}: {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-paper-raised">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-left text-ink-muted">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('px-4 py-3 font-medium', column.align === 'right' && 'text-right')}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-0 align-top">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3',
                    column.align === 'right' && 'text-right',
                    column.numeric && 'tabular-nums',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}