'use client';

import { MoreHorizontal, Table2, Trash2 } from 'lucide-react';
import type { PointerEventHandler } from 'react';

import { LogicalTableNameInput } from './LogicalTableNameInput';

interface LogicalTableHeaderProps {
  tableId: string;
  tableName: string;
  onRename: (tableId: string, name: string) => void;
  onRemove: (tableId: string) => void;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onPointerMove: PointerEventHandler<HTMLButtonElement>;
  onPointerEnd: PointerEventHandler<HTMLButtonElement>;
}

export function LogicalTableHeader({
  tableId,
  tableName,
  onRename,
  onRemove,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
}: LogicalTableHeaderProps) {
  return (
    <header className="relative flex min-h-12 items-center gap-2 border-b border-border bg-surface/80 px-3 py-2">
      <button
        type="button"
        aria-label={`Mover tabla ${tableName}`}
        title="Arrastrar para mover la tabla"
        className="flex size-7 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-brand-primary transition-colors hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <Table2 size={17} aria-hidden="true" />
      </button>

      <LogicalTableNameInput tableId={tableId} name={tableName} onRename={onRename} />

      <details className="relative shrink-0">
        <summary
          aria-label={`Acciones de la tabla ${tableName}`}
          title="Acciones de la tabla"
          className="flex size-7 cursor-pointer list-none items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 [&::-webkit-details-marker]:hidden"
        >
          <MoreHorizontal size={17} aria-hidden="true" />
        </summary>

        <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-border bg-background p-1 shadow-lg">
          <button
            type="button"
            className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
            onClick={() => {
              onRemove(tableId);
            }}
          >
            <Trash2 size={13} aria-hidden="true" />
            Eliminar tabla
          </button>
        </div>
      </details>
    </header>
  );
}
