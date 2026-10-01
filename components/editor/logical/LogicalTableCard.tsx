'use client';

import { ChevronDown, GripHorizontal, Link2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { useLogicalTableDrag } from './table/hooks/useLogicalTableDrag';
import { LogicalColumnRow } from './table/LogicalColumnRow';
import { LogicalRelationPanel } from './table/relations/LogicalRelationPanel';

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

  const [tableName, setTableName] = useState(table.name);

  const [showRelations, setShowRelations] = useState(false);

  const { handlePointerDown, handlePointerMove, handlePointerEnd } = useLogicalTableDrag({
    tableId: table.id,
    position,
    zoom,
    moveTable: moveLogicalTable,
  });

  const foreignKeyColumnIds = new Set(
    table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds),
  );

  function commitTableName() {
    const nextName = tableName.trim();

    if (!nextName) {
      setTableName(table.name);
      return;
    }

    if (nextName === table.name) {
      return;
    }

    renameLogicalTable(table.id, nextName);
  }

  return (
    <article
      data-logical-table-id={table.id}
      className="absolute z-20 w-72 overflow-hidden rounded-xl border border-border bg-background shadow-sm"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <header className="flex items-center gap-2 border-b border-border bg-brand-primary/5 px-2 py-2">
        <button
          type="button"
          aria-label={`Mover tabla ${table.name}`}
          className="flex size-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-text-muted transition-colors hover:bg-background hover:text-text active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <GripHorizontal size={15} aria-hidden="true" />
        </button>

        <input
          value={tableName}
          aria-label="Nombre de la tabla"
          className="min-w-0 flex-1 bg-transparent text-sm font-bold uppercase tracking-wide text-text outline-none"
          onChange={(event) => {
            setTableName(event.target.value);
          }}
          onBlur={commitTableName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }

            if (event.key === 'Escape') {
              setTableName(table.name);
              event.currentTarget.blur();
            }
          }}
        />

        <button
          type="button"
          aria-label={`Eliminar tabla ${table.name}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-600"
          onClick={() => {
            removeLogicalTable(table.id);
          }}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </header>

      {table.columns.length > 0 ? (
        <div className="divide-y divide-border">
          {table.columns.map((column) => (
            <LogicalColumnRow
              key={`${column.id}:${column.name}`}
              column={column}
              table={table}
              isForeignKey={foreignKeyColumnIds.has(column.id)}
              onUpdate={updateLogicalColumn}
              onRemove={removeLogicalColumn}
            />
          ))}
        </div>
      ) : (
        <p className="px-4 py-4 text-xs text-text-muted">Sin columnas almacenadas</p>
      )}

      <footer className="border-t border-border p-2">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            onClick={() => {
              addLogicalColumn(table.id);
            }}
          >
            <Plus size={13} aria-hidden="true" />
            Columna
          </button>

          <button
            type="button"
            aria-expanded={showRelations}
            className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            onClick={() => {
              setShowRelations((current) => !current);
            }}
          >
            <Link2 size={13} aria-hidden="true" />
            Relación
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={showRelations ? 'rotate-180 transition-transform' : 'transition-transform'}
            />
          </button>
        </div>

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
