'use client';

import { CircleHelp, FileUp, FolderOpen, History, Redo2, Undo2 } from 'lucide-react';

import { useRef } from 'react';

import { MAX_DOCUMENTS, getStoredDocuments } from '@/state/diagram/document-library';
import { useDiagramStore } from '@/state/diagram/store';

import { useEditorFeedback } from '../../feedback/EditorFeedbackProvider';
import { HeaderDivider } from './HeaderDivider';
import { HeaderIconButton } from './HeaderIconButton';

interface HeaderToolbarProps {
  canRedo: boolean;
  canUndo: boolean;

  onUndo: () => void;
  onRedo: () => void;

  onImportJson: (file: File) => Promise<void>;

  onOpenHistory: () => void;
  onOpenDocuments: () => void;
  onOpenShortcuts: () => void;
}

export function HeaderToolbar({
  canRedo,
  canUndo,
  onUndo,
  onRedo,
  onImportJson,
  onOpenHistory,
  onOpenDocuments,
  onOpenShortcuts,
}: HeaderToolbarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const documents = useDiagramStore((state) => state.documents);

  const { showFeedback } = useEditorFeedback();

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
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onOpenDocuments}
        aria-haspopup="dialog"
        className="flex h-8 items-center gap-2 rounded-md px-3 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <FolderOpen size={17} aria-hidden="true" />
        Documentos
      </button>

      <HeaderDivider />

      <HeaderIconButton icon={Undo2} label="Deshacer" onClick={onUndo} disabled={!canUndo} />

      <HeaderIconButton icon={Redo2} label="Rehacer" onClick={onRedo} disabled={!canRedo} />

      <HeaderDivider />

      <HeaderIconButton
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

      <HeaderDivider />

      <HeaderIconButton icon={History} label="Historial del proyecto" onClick={onOpenHistory} />

      <HeaderIconButton icon={CircleHelp} label="Ver atajos de teclado" onClick={onOpenShortcuts} />
    </div>
  );
}
