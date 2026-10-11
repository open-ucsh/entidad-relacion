'use client';

import { ChevronDown, Plus, Table2 } from 'lucide-react';

import type { LogicalTable } from '@/domain/logical/models';

interface LogicalModelSummaryProps {
  tables: LogicalTable[];
  origin: 'generated' | 'manual';
  onSelectTable: (tableId: string) => void;
  onCreateTable: () => void;
}

export function LogicalModelSummary({
  tables,
  origin,
  onSelectTable,
  onCreateTable,
}: LogicalModelSummaryProps) {
  const columnCount = tables.reduce((total, table) => total + table.columns.length, 0);

  const relationCount = tables.reduce((total, table) => total + table.foreignKeys.length, 0);

  return (
    <div className="min-h-0 overflow-y-auto p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/5 text-brand-primary">
          <Table2 size={19} aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">Modelo lógico</h2>

          <p className="mt-1 text-xs leading-5 text-text-muted">
            {origin === 'generated' ? 'Generado desde el modelo ER.' : 'Creado manualmente.'}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-text-muted">
        {tables.length} tablas · {columnCount} columnas · {relationCount} relaciones
      </p>

      <div className="mt-4 rounded-lg bg-surface px-3 py-3">
        <p className="text-xs leading-5 text-text-muted">
          Selecciona una tabla del lienzo para editar sus columnas y relaciones.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateTable}
        className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-medium text-brand-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      >
        <Plus size={15} aria-hidden="true" />
        Nueva tabla
      </button>

      <details className="group mt-4 border-t border-border pt-3">
        <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-md text-xs font-semibold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 [&::-webkit-details-marker]:hidden">
          <span>Explorar tablas ({tables.length})</span>

          <ChevronDown
            size={14}
            aria-hidden="true"
            className="text-text-muted transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="mt-2 space-y-1">
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => {
                onSelectTable(table.id);
              }}
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <Table2 size={14} aria-hidden="true" className="shrink-0 text-brand-primary" />

              <span className="min-w-0 flex-1 text-xs font-medium text-text wrap-anywhere">
                {table.name}
              </span>

              <span
                title={`${table.columns.length} columnas`}
                className="shrink-0 text-[10px] text-text-muted"
              >
                {table.columns.length}
              </span>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
