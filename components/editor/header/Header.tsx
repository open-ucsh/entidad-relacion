import { FileText, Redo2, Undo2 } from 'lucide-react';

import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { ExportButton } from './actions/ExportButton';
import { HeaderDivider } from './actions/HeaderDivider';
import { HeaderIconButton } from './actions/HeaderIconButton';
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

        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <ExportButton onExport={onExport} onExportJson={onExportJson} />

          <HeaderDivider />

          <HeaderIconButton icon={Undo2} label="Deshacer" onClick={onUndo} disabled={!canUndo} />

          <HeaderIconButton icon={Redo2} label="Rehacer" onClick={onRedo} disabled={!canRedo} />
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
    </header>
  );
}
