'use client';

import {
  ChevronDown,
  GripHorizontal,
  KeyRound,
  Link,
  Link2,
  Plus,
  Trash2,
  Unlink,
} from 'lucide-react';
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import type {
  LogicalColumn,
  LogicalRelationCardinality,
  LogicalTable,
  LogicalTablePosition,
} from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

interface LogicalTableCardProps {
  table: LogicalTable;
  position: LogicalTablePosition;
  zoom: number;
}

interface DragState {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startTableX: number;
  startTableY: number;
  moved: boolean;
}

interface LogicalColumnRowProps {
  column: LogicalColumn;
  table: LogicalTable;
  isForeignKey: boolean;
  onUpdate: (tableId: string, columnId: string, updates: Partial<LogicalColumn>) => void;
  onRemove: (tableId: string, columnId: string) => void;
}

type CardinalityValue = '0..1' | '1..1' | '0..N' | '1..N';

const CARDINALITY_OPTIONS: {
  value: CardinalityValue;
  label: string;
  cardinality: LogicalRelationCardinality;
}[] = [
  {
    value: '0..1',
    label: '0..1',
    cardinality: {
      minimum: 0,
      maximum: 1,
    },
  },
  {
    value: '1..1',
    label: '1..1',
    cardinality: {
      minimum: 1,
      maximum: 1,
    },
  },
  {
    value: '0..N',
    label: '0..N',
    cardinality: {
      minimum: 0,
      maximum: 'N',
    },
  },
  {
    value: '1..N',
    label: '1..N',
    cardinality: {
      minimum: 1,
      maximum: 'N',
    },
  },
];

function getCardinalityValue(cardinality: LogicalRelationCardinality): CardinalityValue {
  if (cardinality.minimum === 0 && cardinality.maximum === 1) {
    return '0..1';
  }

  if (cardinality.minimum === 1 && cardinality.maximum === 1) {
    return '1..1';
  }

  if (cardinality.minimum === 1 && cardinality.maximum === 'N') {
    return '1..N';
  }

  return '0..N';
}

function getCardinality(value: CardinalityValue): LogicalRelationCardinality {
  return (
    CARDINALITY_OPTIONS.find((option) => option.value === value)?.cardinality ?? {
      minimum: 0,
      maximum: 'N',
    }
  );
}

function LogicalColumnRow({
  column,
  table,
  isForeignKey,
  onUpdate,
  onRemove,
}: LogicalColumnRowProps) {
  const [name, setName] = useState(column.name);

  function commitName() {
    const nextName = name.trim();

    if (!nextName) {
      setName(column.name);
      return;
    }

    if (nextName === column.name) {
      return;
    }

    onUpdate(table.id, column.id, {
      name: nextName,
    });
  }

  return (
    <div
      data-logical-column-id={column.id}
      className="group flex min-h-10 items-center gap-2 px-3 py-2"
    >
      <span className="flex w-8 shrink-0 items-center gap-1">
        {column.primaryKey && (
          <KeyRound size={12} className="text-amber-600" aria-label="Clave primaria" />
        )}

        {isForeignKey && (
          <Link size={12} className="text-brand-primary" aria-label="Clave foránea" />
        )}
      </span>

      <input
        value={name}
        aria-label={`Nombre de la columna ${column.name}`}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text outline-none"
        onChange={(event) => {
          setName(event.target.value);
        }}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            setName(column.name);
            event.currentTarget.blur();
          }
        }}
      />

      <label
        className="cursor-pointer text-[10px] font-semibold text-text-muted"
        title="Clave primaria"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={column.primaryKey}
          onChange={(event) => {
            onUpdate(table.id, column.id, {
              primaryKey: event.target.checked,
              nullable: event.target.checked ? false : column.nullable,
            });
          }}
        />

        <span className={column.primaryKey ? 'text-amber-600' : 'opacity-40 hover:opacity-100'}>
          PK
        </span>
      </label>

      <label
        className="cursor-pointer text-[10px] font-semibold text-text-muted"
        title="Valor único"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={column.unique}
          onChange={(event) => {
            onUpdate(table.id, column.id, {
              unique: event.target.checked,
            });
          }}
        />

        <span className={column.unique ? 'text-brand-primary' : 'opacity-40 hover:opacity-100'}>
          UQ
        </span>
      </label>

      <label
        className="cursor-pointer text-[10px] font-semibold text-text-muted"
        title="Permitir NULL"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={column.nullable}
          disabled={column.primaryKey}
          onChange={(event) => {
            onUpdate(table.id, column.id, {
              nullable: event.target.checked,
            });
          }}
        />

        <span className={column.nullable ? 'text-text' : 'opacity-40 hover:opacity-100'}>NULL</span>
      </label>

      <button
        type="button"
        aria-label={`Eliminar columna ${column.name}`}
        className="flex size-6 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
        onClick={() => {
          onRemove(table.id, column.id);
        }}
      >
        <Trash2 size={12} aria-hidden="true" />
      </button>
    </div>
  );
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

  const dragRef = useRef<DragState | null>(null);

  const foreignKeyColumnIds = new Set(
    table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds),
  );

  const availableReferencedTables = tables.filter(
    (candidate) =>
      candidate.id !== table.id && candidate.columns.some((column) => column.primaryKey),
  );

  function commitTableName() {
    const nextName = tableName.trim();

    if (!nextName) {
      setTableName(table.name);
      return;
    }

    if (nextName !== table.name) {
      renameLogicalTable(table.id, nextName);
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startTableX: position.x,
      startTableY: position.y,
      moved: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = (event.clientX - drag.startPointerX) / zoom;
    const deltaY = (event.clientY - drag.startPointerY) / zoom;

    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
      drag.moved = true;
    }

    moveLogicalTable(
      table.id,
      {
        x: Math.max(0, drag.startTableX + deltaX),
        y: Math.max(0, drag.startTableY + deltaY),
      },
      {
        recordHistory: false,
      },
    );
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag.moved) {
      return;
    }

    const deltaX = (event.clientX - drag.startPointerX) / zoom;
    const deltaY = (event.clientY - drag.startPointerY) / zoom;

    const finalPosition = {
      x: Math.max(0, drag.startTableX + deltaX),
      y: Math.max(0, drag.startTableY + deltaY),
    };

    moveLogicalTable(table.id, finalPosition, {
      recordHistory: true,
      historyPosition: {
        x: drag.startTableX,
        y: drag.startTableY,
      },
    });
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
                      <div
                        key={foreignKey.id}
                        className="rounded-md border border-border bg-surface/40 p-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Link
                            size={11}
                            className="shrink-0 text-brand-primary"
                            aria-hidden="true"
                          />

                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">
                            {referencedTable?.name ?? 'Tabla eliminada'}
                          </span>

                          <button
                            type="button"
                            aria-label={`Eliminar relación con ${referencedTable?.name ?? 'tabla'}`}
                            title="Eliminar relación"
                            className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-600"
                            onClick={() => {
                              removeLogicalForeignKey(table.id, foreignKey.id);
                            }}
                          >
                            <Unlink size={11} aria-hidden="true" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                          <select
                            aria-label={`Cardinalidad de ${table.name}`}
                            value={getCardinalityValue(foreignKey.sourceCardinality)}
                            className="min-w-0 flex-1 rounded-md border border-border bg-background px-1.5 py-1 text-[10px] text-text outline-none focus:border-brand-primary"
                            onChange={(event) => {
                              updateLogicalForeignKeyCardinality(
                                table.id,
                                foreignKey.id,
                                'source',
                                getCardinality(event.target.value as CardinalityValue),
                              );
                            }}
                          >
                            {CARDINALITY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <span className="shrink-0 text-[10px] text-text-muted">→</span>

                          <select
                            aria-label={`Cardinalidad de ${
                              referencedTable?.name ?? 'tabla referenciada'
                            }`}
                            value={getCardinalityValue(foreignKey.referencedCardinality)}
                            className="min-w-0 flex-1 rounded-md border border-border bg-background px-1.5 py-1 text-[10px] text-text outline-none focus:border-brand-primary"
                            onChange={(event) => {
                              updateLogicalForeignKeyCardinality(
                                table.id,
                                foreignKey.id,
                                'referenced',
                                getCardinality(event.target.value as CardinalityValue),
                              );
                            }}
                          >
                            {CARDINALITY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
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
                        addLogicalForeignKey(table.id, candidate.id);
                      }}
                    >
                      <Plus size={11} className="shrink-0 text-text-muted" aria-hidden="true" />

                      <span className="min-w-0 flex-1 truncate text-xs text-text">
                        {candidate.name}
                      </span>
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
        )}
      </footer>
    </article>
  );
}
