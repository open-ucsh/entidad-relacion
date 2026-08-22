'use client';

import { useEffect, useRef } from 'react';

import { ELEMENT_GEOMETRY } from './elements/element-shape-dimensions';
import type { DiagramElement } from '@/domain/diagram/models';

interface InlineElementNameEditorProps {
  element: DiagramElement;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

interface EditableBounds {
  width: number;
  height: number;
}

const EDITOR_PADDING = {
  entity: {
    horizontal: 16,
    vertical: 12,
  },
  relationship: {
    horizontal: 28,
    vertical: 20,
  },
  attribute: {
    horizontal: 14,
    height: 26,
  },
} as const;

function getEditableBounds(element: DiagramElement): EditableBounds {
  switch (element.type) {
    case 'entity':
      return {
        width: ELEMENT_GEOMETRY.entity.width - EDITOR_PADDING.entity.horizontal,
        height: ELEMENT_GEOMETRY.entity.height - EDITOR_PADDING.entity.vertical,
      };

    case 'relationship':
      return {
        width: ELEMENT_GEOMETRY.relationship.width - EDITOR_PADDING.relationship.horizontal,
        height: ELEMENT_GEOMETRY.relationship.height - EDITOR_PADDING.relationship.vertical,
      };

    case 'attribute':
      return {
        width: ELEMENT_GEOMETRY.attribute.radiusX * 2 - EDITOR_PADDING.attribute.horizontal,
        height: EDITOR_PADDING.attribute.height,
      };

    case 'isa':
      return {
        width: ELEMENT_GEOMETRY.isa.width - 12,
        height: ELEMENT_GEOMETRY.isa.height - 14,
      };
  }
}

export function InlineElementNameEditor({
  element,
  value,
  onChange,
  onCommit,
  onCancel,
}: InlineElementNameEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { width, height } = getEditableBounds(element);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <foreignObject
      x={element.position.x - width / 2}
      y={element.position.y - height / 2}
      width={width}
      height={height}
      data-export-exclude
    >
      <div className="flex h-full w-full items-center justify-center">
        <input
          ref={inputRef}
          value={value}
          maxLength={40}
          aria-label="Nombre del elemento"
          spellCheck={false}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
              event.preventDefault();
              onCommit();
              return;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              onCancel();
            }
          }}
          onBlur={onCommit}
          className="h-full w-full border-0 bg-transparent text-center text-xs font-semibold text-text outline-none selection:bg-brand-primary selection:text-white"
        />
      </div>
    </foreignObject>
  );
}
