import { FileText } from 'lucide-react';

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
    <header className="relative z-50 shrink-0 border-b border-border bg-background text-text">
      <div className="flex min-h-20 min-w-0 items-center gap-3 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <HeaderBrand />

        <span aria-hidden="true" className="h-10 w-px shrink-0 bg-border" />

        <FileText
          aria-hidden="true"
          className="hidden size-5 shrink-0 text-brand-primary sm:block"
        />

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

      <div className="hidden min-h-12 items-center border-t border-border px-6 lg:flex lg:px-8">
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
    </header>
  );
}
