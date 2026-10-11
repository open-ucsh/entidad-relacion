'use client';

import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ProjectNameEditorProps {
  name: string;
  onCommit: (name: string) => void;
}

export function ProjectNameEditor({ name, onCommit }: ProjectNameEditorProps) {
  const [draftName, setDraftName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editingRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    draftNameReset();
    editingRef.current = true;
    setIsEditing(true);
  }

  function draftNameReset() {
    setDraftName(name);
  }

  function cancelEditing() {
    editingRef.current = false;
    setIsEditing(false);
  }

  function saveEditing() {
    if (!editingRef.current) {
      return;
    }

    editingRef.current = false;

    const nextName = draftName.trim();

    if (nextName && nextName !== name) {
      onCommit(nextName);
    }

    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draftName}
        maxLength={80}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          setDraftName(event.target.value);
        }}
        onBlur={saveEditing}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === 'Enter') {
            event.preventDefault();
            saveEditing();
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            cancelEditing();
          }
        }}
        aria-label="Nombre del proyecto"
        className="block h-7 w-full max-w-sm rounded-md border border-brand-primary/30 bg-surface px-2 text-sm text-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Cambiar nombre del proyecto"
      aria-label={`Cambiar nombre del proyecto: ${name}`}
      className="group flex max-w-full items-center gap-2 rounded-md py-0.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      <span className="min-w-0 truncate text-sm leading-5 text-text-muted">{name}</span>

      <Pencil
        size={13}
        aria-hidden="true"
        className="shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </button>
  );
}
