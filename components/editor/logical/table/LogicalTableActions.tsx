'use client';

import { Link2, Plus } from 'lucide-react';

interface LogicalTableActionsProps {
  onAddColumn: () => void;
  onEditRelations: () => void;
}

export function LogicalTableActions({ onAddColumn, onEditRelations }: LogicalTableActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-1">
      <button
        type="button"
        className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        onClick={onAddColumn}
      >
        <Plus size={13} aria-hidden="true" />
        Columna
      </button>

      <button
        type="button"
        className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        onClick={onEditRelations}
      >
        <Link2 size={13} aria-hidden="true" />
        Relación
      </button>
    </div>
  );
}
