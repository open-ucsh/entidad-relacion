import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { ExportButton } from './actions/ExportButton';
import { HeaderToolbar } from './actions/HeaderToolbar';
import { MobileHeaderMenu } from './actions/MobileHeaderMenu';
import { HeaderBrand } from './HeaderBrand';
import { ProjectNameEditor } from './ProjectNameEditor';

interface HeaderProps {
  diagramName: string;
  canRedo: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenHistory: () => void;
  onOpenMobileHistory: () => void;
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
  onOpenMobileHistory,
  onRenameDiagram,
  onExport,
  onExportJson,
  onImportJson,
  onOpenDocuments,
  onOpenShortcuts,
}: HeaderProps) {
  return (
    <header className="relative z-50 shrink-0 border-b border-white/15 bg-brand-primary shadow-sm">
      <div className="flex h-14 min-w-0 items-center gap-3 px-3 sm:px-4 lg:h-16 lg:px-6">
        <div className="hidden shrink-0 lg:block">
          <HeaderBrand />
        </div>

        <div className="hidden h-9 w-px shrink-0 bg-white/15 lg:block" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <ProjectNameEditor name={diagramName} onCommit={onRenameDiagram} />
        </div>

        <div className="hidden shrink-0 lg:block">
          <ExportButton onExport={onExport} onExportJson={onExportJson} />
        </div>

        <MobileHeaderMenu
          canRedo={canRedo}
          canUndo={canUndo}
          onUndo={onUndo}
          onRedo={onRedo}
          onImportJson={onImportJson}
          onExport={onExport}
          onExportJson={onExportJson}
          onOpenHistory={onOpenMobileHistory}
          onOpenDocuments={onOpenDocuments}
          onOpenShortcuts={onOpenShortcuts}
        />
      </div>

      <div className="hidden h-11 items-center border-t border-white/10 bg-white/5 px-6 lg:flex">
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
