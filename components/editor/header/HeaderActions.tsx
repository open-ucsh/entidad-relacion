'use client';

import {
  ChevronDown,
  FileDown,
  FilePlus,
  FileUp,
  History,
  ImageDown,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import type { ExportFormat } from '@/components/editor/canvas/hooks/useCanvasExport';

const FORMAT_OPTIONS: ReadonlyArray<{
  format: ExportFormat;
  label: string;
  hint: string;
}> = [
  { format: 'png', label: 'PNG', hint: 'Fondo transparente, ideal para diagramas' },
  { format: 'jpeg', label: 'JPEG', hint: 'Imagen comprimida, menor peso' },
  { format: 'pdf', label: 'PDF', hint: 'Listo para imprimir o compartir' },
];

interface HeaderActionsProps {
  onNewDiagram: () => void;
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<void>;
  onOpenHistory: () => void;
  onOpenDocuments: () => void;
}

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
}

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (() => void) | undefined;
  disabled?: boolean;
}

/** Icon-only action with an accessible hover/focus tooltip — no label clutter. */
function ToolbarButton({ icon: Icon, label, onClick, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group relative flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <Icon size={18} aria-hidden="true" />

      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-lg transition-opacity delay-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}

function ToolbarDivider() {
  return <div aria-hidden="true" className="mx-1.5 h-6 w-px bg-white/15" />;
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
        className="flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-xs font-semibold text-brand-primary shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
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
          className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-background py-1.5 shadow-xl"
        >
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Descargar imagen
          </p>

          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              onClick={() => {
                onExport(option.format);
                setIsOpen(false);
              }}
              className="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="text-xs font-medium text-text">{option.label}</span>
              <span className="text-[11px] text-text-muted">{option.hint}</span>
            </button>
          ))}

          <div className="my-1.5 border-t border-border" />

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
  onOpenHistory,
  onOpenDocuments,
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
    <div className="flex items-center gap-1">
      <ToolbarButton icon={History} label="Historial del proyecto" onClick={onOpenHistory} />
      <ToolbarButton icon={FilePlus} label="Nuevo diagrama" onClick={onNewDiagram} />
      <ToolbarButton
        icon={FileUp}
        label="Importar proyecto JSON"
        onClick={() => {
          inputRef.current?.click();
        }}
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
      <ToolbarButton icon={FolderOpen} label="Mis documentos" onClick={onOpenDocuments} />

      <ToolbarDivider />

      <ExportMenu onExport={onExport} onExportJson={onExportJson} />
    </div>
  );
}
