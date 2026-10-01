'use client';

import { KeyRound, Link, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';

interface LogicalColumnRowProps {
  column: LogicalColumn;
  table: LogicalTable;
  isForeignKey: boolean;
  onUpdate: (tableId: string, columnId: string, updates: Partial<LogicalColumn>) => void;
  onRemove: (tableId: string, columnId: string) => void;
}

export function LogicalColumnRow({
  column,
  table,
  isForeignKey,
  onUpdate,
  onRemove,
}: LogicalColumnRowProps) {
  const [name, setName] = useState(column.name);

  function commitName() {
    const nextName = name.trim();

    if (!nextName) {
      setName(column.name);
      return;
    }

    if (nextName === column.name) {
      return;
    }

    onUpdate(table.id, column.id, {
      name: nextName,
    });
  }

  return (
    <div
      data-logical-column-id={column.id}
      className="group flex min-h-10 items-center gap-2 px-3 py-2"
    >
      <span className="flex w-8 shrink-0 items-center gap-1">
        {column.primaryKey && (
          <KeyRound size={12} className="text-amber-600" aria-label="Clave primaria" />
        )}

        {isForeignKey && (
          <Link size={12} className="text-brand-primary" aria-label="Clave foránea" />
        )}
      </span>

      <input
        value={name}
        aria-label={`Nombre de la columna ${column.name}`}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text outline-none"
        onChange={(event) => {
          setName(event.target.value);
        }}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            setName(column.name);
            event.currentTarget.blur();
          }
        }}
      />

      <label
        className="cursor-pointer text-[10px] font-semibold text-text-muted"
        title="Clave primaria"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={column.primaryKey}
          onChange={(event) => {
            onUpdate(table.id, column.id, {
              primaryKey: event.target.checked,
              nullable: event.target.checked ? false : column.nullable,
            });
          }}
        />

        <span className={column.primaryKey ? 'text-amber-600' : 'opacity-40 hover:opacity-100'}>
          PK
        </span>
      </label>

      <label
        className="cursor-pointer text-[10px] font-semibold text-text-muted"
        title="Valor único"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={column.unique}
          onChange={(event) => {
            onUpdate(table.id, column.id, {
              unique: event.target.checked,
            });
          }}
        />

        <span className={column.unique ? 'text-brand-primary' : 'opacity-40 hover:opacity-100'}>
          UQ
        </span>
      </label>

      <label
        className="cursor-pointer text-[10px] font-semibold text-text-muted"
        title="Permitir NULL"
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={column.nullable}
          disabled={column.primaryKey}
          onChange={(event) => {
            onUpdate(table.id, column.id, {
              nullable: event.target.checked,
            });
          }}
        />

        <span className={column.nullable ? 'text-text' : 'opacity-40 hover:opacity-100'}>NULL</span>
      </label>

      <button
        type="button"
        aria-label={`Eliminar columna ${column.name}`}
        className="flex size-6 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
        onClick={() => {
          onRemove(table.id, column.id);
        }}
      >
        <Trash2 size={12} aria-hidden="true" />
      </button>
    </div>
  );
}
