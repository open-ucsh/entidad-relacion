import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { ExportButton } from './actions/ExportButton';
import { HeaderToolbar } from './actions/HeaderToolbar';
import { HeaderBrand } from './HeaderBrand';
import { ProjectNameEditor } from './ProjectNameEditor';

interface HeaderProps {
  diagramName: string;
  canRedo: boolean;
  canUndo: boolean;
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
      <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="hidden shrink-0 md:block">
            <HeaderBrand />
          </div>

          <div className="hidden h-9 w-px shrink-0 bg-white/15 lg:block" aria-hidden="true" />

          <div className="min-w-0 flex-1 md:flex-none">
            <ProjectNameEditor name={diagramName} onCommit={onRenameDiagram} />
          </div>
        </div>

        <div className="shrink-0">
          <ExportButton onExport={onExport} onExportJson={onExportJson} />
        </div>
      </div>

      <div className="flex h-11 min-w-0 items-center overflow-hidden border-t border-white/10 bg-white/5 px-2 sm:px-4 lg:px-6">
        <HeaderToolbar
          canRedo={canRedo}
          canUndo={canUndo}
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
