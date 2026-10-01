'use client';

import { Database, Plus, RefreshCw } from 'lucide-react';

interface LogicalCanvasEmptyStateProps {
  canGenerateFromEr: boolean;
  onCreateTable: () => void;
  onGenerateFromEr: () => void;
}

export function LogicalCanvasEmptyState({
  canGenerateFromEr,
  onCreateTable,
  onGenerateFromEr,
}: LogicalCanvasEmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
          <Database size={23} className="text-brand-primary" aria-hidden="true" />
        </span>

        <h2 className="text-base font-semibold text-text">Construye tu modelo lógico</h2>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          Crea las tablas manualmente o transforma tu modelo entidad-relación.
        </p>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateTable}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
          >
            <Plus size={15} aria-hidden="true" />
            Crear tabla
          </button>

          <button
            type="button"
            disabled={!canGenerateFromEr}
            onClick={onGenerateFromEr}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Generar desde ER
          </button>
        </div>
      </div>
    </div>
  );
}
