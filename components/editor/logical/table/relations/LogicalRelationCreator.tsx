'use client';

import { Plus } from 'lucide-react';

import type { LogicalTable } from '@/domain/logical/models';

interface LogicalRelationCreatorProps {
  table: LogicalTable;
  tables: LogicalTable[];
  onAdd: (tableId: string, referencedTableId: string) => void;
}

export function LogicalRelationCreator({ table, tables, onAdd }: LogicalRelationCreatorProps) {
  const availableReferencedTables = tables.filter(
    (candidate) =>
      candidate.id !== table.id && candidate.columns.some((column) => column.primaryKey),
  );

  if (availableReferencedTables.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
        Nueva relación
      </p>

      <div className="flex max-h-32 flex-col gap-0.5 overflow-y-auto">
        {availableReferencedTables.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
            onClick={() => {
              onAdd(table.id, candidate.id);
            }}
          >
            <Plus size={11} className="shrink-0 text-text-muted" aria-hidden="true" />

            <span className="min-w-0 flex-1 truncate text-xs text-text">{candidate.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
