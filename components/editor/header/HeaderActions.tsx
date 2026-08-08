'use client';

import { ChevronDown, FileDown, FilePlus, FileUp, ImageDown, type LucideIcon } from 'lucide-react';
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
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<void>;
}

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (() => void) | undefined;
  title?: string | undefined;
}

function ActionButton({ icon: Icon, label, onClick, title }: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} title={title} className={ACTION_BUTTON_CLASS_NAME}>
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}

function ExportMenu({ onExport, onExportJson }: ExportMenuProps) {
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
        <ImageDown size={16} aria-hidden="true" />
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
          className="absolute right-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-md border border-border bg-background py-1 shadow-lg"
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
              Exportar como {option.label}
            </button>
          ))}

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onExportJson();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-text transition-colors hover:bg-surface-hover"
          >
            <FileDown size={14} aria-hidden="true" />
            Proyecto JSON
          </button>
        </div>
      )}
    </div>
  );
}

export function HeaderActions({
  onNewDiagram,
  onExport,
  onExportJson,
  onImportJson,
}: HeaderActionsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleImport(file: File) {
    try {
      await onImportJson(file);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo importar el archivo JSON.';

      window.alert(message);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        icon={FilePlus}
        label="Nuevo"
        onClick={onNewDiagram}
        title="Crear un nuevo diagrama"
      />

      <ActionButton
        icon={FileUp}
        label="Importar"
        onClick={() => {
          inputRef.current?.click();
        }}
        title="Importar proyecto JSON"
      />

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const [file] = Array.from(event.target.files ?? []);

          if (file) {
            void handleImport(file);
          }

          event.target.value = '';
        }}
      />

      <ExportMenu onExport={onExport} onExportJson={onExportJson} />
    </div>
  );
}
