'use client';

import { KeyRound, Link2, Plus, Table2 } from 'lucide-react';

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
    <div className="h-full overflow-y-auto">
      <section className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Table2 size={16} className="text-brand-primary" aria-hidden="true" />

          <h2 className="text-sm font-semibold text-text">Modelo lógico</h2>
        </div>

        <p className="mt-1 text-xs text-text-muted">
          {origin === 'generated'
            ? 'Generado desde el modelo conceptual.'
            : 'Modelo creado manualmente.'}
        </p>

        <p className="mt-2 text-xs text-text-muted">
          {tables.length} tablas · {columnCount} columnas · {relationCount} relaciones
        </p>
      </section>

      <section className="p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Tablas
          </p>

          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10"
            onClick={onCreateTable}
          >
            <Plus size={12} aria-hidden="true" />
            Nueva
          </button>
        </div>

        <div className="space-y-1.5">
          {tables.map((table) => {
            const primaryKeyCount = table.columns.filter((column) => column.primaryKey).length;

            return (
              <button
                key={table.id}
                type="button"
                className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-brand-primary/40 hover:bg-surface-hover"
                onClick={() => {
                  onSelectTable(table.id);
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Table2 size={14} className="shrink-0 text-brand-primary" aria-hidden="true" />

                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text">
                    {table.name}
                  </span>

                  <span className="shrink-0 text-[10px] text-text-muted">
                    {table.columns.length}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <KeyRound size={10} aria-hidden="true" />
                    {primaryKeyCount} PK
                  </span>

                  <span className="flex items-center gap-1">
                    <Link2 size={10} aria-hidden="true" />
                    {table.foreignKeys.length} FK
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
