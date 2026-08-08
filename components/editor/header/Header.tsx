import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { HeaderActions } from './HeaderActions';
import { HeaderBrand } from './HeaderBrand';

interface HeaderProps {
  onNewDiagram: () => void;
  onExport: (format: ExportFormat) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<void>;
}

export function Header({ onNewDiagram, onExport, onExportJson, onImportJson }: HeaderProps) {
  return (
    <header className="relative flex h-27 shrink-0 items-center justify-between bg-brand-primary px-6">
      <HeaderBrand />

      <HeaderActions
        onNewDiagram={onNewDiagram}
        onExport={onExport}
        onExportJson={onExportJson}
        onImportJson={onImportJson}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-accent/0 via-accent to-accent/0"
        aria-hidden="true"
      />
    </header>
  );
}
