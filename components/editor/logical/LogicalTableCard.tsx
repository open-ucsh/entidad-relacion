import { KeyRound, Link } from 'lucide-react';

import type { LogicalTable } from '@/domain/logical/models';

interface LogicalTableCardProps {
  table: LogicalTable;
}

export function LogicalTableCard({ table }: LogicalTableCardProps) {
  const foreignKeyColumnIds = new Set(
    table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds),
  );

  return (
    <article
      data-logical-table-id={table.id}
      className="relative z-20 overflow-hidden rounded-xl border border-border bg-background shadow-sm"
    >
      <header className="border-b border-border bg-brand-primary/5 px-4 py-3">
        <h3 className="truncate text-sm font-bold uppercase tracking-wide text-text">
          {table.name}
        </h3>
      </header>

      {table.columns.length > 0 ? (
        <div className="divide-y divide-border">
          {table.columns.map((column) => {
            const isForeignKey = foreignKeyColumnIds.has(column.id);

            return (
              <div
                key={column.id}
                data-logical-column-id={column.id}
                className="flex min-h-10 items-center gap-2 px-4 py-2 text-sm"
              >
                <span className="flex w-12 shrink-0 items-center gap-1">
                  {column.primaryKey && (
                    <KeyRound size={13} className="text-amber-600" aria-label="Clave primaria" />
                  )}

                  {isForeignKey && (
                    <Link size={13} className="text-brand-primary" aria-label="Clave foránea" />
                  )}
                </span>

                <span className="min-w-0 flex-1 truncate font-medium text-text">{column.name}</span>

                {column.unique && !column.primaryKey && (
                  <span className="text-[10px] font-semibold uppercase text-text-muted">UQ</span>
                )}

                {column.nullable && <span className="text-[10px] text-text-muted">NULL</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-4 py-5 text-sm text-text-muted">Sin columnas almacenadas</p>
      )}
    </article>
  );
}
