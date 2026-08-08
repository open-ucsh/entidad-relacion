'use client';

import { FileText, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ProjectNameEditorProps {
  name: string;
  onCommit: (name: string) => void;
}

export function ProjectNameEditor({ name, onCommit }: ProjectNameEditorProps) {
  const [draftName, setDraftName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraftName(name);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function saveEditing() {
    const nextName = draftName.trim();

    if (nextName && nextName !== name) {
      onCommit(nextName);
    }

    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <FileText size={15} className="shrink-0 text-white/65" aria-hidden="true" />

        <input
          ref={inputRef}
          value={draftName}
          maxLength={80}
          onChange={(event) => {
            setDraftName(event.target.value);
          }}
          onBlur={saveEditing}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }

            if (event.key === 'Escape') {
              cancelEditing();
            }
          }}
          aria-label="Nombre del proyecto"
          className="w-52 rounded-md border border-white/25 bg-white/10 px-2 py-1 text-sm font-medium text-white outline-none placeholder:text-white/50 focus:border-white/60 focus:ring-2 focus:ring-white/20"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Cambiar nombre del proyecto"
      className="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <FileText size={15} className="shrink-0 text-white/65" aria-hidden="true" />

      <span className="max-w-52 truncate text-sm font-medium text-white">{name}</span>

      <Pencil
        size={13}
        className="shrink-0 text-white/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
}
