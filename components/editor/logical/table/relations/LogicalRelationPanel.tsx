'use client';

import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

import { LogicalRelationCreator } from './LogicalRelationCreator';
import { LogicalRelationList } from './LogicalRelationList';

interface LogicalRelationPanelProps {
  table: LogicalTable;
  tables: LogicalTable[];
  onAdd: (tableId: string, referencedTableId: string) => void;
  onRemove: (tableId: string, foreignKeyId: string) => void;
  onUpdateCardinality: (
    tableId: string,
    foreignKeyId: string,
    side: 'source' | 'referenced',
    cardinality: LogicalRelationCardinality,
  ) => void;
}

export function LogicalRelationPanel({
  table,
  tables,
  onAdd,
  onRemove,
  onUpdateCardinality,
}: LogicalRelationPanelProps) {
  const hasAvailableReferencedTables = tables.some(
    (candidate) =>
      candidate.id !== table.id && candidate.columns.some((column) => column.primaryKey),
  );

  const isEmpty = table.foreignKeys.length === 0 && !hasAvailableReferencedTables;

  return (
    <div className="mt-2 space-y-3 border-t border-border pt-2">
      <LogicalRelationList
        table={table}
        tables={tables}
        onRemove={onRemove}
        onUpdateCardinality={onUpdateCardinality}
      />

      <LogicalRelationCreator table={table} tables={tables} onAdd={onAdd} />

      {isEmpty && (
        <p className="px-2 py-1 text-xs leading-relaxed text-text-muted">
          No hay tablas con clave primaria disponibles.
        </p>
      )}
    </div>
  );
}
