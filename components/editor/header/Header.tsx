import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { HeaderActions } from './HeaderActions';
import { HeaderBrand } from './HeaderBrand';
import { ProjectNameEditor } from './ProjectNameEditor';

interface HeaderProps {
  diagramName: string;
  onNewDiagram: () => void;
  onOpenHistory: () => void;
  onRenameDiagram: (name: string) => void;
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<void>;
  onOpenDocuments: () => void;
  canRedo: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenShortcuts: () => void;
}

export function Header({
  diagramName,
  onNewDiagram,
  onOpenHistory,
  onRenameDiagram,
  onExport,
  onExportJson,
  onImportJson,
  onOpenDocuments,
  canRedo,
  canUndo,
  onUndo,
  onRedo,
  onOpenShortcuts,
}: HeaderProps) {
  return (
    <header className="relative flex h-27 shrink-0 items-center justify-between bg-brand-primary px-6">
      <div className="flex min-w-0 items-center gap-5">
        <HeaderBrand />

        <div className="hidden h-7 w-px bg-white/15 lg:block" aria-hidden="true" />

        <div className="hidden lg:block">
          <ProjectNameEditor name={diagramName} onCommit={onRenameDiagram} />
        </div>
      </div>

      <HeaderActions
        onNewDiagram={onNewDiagram}
        onOpenHistory={onOpenHistory}
        onExport={onExport}
        onExportJson={onExportJson}
        onImportJson={onImportJson}
        onOpenDocuments={onOpenDocuments}
        canRedo={canRedo}
        canUndo={canUndo}
        onUndo={onUndo}
        onRedo={onRedo}
        onOpenShortcuts={onOpenShortcuts}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-accent/0 via-accent to-accent/0"
        aria-hidden="true"
      />
    </header>
  );
}
