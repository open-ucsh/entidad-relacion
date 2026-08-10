'use client';

import { X } from 'lucide-react';
import { useRef, useState } from 'react';

import type { DiagramElement } from '@/domain/diagram/models';

import { INSPECTOR_TYPE_CONFIG } from './inspector-config';

interface InspectorHeaderProps {
  element: DiagramElement;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
}

export function InspectorHeader({ element, updateElement }: InspectorHeaderProps) {
  const config = INSPECTOR_TYPE_CONFIG[element.type];
  const Icon = config.icon;

  const [draftName, setDraftName] = useState(element.name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function commitName() {
    const name = draftName.trim();

    if (!name) {
      setDraftName(element.name);
      return;
    }

    if (name !== element.name) {
      updateElement(element.id, { name });
    }
  }

  function clearName() {
    setDraftName('');
    inputRef.current?.focus();
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${config.bg} ${config.ring}`}
      >
        <Icon size={19} className={config.text} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}>
          {config.label}
        </p>

        <div className="relative mt-0.5 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={draftName}
            maxLength={80}
            onChange={(event) => {
              setDraftName(event.target.value);
            }}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }

              if (event.key === 'Escape') {
                setDraftName(element.name);
                event.currentTarget.blur();
              }
            }}
            className="w-full truncate rounded-md bg-transparent py-0.5 pr-6 text-base font-semibold text-text outline-none transition focus-visible:bg-background focus-visible:px-2 focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          />

          {draftName && (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={clearName}
              className="absolute right-1 flex size-4 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:text-text"
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
