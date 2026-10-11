'use client';

import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

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
  const cancelRef = useRef(false);

  function commitName() {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }

    const nextName = name.trim();

    if (!nextName) {
      setName(column.name);
      return;
    }

    if (nextName !== column.name) {
      onUpdate({ name: nextName });
    }
  }

  function renderSwitch(label: string, checked: boolean, onChange: () => void, disabled = false) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md text-left text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>{label}</span>

        <span
          aria-hidden="true"
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            checked ? 'bg-brand-primary' : 'bg-border'
          }`}
        >
          <span
            className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>
    );
  }

  return (
    <section className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-text">Campo seleccionado</span>

        <input
          value={name}
          maxLength={80}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          onChange={(event) => {
            setName(event.target.value);
          }}
          onBlur={commitName}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              cancelRef.current = true;
              setName(column.name);
              event.currentTarget.blur();
            }
          }}
        />
      </label>

      <div>
        {renderSwitch('Clave primaria (PK)', column.primaryKey, () => {
          const primaryKey = !column.primaryKey;

          onUpdate({
            primaryKey,
            nullable: primaryKey ? false : column.nullable,
          });
        })}

        {renderSwitch('Único (UQ)', column.unique, () => {
          onUpdate({ unique: !column.unique });
        })}

        {renderSwitch(
          'Permitir NULL',
          column.nullable,
          () => {
            onUpdate({ nullable: !column.nullable });
          },
          column.primaryKey,
        )}
      </div>

      {isForeignKey && (
        <p className="text-xs leading-5 text-text-muted">
          Este campo participa en una clave foránea.
        </p>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="flex min-h-9 items-center gap-2 rounded-md px-2 text-xs text-red-600 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
      >
        <Trash2 size={13} aria-hidden="true" />
        Eliminar columna
      </button>
    </section>
  );
}
