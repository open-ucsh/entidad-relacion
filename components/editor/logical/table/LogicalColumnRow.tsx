'use client';

import { Columns2, KeyRound, Link2 } from 'lucide-react';

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
  const selection = useLogicalSelectionStore((state) => state.selection);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  const selected =
    selection?.type === 'table' &&
    selection.tableId === table.id &&
    selection.columnId === column.id;

  return (
    <div data-logical-column-id={column.id}>
      <button
        type="button"
        aria-label={`Propiedades de ${column.name}${column.primaryKey ? ', clave primaria' : ''}${isForeignKey ? ', clave foránea' : ''}`}
        aria-pressed={selected}
        onClick={() => {
          setSelection({ type: 'table', tableId: table.id, columnId: column.id });
        }}
        className={`flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary ${
          selected ? 'bg-brand-primary/10 text-brand-primary' : 'text-text hover:bg-surface-hover'
        }`}
      >
        <span className="flex w-6 shrink-0 items-center gap-1 text-brand-primary">
          {column.primaryKey && <KeyRound size={13} aria-hidden="true" />}
          {isForeignKey && <Link2 size={12} aria-hidden="true" />}
          {!column.primaryKey && !isForeignKey && <Columns2 size={12} aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1 wrap-anywhere">{column.name}</span>
        {selected && (
          <span className="size-1.5 shrink-0 rounded-full bg-brand-primary" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
