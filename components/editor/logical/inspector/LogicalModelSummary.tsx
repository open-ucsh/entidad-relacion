'use client';

import { Plus, Table2 } from 'lucide-react';

import type { LogicalTable } from '@/domain/logical/models';

interface LogicalModelSummaryProps {
  tables: LogicalTable[];
  onSelectTable: (tableId: string) => void;
  onCreateTable: () => void;
}

export function LogicalModelSummary({
  tables,
  onSelectTable,
  onCreateTable,
}: LogicalModelSummaryProps) {
  return (
    <div className="min-h-0 overflow-y-auto p-4">
      <div className="flex items-center gap-2.5">
        <Table2 size={17} className="shrink-0 text-brand-primary" aria-hidden="true" />

        <h2 className="text-sm font-semibold text-text">Modelo lógico</h2>
      </div>

      <button
        type="button"
        onClick={() => {
          onCreateTable();
        }}
        className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-brand-primary/30 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      >
        <Plus size={15} aria-hidden="true" />
        Nueva tabla
      </button>

      <section aria-label="Tablas del modelo lógico" className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Tablas
          </h3>

          <span className="text-xs tabular-nums text-text-muted">{tables.length}</span>
        </div>

        {tables.length === 0 ? (
          <p className="mt-3 text-xs text-text-muted">Sin tablas</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {tables.map((table) => (
              <li key={table.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTable(table.id);
                  }}
                  className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                >
                  <Table2 size={14} className="shrink-0 text-brand-primary" aria-hidden="true" />

                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">
                    {table.name}
                  </span>

                  <span
                    title={`${table.columns.length} columnas`}
                    className="shrink-0 text-[10px] tabular-nums text-text-muted"
                  >
                    {table.columns.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
