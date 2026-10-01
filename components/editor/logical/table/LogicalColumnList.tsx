'use client';

import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';

import { LogicalColumnRow } from './LogicalColumnRow';

interface LogicalColumnListProps {
  table: LogicalTable;
  foreignKeyColumnIds: Set<string>;
  onUpdate: (tableId: string, columnId: string, updates: Partial<LogicalColumn>) => void;
  onRemove: (tableId: string, columnId: string) => void;
}

export function LogicalColumnList({
  table,
  foreignKeyColumnIds,
  onUpdate,
  onRemove,
}: LogicalColumnListProps) {
  if (table.columns.length === 0) {
    return <p className="px-4 py-4 text-xs text-text-muted">Sin columnas almacenadas</p>;
  }

  return (
    <div className="divide-y divide-border">
      {table.columns.map((column) => (
        <LogicalColumnRow
          key={`${column.id}:${column.name}`}
          column={column}
          table={table}
          isForeignKey={foreignKeyColumnIds.has(column.id)}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
