'use client';

import { useRef, useState } from 'react';

interface LogicalTableNameInputProps {
  tableId: string;
  name: string;
  onRename: (tableId: string, name: string) => void;
}

export function LogicalTableNameInput({ tableId, name, onRename }: LogicalTableNameInputProps) {
  const [value, setValue] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const cancelRef = useRef(false);

  function startEditing() {
    cancelRef.current = false;
    setValue(name);
    setIsEditing(true);
  }

  function commitName() {
    if (cancelRef.current) {
      cancelRef.current = false;
      setIsEditing(false);
      return;
    }

    const nextName = value.trim();

    if (nextName && nextName !== name) {
      onRename(tableId, nextName);
    }

    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        value={value}
        maxLength={80}
        aria-label="Nombre de la tabla"
        className="min-w-0 flex-1 rounded-md bg-background px-2 py-1 text-sm font-semibold text-text outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        onFocus={(event) => {
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setValue(event.target.value);
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
            setValue(name);
            event.currentTarget.blur();
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Cambiar nombre de la tabla ${name}`}
      title="Cambiar nombre de la tabla"
      onClick={startEditing}
      className="min-w-0 flex-1 rounded-md px-1 py-1 text-left text-sm font-semibold text-text transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
    >
      <span className="block whitespace-normal wrap-anywhere">{name}</span>
    </button>
  );
}
