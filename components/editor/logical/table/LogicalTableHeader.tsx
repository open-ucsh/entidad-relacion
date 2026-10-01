'use client';

import { GripHorizontal, Trash2 } from 'lucide-react';
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
    <header className="flex items-center gap-2 border-b border-border bg-brand-primary/5 px-2 py-2">
      <button
        type="button"
        aria-label={`Mover tabla ${tableName}`}
        className="flex size-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-text-muted transition-colors hover:bg-background hover:text-text active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <GripHorizontal size={15} aria-hidden="true" />
      </button>

      <LogicalTableNameInput tableId={tableId} name={tableName} onRename={onRename} />

      <button
        type="button"
        aria-label={`Eliminar tabla ${tableName}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-600"
        onClick={() => {
          onRemove(tableId);
        }}
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </header>
  );
}
