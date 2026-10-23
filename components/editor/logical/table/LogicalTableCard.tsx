'use client';

import { useMemo } from 'react';

import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { useLogicalTableDrag } from './hooks/useLogicalTableDrag';
import { LogicalColumnList } from './LogicalColumnList';
import { LogicalTableActions } from './LogicalTableActions';
import { LogicalTableHeader } from './LogicalTableHeader';

interface LogicalTableCardProps {
  table: LogicalTable;
  position: LogicalTablePosition;
  zoom: number;
  selected: boolean;
  onSelect: () => void;
}

export function LogicalTableCard({
  table,
  position,
  zoom,
  selected,
  onSelect,
}: LogicalTableCardProps) {
  const renameLogicalTable = useDiagramStore((state) => state.renameLogicalTable);

  const removeLogicalTable = useDiagramStore((state) => state.removeLogicalTable);

  const addLogicalColumn = useDiagramStore((state) => state.addLogicalColumn);

  const updateLogicalColumn = useDiagramStore((state) => state.updateLogicalColumn);

  const removeLogicalColumn = useDiagramStore((state) => state.removeLogicalColumn);

  const moveLogicalTable = useDiagramStore((state) => state.moveLogicalTable);

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
      className={`absolute z-20 w-72 rounded-xl border bg-background shadow-sm transition-[border-color,box-shadow] ${
        selected ? 'border-brand-primary ring-1 ring-brand-primary/10' : 'border-border'
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
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
          onAddColumn={() => {
            addLogicalColumn(table.id);
            onSelect();
          }}
          onEditRelations={onSelect}
        />
      </footer>
    </article>
  );
}
