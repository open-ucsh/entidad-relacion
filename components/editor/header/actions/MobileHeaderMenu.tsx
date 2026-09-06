'use client';

import {
  CircleHelp,
  FileImage,
  FileJson,
  FileText,
  FileUp,
  FolderOpen,
  History,
  ImageIcon,
  MoreVertical,
  Redo2,
  Undo2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ExportFormat } from '@/components/editor/canvas/hooks/useCanvasExport';
import { useEditorFeedback } from '@/components/editor/feedback/EditorFeedbackProvider';
import { getStoredDocuments, MAX_DOCUMENTS } from '@/state/diagram/document-library';
import { useDiagramStore } from '@/state/diagram/store';

interface MobileHeaderMenuProps {
  canRedo: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onImportJson: (file: File) => Promise<void>;
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
  onOpenHistory: () => void;
  onOpenDocuments: () => void;
  onOpenShortcuts: () => void;
}

export function MobileHeaderMenu({
  canRedo,
  canUndo,
  onUndo,
  onRedo,
  onImportJson,
  onExport,
  onExportJson,
  onOpenHistory,
  onOpenDocuments,
  onOpenShortcuts,
}: MobileHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [showExport, setShowExport] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const documents = useDiagramStore((state) => state.documents);

  const { showFeedback } = useEditorFeedback();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsidePointer(event: globalThis.PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setShowExport(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowExport(false);
      }
    }

    window.addEventListener('pointerdown', closeOnOutsidePointer);

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('pointerdown', closeOnOutsidePointer);

      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  async function handleImport(file: File) {
    const storedDocuments = getStoredDocuments(documents);

    if (storedDocuments.length >= MAX_DOCUMENTS) {
      showFeedback({
        tone: 'info',
        message: `Llegaste al límite de ${MAX_DOCUMENTS} documentos locales. Elimina uno para importar otro.`,
      });

      return;
    }

    try {
      await onImportJson(file);

      showFeedback({
        tone: 'success',
        message: 'Proyecto importado correctamente.',
      });

      setIsOpen(false);
    } catch (error) {
      showFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No se pudo importar el archivo JSON.',
      });
    }
  }

  function closeMenu() {
    setIsOpen(false);
    setShowExport(false);
  }

  function handleExport(format: ExportFormat) {
    onExport(format);
    closeMenu();
  }

  return (
    <div ref={containerRef} className="relative lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current);

          setShowExport(false);
        }}
        className="flex size-10 items-center justify-center rounded-lg text-white transition-colors active:bg-white/15"
      >
        {isOpen ? <X size={21} /> : <MoreVertical size={21} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(19rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          <div className="flex items-center gap-2 border-b border-border p-2">
            <button
              type="button"
              aria-label="Deshacer"
              disabled={!canUndo}
              onClick={onUndo}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm text-text hover:bg-surface-hover disabled:opacity-40"
            >
              <Undo2 size={18} />
              Deshacer
            </button>

            <button
              type="button"
              aria-label="Rehacer"
              disabled={!canRedo}
              onClick={onRedo}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm text-text hover:bg-surface-hover disabled:opacity-40"
            >
              <Redo2 size={18} />
              Rehacer
            </button>
          </div>

          <div className="p-2">
            <MenuButton
              icon={FolderOpen}
              label="Documentos"
              onClick={() => {
                closeMenu();
                onOpenDocuments();
              }}
            />

            <MenuButton
              icon={FileUp}
              label="Importar proyecto"
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

            <button
              type="button"
              onClick={() => {
                setShowExport((current) => !current);
              }}
              className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-text hover:bg-surface-hover"
            >
              <FileImage size={18} className="text-text-muted" />
              Exportar
              <span className="ml-auto text-xs text-text-muted">{showExport ? '−' : '+'}</span>
            </button>

            {showExport && (
              <div className="mb-2 ml-4 border-l border-border pl-2">
                <MenuButton
                  icon={ImageIcon}
                  label="Imagen PNG"
                  compact
                  onClick={() => {
                    handleExport('png');
                  }}
                />

                <MenuButton
                  icon={FileImage}
                  label="Imagen JPEG"
                  compact
                  onClick={() => {
                    handleExport('jpeg');
                  }}
                />

                <MenuButton
                  icon={FileText}
                  label="Documento PDF"
                  compact
                  onClick={() => {
                    handleExport('pdf');
                  }}
                />

                <MenuButton
                  icon={FileJson}
                  label="Proyecto JSON"
                  compact
                  onClick={() => {
                    onExportJson();
                    closeMenu();
                  }}
                />
              </div>
            )}

            <div className="my-2 border-t border-border" />

            <MenuButton
              icon={History}
              label="Historial"
              onClick={() => {
                closeMenu();
                onOpenHistory();
              }}
            />

            <MenuButton
              icon={CircleHelp}
              label="Atajos de teclado"
              onClick={() => {
                closeMenu();
                onOpenShortcuts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuButtonProps {
  icon: typeof FolderOpen;
  label: string;
  onClick: () => void;
  compact?: boolean;
}

function MenuButton({ icon: Icon, label, onClick, compact = false }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 text-left font-medium text-text hover:bg-surface-hover ${
        compact ? 'h-10 text-xs' : 'h-11 text-sm'
      }`}
    >
      <Icon size={compact ? 16 : 18} className="shrink-0 text-text-muted" />

      {label}
    </button>
  );
}
