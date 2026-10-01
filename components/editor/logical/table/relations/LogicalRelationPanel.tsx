'use client';

import { Plus } from 'lucide-react';

import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

import { LogicalRelationItem } from './LogicalRelationItem';

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
  const availableReferencedTables = tables.filter(
    (candidate) =>
      candidate.id !== table.id && candidate.columns.some((column) => column.primaryKey),
  );

  return (
    <div className="mt-2 space-y-3 border-t border-border pt-2">
      {table.foreignKeys.length > 0 && (
        <div>
          <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Relaciones actuales
          </p>

          <div className="space-y-1">
            {table.foreignKeys.map((foreignKey) => {
              const referencedTable = tables.find(
                (candidate) => candidate.id === foreignKey.referencedTableId,
              );

              return (
                <LogicalRelationItem
                  key={foreignKey.id}
                  table={table}
                  foreignKey={foreignKey}
                  referencedTable={referencedTable}
                  onRemove={onRemove}
                  onUpdateCardinality={onUpdateCardinality}
                />
              );
            })}
          </div>
        </div>
      )}

      {availableReferencedTables.length > 0 && (
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
      )}

      {table.foreignKeys.length === 0 && availableReferencedTables.length === 0 && (
        <p className="px-2 py-1 text-xs leading-relaxed text-text-muted">
          No hay tablas con clave primaria disponibles.
        </p>
      )}
    </div>
  );
}
