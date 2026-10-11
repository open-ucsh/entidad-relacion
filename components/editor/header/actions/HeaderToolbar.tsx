'use client';

import { CircleHelp, FileUp, FolderOpen, History, Menu, X, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { getStoredDocuments, MAX_DOCUMENTS } from '@/state/diagram/document-library';
import { useDiagramStore } from '@/state/diagram/store';

import { useEditorFeedback } from '../../feedback/EditorFeedbackProvider';

interface HeaderToolbarProps {
  onImportJson: (file: File) => Promise<void>;
  onOpenHistory: () => void;
  onOpenDocuments: () => void;
  onOpenShortcuts: () => void;
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      <Icon size={18} aria-hidden="true" className="shrink-0 text-text-muted" />

      {label}
    </button>
  );
}

export function HeaderToolbar({
  onImportJson,
  onOpenHistory,
  onOpenDocuments,
  onOpenShortcuts,
}: HeaderToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelId = useId();

  const documents = useDiagramStore((state) => state.documents);
  const { showFeedback } = useEditorFeedback();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

    function handleOutsidePointer(event: globalThis.PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener('pointerdown', handleOutsidePointer);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointer);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  function handleAction(action: () => void) {
    setIsOpen(false);
    action();
  }

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
    } catch (error) {
      showFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No se pudo importar el archivo JSON.',
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? 'Cerrar menú del editor' : 'Abrir menú del editor'}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-brand-primary shadow-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        {isOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const [file] = Array.from(event.target.files ?? []);

          event.target.value = '';

          if (file) {
            void handleImport(file);
          }
        }}
      />

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-background p-2 shadow-lg"
        >
          <ActionButton
            icon={FolderOpen}
            label="Documentos"
            onClick={() => {
              handleAction(onOpenDocuments);
            }}
          />

          <ActionButton
            icon={FileUp}
            label="Importar proyecto JSON"
            onClick={() => {
              inputRef.current?.click();
              setIsOpen(false);
            }}
          />

          <div aria-hidden="true" className="my-2 border-t border-border" />

          <ActionButton
            icon={History}
            label="Historial del proyecto"
            onClick={() => {
              handleAction(onOpenHistory);
            }}
          />

          <ActionButton
            icon={CircleHelp}
            label="Atajos de teclado"
            onClick={() => {
              handleAction(onOpenShortcuts);
            }}
          />
        </div>
      )}
    </div>
  );
}
