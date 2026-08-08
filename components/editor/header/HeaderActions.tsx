'use client';

import { ChevronDown, FilePlus, ImageDown, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import type { ExportFormat } from '@/components/editor/canvas/hooks/useCanvasExport';

const FORMAT_OPTIONS: ReadonlyArray<{
  format: ExportFormat;
  label: string;
}> = [
  { format: 'png', label: 'PNG' },
  { format: 'jpeg', label: 'JPEG' },
  { format: 'pdf', label: 'PDF' },
];

const ACTION_BUTTON_CLASS_NAME =
  'flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

interface HeaderActionsProps {
  onNewDiagram: () => void;
  onExport: (format: ExportFormat) => void;
}

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (() => void) | undefined;
  disabled?: boolean | undefined;
  title?: string | undefined;
}

function ActionButton({ icon: Icon, label, onClick, disabled = false, title }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={ACTION_BUTTON_CLASS_NAME}
    >
      <Icon size={17} aria-hidden="true" />
      {label}
    </button>
  );
}

function ExportMenu({ onExport }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsidePointer(event: globalThis.PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('pointerdown', closeOnOutsidePointer);
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('pointerdown', closeOnOutsidePointer);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={ACTION_BUTTON_CLASS_NAME}
      >
        <ImageDown size={17} aria-hidden="true" />
        Exportar
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Formatos de exportación"
          className="absolute right-0 top-full z-40 mt-1 w-32 overflow-hidden rounded-md border border-border bg-background py-1 shadow-lg"
        >
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              onClick={() => {
                onExport(option.format);
                setIsOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-text transition-colors hover:bg-surface-hover"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HeaderActions({ onNewDiagram, onExport }: HeaderActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ActionButton
        icon={FilePlus}
        label="Nuevo"
        onClick={onNewDiagram}
        title="Crear un diagrama nuevo"
      />

      <ExportMenu onExport={onExport} />
    </div>
  );
}
