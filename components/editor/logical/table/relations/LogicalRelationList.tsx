'use client';

import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

import { LogicalRelationItem } from './LogicalRelationItem';

interface LogicalRelationListProps {
  table: LogicalTable;
  tables: LogicalTable[];
  onRemove: (tableId: string, foreignKeyId: string) => void;
  onUpdateCardinality: (
    tableId: string,
    foreignKeyId: string,
    side: 'source' | 'referenced',
    cardinality: LogicalRelationCardinality,
  ) => void;
}

export function LogicalRelationList({
  table,
  tables,
  onRemove,
  onUpdateCardinality,
}: LogicalRelationListProps) {
  if (table.foreignKeys.length === 0) {
    return null;
  }

  return (
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
  );
}
