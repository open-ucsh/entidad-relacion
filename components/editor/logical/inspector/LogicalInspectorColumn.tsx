'use client';

import { Link2, Trash2 } from 'lucide-react';
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

    setName(nextName);

    if (nextName !== column.name) {
      onUpdate({ name: nextName });
    }
  }

  const options = [
    {
      label: 'Clave primaria',
      abbreviation: 'PK',
      checked: column.primaryKey,
      disabled: false,
      onChange: () => {
        onUpdate({ primaryKey: !column.primaryKey });
      },
    },
    {
      label: 'Valor único',
      abbreviation: 'UQ',
      checked: column.unique,
      disabled: false,
      onChange: () => {
        onUpdate({ unique: !column.unique });
      },
    },
    {
      label: 'Permitir NULL',
      abbreviation: '',
      checked: column.nullable,
      disabled: column.primaryKey,
      onChange: () => {
        onUpdate({ nullable: !column.nullable });
      },
    },
  ];

  return (
    <section aria-label={`Propiedades de ${column.name}`}>
      <label className="block">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Nombre de columna
        </span>
        <input
          value={name}
          maxLength={80}
          className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          onChange={(event) => {
            setName(event.target.value);
          }}
          onBlur={commitName}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              cancelRef.current = true;
              setName(column.name);
              event.currentTarget.blur();
            }
          }}
        />
      </label>

      <div className="mt-2">
        {options.map((option) => (
          <label
            key={option.label}
            className={`flex min-h-9 items-center gap-2.5 rounded-md px-1 text-xs ${
              option.disabled ? 'cursor-not-allowed text-text-muted' : 'cursor-pointer text-text'
            }`}
          >
            <input
              type="checkbox"
              checked={option.checked}
              disabled={option.disabled}
              onChange={option.onChange}
              className="size-4 shrink-0 accent-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            />
            <span className="flex-1">{option.label}</span>
            <span aria-hidden="true" className="text-[9px] text-text-muted">
              {option.abbreviation}
            </span>
          </label>
        ))}
      </div>

      {isForeignKey && (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-text-muted">
          <Link2 size={12} aria-hidden="true" />
          Parte de una clave foránea
        </p>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="mt-2 flex min-h-9 items-center gap-2 rounded-md px-1 text-xs text-red-600 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <Trash2 size={13} aria-hidden="true" />
        Eliminar columna
      </button>
    </section>
  );
}
