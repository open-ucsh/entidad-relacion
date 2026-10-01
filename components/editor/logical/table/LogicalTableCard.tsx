'use client';

import { useMemo, useState } from 'react';

import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { useLogicalTableDrag } from './hooks/useLogicalTableDrag';
import { LogicalColumnList } from './LogicalColumnList';
import { LogicalRelationPanel } from './relations/LogicalRelationPanel';
import { LogicalTableActions } from './LogicalTableActions';
import { LogicalTableHeader } from './LogicalTableHeader';

interface LogicalTableCardProps {
  table: LogicalTable;
  position: LogicalTablePosition;
  zoom: number;
}

export function LogicalTableCard({ table, position, zoom }: LogicalTableCardProps) {
  const renameLogicalTable = useDiagramStore((state) => state.renameLogicalTable);

  const removeLogicalTable = useDiagramStore((state) => state.removeLogicalTable);

  const addLogicalColumn = useDiagramStore((state) => state.addLogicalColumn);

  const updateLogicalColumn = useDiagramStore((state) => state.updateLogicalColumn);

  const removeLogicalColumn = useDiagramStore((state) => state.removeLogicalColumn);

  const moveLogicalTable = useDiagramStore((state) => state.moveLogicalTable);

  const addLogicalForeignKey = useDiagramStore((state) => state.addLogicalForeignKey);

  const removeLogicalForeignKey = useDiagramStore((state) => state.removeLogicalForeignKey);

  const updateLogicalForeignKeyCardinality = useDiagramStore(
    (state) => state.updateLogicalForeignKeyCardinality,
  );

  const tables = useDiagramStore((state) => state.logicalWorkspace.model.tables);

  const [showRelations, setShowRelations] = useState(false);

  const { handlePointerDown, handlePointerMove, handlePointerEnd } = useLogicalTableDrag({
    tableId: table.id,
    position,
    zoom,
    moveTable: moveLogicalTable,
  });

  const foreignKeyColumnIds = useMemo(
    () => new Set(table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds)),
    [table.foreignKeys],
  );

  return (
    <article
      data-logical-table-id={table.id}
      className="absolute z-20 w-72 overflow-hidden rounded-xl border border-border bg-background shadow-sm"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <LogicalTableHeader
        tableId={table.id}
        tableName={table.name}
        onRename={renameLogicalTable}
        onRemove={removeLogicalTable}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerEnd={handlePointerEnd}
      />

      <LogicalColumnList
        table={table}
        foreignKeyColumnIds={foreignKeyColumnIds}
        onUpdate={updateLogicalColumn}
        onRemove={removeLogicalColumn}
      />

      <footer className="border-t border-border p-2">
        <LogicalTableActions
          showRelations={showRelations}
          onAddColumn={() => {
            addLogicalColumn(table.id);
          }}
          onToggleRelations={() => {
            setShowRelations((current) => !current);
          }}
        />

        {showRelations && (
          <LogicalRelationPanel
            table={table}
            tables={tables}
            onAdd={addLogicalForeignKey}
            onRemove={removeLogicalForeignKey}
            onUpdateCardinality={updateLogicalForeignKeyCardinality}
          />
        )}
      </footer>
    </article>
  );
}
