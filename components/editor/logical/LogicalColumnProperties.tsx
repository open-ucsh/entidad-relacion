'use client';

import { ArrowLeft, ArrowUpRight, Columns2, Link2, Trash2 } from 'lucide-react';

import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { useLogicalSelectionStore } from './logical-selection';

interface LogicalColumnPropertiesProps {
  table: LogicalTable;
  column: LogicalColumn;
  tables: LogicalTable[];
}

export function LogicalColumnProperties({ table, column, tables }: LogicalColumnPropertiesProps) {
  const updateColumn = useDiagramStore((state) => state.updateLogicalColumn);
  const removeColumn = useDiagramStore((state) => state.removeLogicalColumn);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  const references = table.foreignKeys.flatMap((foreignKey) => {
    const index = foreignKey.columnIds.indexOf(column.id);

    if (index === -1) {
      return [];
    }

    const target = tables.find((candidate) => candidate.id === foreignKey.referencedTableId);
    const targetColumn = target?.columns.find(
      (candidate) => candidate.id === foreignKey.referencedColumnIds[index],
    );

    return [
      {
        foreignKey,
        label: `${target?.name ?? 'Tabla eliminada'}.${targetColumn?.name ?? '?'}`,
      },
    ];
  });

  return (
    <div className="h-full overflow-y-auto overscroll-contain p-4">
      <div className="mb-5 flex items-start gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <Columns2 size={18} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-text">Columna</h2>
          <button
            type="button"
            title="Ver propiedades de la tabla"
            onClick={() => {
              setSelection({ type: 'table', tableId: table.id });
            }}
            className="mt-1 flex max-w-full items-center gap-1 rounded text-xs text-text-muted hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={11} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{table.name}</span>
          </button>
        </div>

        <button
          type="button"
          aria-label={`Eliminar columna ${column.name}`}
          title="Eliminar columna"
          onClick={() => {
            removeColumn(table.id, column.id);
            setSelection({ type: 'table', tableId: table.id });
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-medium text-text-muted">Nombre</span>
        <input
          key={`${column.id}:${column.name}`}
          defaultValue={column.name}
          maxLength={80}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          onBlur={(event) => {
            const name = event.currentTarget.value.trim();

            if (!name) {
              event.currentTarget.value = column.name;
            } else if (name !== column.name) {
              updateColumn(table.id, column.id, { name });
            }
          }}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              event.currentTarget.value = column.name;
              event.currentTarget.blur();
            }
          }}
        />
      </label>

      <section aria-label="Tipo de clave" className="mt-5">
        <h3 className="mb-2 text-xs font-medium text-text-muted">Tipo de clave</h3>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
          {[
            { label: 'Normal', primaryKey: false },
            { label: 'Primaria', primaryKey: true },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={column.primaryKey === option.primaryKey}
              onClick={() => {
                updateColumn(table.id, column.id, {
                  primaryKey: option.primaryKey,
                });
              }}
              className={`min-h-9 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                column.primaryKey === option.primaryKey
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-muted hover:bg-surface-hover'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Propiedades de la columna" className="mt-5">
        <h3 className="mb-2 text-xs font-medium text-text-muted">Propiedades</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: 'Único',
              checked: column.unique,
              disabled: false,
              onChange: () => {
                updateColumn(table.id, column.id, { unique: !column.unique });
              },
            },
            {
              label: 'Opcional',
              checked: column.nullable,
              disabled: column.primaryKey,
              onChange: () => {
                updateColumn(table.id, column.id, { nullable: !column.nullable });
              },
            },
          ].map((option) => (
            <label
              key={option.label}
              title={option.disabled ? 'Una clave primaria no admite NULL' : option.label}
              className={`flex min-h-11 items-center justify-between gap-2 rounded-lg border border-border px-2.5 text-xs ${
                option.disabled ? 'cursor-not-allowed text-text-muted' : 'cursor-pointer text-text'
              }`}
            >
              {option.label}
              <input
                type="checkbox"
                role="switch"
                checked={option.checked}
                disabled={option.disabled}
                onChange={option.onChange}
                className="size-4 accent-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
            </label>
          ))}
        </div>
      </section>

      {references.length > 0 && (
        <section
          aria-label="Referencias de la columna"
          className="mt-5 space-y-1 border-t border-border pt-3"
        >
          {references.map(({ foreignKey, label }) => (
            <button
              key={foreignKey.id}
              type="button"
              onClick={() => {
                setSelection({
                  type: 'relation',
                  sourceTableId: table.id,
                  foreignKeyId: foreignKey.id,
                });
              }}
              className="flex min-h-10 w-full items-center gap-2 rounded-md px-1 text-left text-xs text-brand-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Link2 size={14} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 wrap-anywhere">Referencia a {label}</span>
              <ArrowUpRight size={13} className="shrink-0" aria-hidden="true" />
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
