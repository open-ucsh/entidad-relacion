'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';

import { INSPECTOR_TYPE_CONFIG } from './inspector-config';

import type { Attribute, Entity, Relationship } from '@/domain/models';

type InspectorElement = Entity | Relationship | Attribute;

interface InspectorHeaderProps {
  element: InspectorElement;
  updateElement: (id: string, updates: Partial<InspectorElement>) => void;
}

export function InspectorHeader({ element, updateElement }: InspectorHeaderProps) {
  const config = INSPECTOR_TYPE_CONFIG[element.type];
  const Icon = config.icon;

  const [draftName, setDraftName] = useState(element.name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function commit() {
    const trimmed = draftName.trim();

    if (trimmed.length === 0) {
      setDraftName(element.name);
      return;
    }

    if (trimmed !== element.name) {
      updateElement(element.id, { name: trimmed });
    }
  }

  function handleClear() {
    setDraftName('');
    inputRef.current?.focus();
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex size - 10 shrink - 0 items - center justify - center rounded - lg ring - 1 ${config.bg} ${config.ring} `}
      >
        <Icon size={20} className={config.text} />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`text - xs font - semibold uppercase tracking - wider ${config.text} `}>
          {config.label}
        </p>

        <div className="relative mt-0.5 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={draftName}
            onChange={(event) => {
              setDraftName(event.target.value);
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }

              if (event.key === 'Escape') {
                setDraftName(element.name);
                event.currentTarget.blur();
              }
            }}
            className="w-full truncate rounded-md bg-transparent py-0.5 pr-6 text-base font-semibold text-text outline-none transition focus-visible:bg-background focus-visible:px-2 focus-visible:ring-2 focus-visible:ring-ring/40"
          />

          {draftName.length > 0 && (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleClear}
              className="absolute right-1 flex size-4 shrink-0 items-center justify-center rounded text-text-muted transition hover:text-text"
              aria-label="Borrar nombre"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
