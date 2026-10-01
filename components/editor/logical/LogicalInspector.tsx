'use client';

import { KeyRound, Link2, Table2 } from 'lucide-react';

import { useDiagramStore } from '@/state/diagram/store';

export function LogicalInspector() {
  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const tables = workspace.model.tables;

  const columnCount = tables.reduce((total, table) => total + table.columns.length, 0);

  const relationCount = tables.reduce((total, table) => total + table.foreignKeys.length, 0);

  if (tables.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-background text-text-muted">
          <Table2 size={18} aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-text">Sin modelo lógico</p>

        <p className="mt-1 max-w-52 text-xs leading-relaxed text-text-muted">
          Genera el modelo desde el diagrama ER o crea uno manualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <section className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Table2 size={16} className="text-brand-primary" aria-hidden="true" />

          <h2 className="text-sm font-semibold text-text">Modelo lógico</h2>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          {workspace.origin === 'generated'
            ? 'Generado desde el modelo conceptual.'
            : 'Modelo creado manualmente.'}
        </p>
      </section>

      <section className="grid grid-cols-3 border-b border-border">
        <div className="flex flex-col items-center gap-1 border-r border-border px-2 py-3">
          <span className="text-base font-semibold text-text">{tables.length}</span>

          <span className="text-[10px] text-text-muted">Tablas</span>
        </div>

        <div className="flex flex-col items-center gap-1 border-r border-border px-2 py-3">
          <span className="text-base font-semibold text-text">{columnCount}</span>

          <span className="text-[10px] text-text-muted">Columnas</span>
        </div>

        <div className="flex flex-col items-center gap-1 px-2 py-3">
          <span className="text-base font-semibold text-text">{relationCount}</span>

          <span className="text-[10px] text-text-muted">Relaciones</span>
        </div>
      </section>

      <section className="p-3">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Tablas
        </p>

        <div className="space-y-1">
          {tables.map((table) => {
            const primaryKeyCount = table.columns.filter((column) => column.primaryKey).length;

            return (
              <div key={table.id} className="rounded-lg border border-border bg-background p-3">
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
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
