'use client';

import {
  ChevronDown,
  FileDown,
  FileImage,
  FileJson,
  FileText,
  ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import type { ExportFormat } from '@/components/editor/canvas/hooks/useCanvasExport';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
}

interface ExportOption {
  format: ExportFormat;
  label: string;
  hint: string;
  icon: LucideIcon;
  recommended: boolean;
}

const FORMAT_OPTIONS: readonly ExportOption[] = [
  {
    format: 'png',
    label: 'PNG',
    hint: 'Alta calidad, ideal para web',
    icon: ImageIcon,
    recommended: true,
  },
  {
    format: 'jpeg',
    label: 'JPEG',
    hint: 'Imagen comprimida, menor peso',
    icon: FileImage,
    recommended: false,
  },
  {
    format: 'pdf',
    label: 'PDF',
    hint: 'Listo para imprimir o compartir',
    icon: FileText,
    recommended: false,
  },
];

export function ExportButton({ onExport, onExportJson }: ExportButtonProps) {
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
        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:border-white/30 hover:bg-white/20 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
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
          className="absolute right-0 top-full z-40 mt-3 w-64 origin-top-right overflow-hidden rounded-xl border border-border bg-background py-2 shadow-xl"
        >
          <div className="flex items-center gap-2 px-4 py-2">
            <FileDown size={14} className="text-text-muted" aria-hidden="true" />

            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Descargar imagen
            </p>
          </div>

          <div className="px-2">
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.format}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onExport(option.format);
                    setIsOpen(false);
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface text-text-muted transition-colors group-hover:bg-accent/20 group-hover:text-brand-primary">
                    <Icon size={16} aria-hidden="true" />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{option.label}</span>

                      {option.recommended && (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                          Recomendado
                        </span>
                      )}
                    </span>

                    <span className="truncate text-xs text-text-muted">{option.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mx-4 my-2 border-t border-border" />

          <div className="px-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExportJson();
                setIsOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface text-text-muted transition-colors group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                <FileJson size={16} aria-hidden="true" />
              </span>

              <span className="flex flex-col">
                <span className="text-sm font-medium text-text">Proyecto JSON</span>
                <span className="text-xs text-text-muted">Guarda todo para seguir editando</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
