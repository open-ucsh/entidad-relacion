import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { ExportButton } from './actions/ExportButton';
import { HeaderToolbar } from './actions/HeaderToolbar';
import { HeaderBrand } from './HeaderBrand';
import { ProjectNameEditor } from './ProjectNameEditor';

interface HeaderProps {
  diagramName: string;
  updatedAt: string;
  canRedo: boolean;
  canUndo: boolean;
  onNewDiagram: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenHistory: () => void;
  onRenameDiagram: (name: string) => void;
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<void>;
  onOpenDocuments: () => void;
  onOpenShortcuts: () => void;
}

export function Header({
  diagramName,
  canRedo,
  canUndo,
  onNewDiagram,
  onUndo,
  onRedo,
  onOpenHistory,
  onRenameDiagram,
  onExport,
  onExportJson,
  onImportJson,
  onOpenDocuments,
  onOpenShortcuts,
}: HeaderProps) {
  return (
    <header className="relative shrink-0 border-b border-white/15 bg-brand-primary shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-4">
          <HeaderBrand />

          <div className="hidden h-9 w-px bg-white/15 lg:block" aria-hidden="true" />

          <ProjectNameEditor name={diagramName} onCommit={onRenameDiagram} />
        </div>

        <ExportButton onExport={onExport} onExportJson={onExportJson} />
      </div>

      <div className="flex h-11 items-center border-t border-white/10 bg-white/5 px-6">
        <HeaderToolbar
          canRedo={canRedo}
          canUndo={canUndo}
          onNewDiagram={onNewDiagram}
          onUndo={onUndo}
          onRedo={onRedo}
          onImportJson={onImportJson}
          onOpenHistory={onOpenHistory}
          onOpenDocuments={onOpenDocuments}
          onOpenShortcuts={onOpenShortcuts}
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-accent/0 via-accent to-accent/0"
        aria-hidden="true"
      />
    </header>
  );
}
