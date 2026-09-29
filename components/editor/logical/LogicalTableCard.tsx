'use client';

import { GripHorizontal, KeyRound, Link, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

interface LogicalTableCardProps {
  table: LogicalTable;
  position: LogicalTablePosition;
}

interface DragState {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startTableX: number;
  startTableY: number;
}

export function LogicalTableCard({ table, position }: LogicalTableCardProps) {
  const renameLogicalTable = useDiagramStore((state) => state.renameLogicalTable);
  const removeLogicalTable = useDiagramStore((state) => state.removeLogicalTable);
  const addLogicalColumn = useDiagramStore((state) => state.addLogicalColumn);
  const updateLogicalColumn = useDiagramStore((state) => state.updateLogicalColumn);
  const removeLogicalColumn = useDiagramStore((state) => state.removeLogicalColumn);
  const moveLogicalTable = useDiagramStore((state) => state.moveLogicalTable);

  const [tableName, setTableName] = useState(table.name);

  const dragRef = useRef<DragState | null>(null);

  const foreignKeyColumnIds = new Set(
    table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds),
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

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startTableX: position.x,
      startTableY: position.y,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    moveLogicalTable(table.id, {
      x: Math.max(0, drag.startTableX + event.clientX - drag.startPointerX),
      y: Math.max(0, drag.startTableY + event.clientY - drag.startPointerY),
    });
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
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
          {table.columns.map((column) => {
            const isForeignKey = foreignKeyColumnIds.has(column.id);

            return (
              <div
                key={column.id}
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
                  value={column.name}
                  aria-label="Nombre de la columna"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text outline-none"
                  onChange={(event) => {
                    updateLogicalColumn(table.id, column.id, {
                      name: event.target.value,
                    });
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
                      updateLogicalColumn(table.id, column.id, {
                        primaryKey: event.target.checked,
                        nullable: event.target.checked ? false : column.nullable,
                      });
                    }}
                  />

                  <span
                    className={
                      column.primaryKey ? 'text-amber-600' : 'opacity-40 hover:opacity-100'
                    }
                  >
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
                      updateLogicalColumn(table.id, column.id, {
                        unique: event.target.checked,
                      });
                    }}
                  />

                  <span
                    className={
                      column.unique ? 'text-brand-primary' : 'opacity-40 hover:opacity-100'
                    }
                  >
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
                      updateLogicalColumn(table.id, column.id, {
                        nullable: event.target.checked,
                      });
                    }}
                  />

                  <span className={column.nullable ? 'text-text' : 'opacity-40 hover:opacity-100'}>
                    NULL
                  </span>
                </label>

                <button
                  type="button"
                  aria-label={`Eliminar columna ${column.name}`}
                  className="flex size-6 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                  onClick={() => {
                    removeLogicalColumn(table.id, column.id);
                  }}
                >
                  <Trash2 size={12} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-4 py-4 text-xs text-text-muted">Sin columnas almacenadas</p>
      )}

      <footer className="border-t border-border p-2">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          onClick={() => {
            addLogicalColumn(table.id);
          }}
        >
          <Plus size={13} aria-hidden="true" />
          Añadir columna
        </button>
      </footer>
    </article>
  );
}
