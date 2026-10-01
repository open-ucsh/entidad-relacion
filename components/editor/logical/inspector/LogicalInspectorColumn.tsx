'use client';

import { KeyRound, Link2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { LogicalColumn } from '@/domain/logical/models';

interface LogicalInspectorColumnProps {
  column: LogicalColumn;
  isForeignKey: boolean;
  onUpdate: (updates: Partial<LogicalColumn>) => void;
  onRemove: () => void;
}

export function LogicalInspectorColumn({
  column,
  isForeignKey,
  onUpdate,
  onRemove,
}: LogicalInspectorColumnProps) {
  const [name, setName] = useState(column.name);

  function commitName() {
    const nextName = name.trim();

    if (!nextName) {
      setName(column.name);
      return;
    }

    if (nextName !== column.name) {
      onUpdate({ name: nextName });
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center text-text-muted">
          {column.primaryKey ? (
            <KeyRound size={13} className="text-amber-600" aria-label="Clave primaria" />
          ) : isForeignKey ? (
            <Link2 size={13} className="text-brand-primary" aria-label="Clave foránea" />
          ) : null}
        </span>

        <input
          value={name}
          aria-label={`Nombre de columna ${column.name}`}
          className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-text outline-none"
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

        <button
          type="button"
          aria-label={`Eliminar columna ${column.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-600"
          onClick={onRemove}
        >
          <Trash2 size={12} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          aria-pressed={column.primaryKey}
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
            column.primaryKey
              ? 'bg-amber-500/10 text-amber-700'
              : 'bg-surface text-text-muted hover:text-text'
          }`}
          onClick={() => {
            onUpdate({
              primaryKey: !column.primaryKey,
              nullable: !column.primaryKey ? false : column.nullable,
            });
          }}
        >
          PK
        </button>

        <button
          type="button"
          aria-pressed={column.unique}
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
            column.unique
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'bg-surface text-text-muted hover:text-text'
          }`}
          onClick={() => {
            onUpdate({
              unique: !column.unique,
            });
          }}
        >
          Única
        </button>

        <button
          type="button"
          aria-pressed={column.nullable}
          disabled={column.primaryKey}
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
            column.nullable
              ? 'bg-surface-hover text-text'
              : 'bg-surface text-text-muted hover:text-text'
          }`}
          onClick={() => {
            onUpdate({
              nullable: !column.nullable,
            });
          }}
        >
          NULL
        </button>

        {isForeignKey && (
          <span className="ml-auto rounded-md bg-brand-primary/10 px-2 py-1 text-[10px] font-semibold text-brand-primary">
            FK
          </span>
        )}
      </div>
    </div>
  );
}
