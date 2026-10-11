'use client';

import { useId, useRef, useState } from 'react';

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
  const cancelCommitRef = useRef(false);
  const inputId = useId();

  function commitName() {
    if (cancelCommitRef.current) {
      cancelCommitRef.current = false;
      return;
    }

    const name = draftName.trim();

    if (!name) {
      setDraftName(element.name);
      return;
    }

    setDraftName(name);

    if (name !== element.name) {
      updateElement(element.id, { name });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
        </span>

        <p className="text-sm font-semibold text-brand-primary">{config.label}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-xs font-medium text-text-muted">
          Nombre
        </label>

        <input
          id={inputId}
          type="text"
          value={draftName}
          maxLength={80}
          autoComplete="off"
          onFocus={() => {
            cancelCommitRef.current = false;
          }}
          onChange={(event) => {
            setDraftName(event.target.value);
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
              cancelCommitRef.current = true;
              setDraftName(element.name);
              event.currentTarget.blur();
            }
          }}
          className="h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-base text-text outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
        />
      </div>
    </div>
  );
}
