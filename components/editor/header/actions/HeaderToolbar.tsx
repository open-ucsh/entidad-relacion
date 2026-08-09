'use client';

import { CircleHelp, FilePlus, FileUp, FolderOpen, History, Redo2, Undo2 } from 'lucide-react';
import { useRef } from 'react';

import { HeaderDivider } from './HeaderDivider';
import { HeaderIconButton } from './HeaderIconButton';

interface HeaderToolbarProps {
  canRedo: boolean;
  canUndo: boolean;
  onNewDiagram: () => void;
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
  onNewDiagram,
  onUndo,
  onRedo,
  onImportJson,
  onOpenHistory,
  onOpenDocuments,
  onOpenShortcuts,
}: HeaderToolbarProps) {
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
      <HeaderIconButton icon={FilePlus} label="Nuevo diagrama" onClick={onNewDiagram} />

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
      <HeaderIconButton icon={FolderOpen} label="Mis documentos" onClick={onOpenDocuments} />
      <HeaderIconButton icon={CircleHelp} label="Ver atajos de teclado" onClick={onOpenShortcuts} />
    </div>
  );
}
