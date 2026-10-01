'use client';

import { ChevronDown, Link2, Plus } from 'lucide-react';

interface LogicalTableActionsProps {
  showRelations: boolean;
  onAddColumn: () => void;
  onToggleRelations: () => void;
}

export function LogicalTableActions({
  showRelations,
  onAddColumn,
  onToggleRelations,
}: LogicalTableActionsProps) {
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
        aria-expanded={showRelations}
        className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        onClick={onToggleRelations}
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
  );
}
