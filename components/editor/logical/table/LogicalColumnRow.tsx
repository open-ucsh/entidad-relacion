'use client';

import { KeyRound, Link2 } from 'lucide-react';

import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';

import { useLogicalSelectionStore } from '../logical-selection';

interface LogicalColumnRowProps {
  column: LogicalColumn;
  table: LogicalTable;
  isForeignKey: boolean;
  onUpdate: (tableId: string, columnId: string, updates: Partial<LogicalColumn>) => void;
  onRemove: (tableId: string, columnId: string) => void;
}

export function LogicalColumnRow({ column, table, isForeignKey }: LogicalColumnRowProps) {
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  return (
    <div data-logical-column-id={column.id}>
      <button
        type="button"
        aria-label={`Ver propiedades de ${column.name}`}
        onClick={() => {
          setSelection({
            type: 'table',
            tableId: table.id,
            columnId: column.id,
          });
        }}
        className="flex min-h-10 w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/40"
      >
        <span className="flex w-7 shrink-0 items-center justify-center gap-1">
          {column.primaryKey && (
            <KeyRound size={13} className="text-amber-600" aria-hidden="true" />
          )}

          {isForeignKey && <Link2 size={13} className="text-brand-primary" aria-hidden="true" />}

          {!column.primaryKey && !isForeignKey && (
            <span className="size-1 rounded-full bg-border" aria-hidden="true" />
          )}
        </span>

        <span className="min-w-0 flex-1 text-xs font-medium leading-5 text-text wrap-anywhere">
          {column.name}
        </span>

        {(column.primaryKey || isForeignKey) && (
          <span className="flex shrink-0 items-center gap-1">
            {column.primaryKey && (
              <span
                aria-label="Clave primaria"
                className="rounded-md bg-amber-500/10 px-1.5 py-1 text-[9px] font-semibold text-amber-700"
              >
                PK
              </span>
            )}

            {isForeignKey && (
              <span
                aria-label="Clave foránea"
                className="rounded-md bg-brand-primary/10 px-1.5 py-1 text-[9px] font-semibold text-brand-primary"
              >
                FK
              </span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
