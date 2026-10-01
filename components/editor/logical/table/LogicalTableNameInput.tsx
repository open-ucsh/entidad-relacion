'use client';

import { useState } from 'react';

interface LogicalTableNameInputProps {
  tableId: string;
  name: string;
  onRename: (tableId: string, name: string) => void;
}

export function LogicalTableNameInput({ tableId, name, onRename }: LogicalTableNameInputProps) {
  const [value, setValue] = useState(name);

  function commitName() {
    const nextName = value.trim();

    if (!nextName) {
      setValue(name);
      return;
    }

    if (nextName === name) {
      return;
    }

    onRename(tableId, nextName);
  }

  return (
    <input
      value={value}
      aria-label="Nombre de la tabla"
      className="min-w-0 flex-1 bg-transparent text-sm font-bold uppercase tracking-wide text-text outline-none"
      onChange={(event) => {
        setValue(event.target.value);
      }}
      onBlur={commitName}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }

        if (event.key === 'Escape') {
          setValue(name);
          event.currentTarget.blur();
        }
      }}
    />
  );
}
