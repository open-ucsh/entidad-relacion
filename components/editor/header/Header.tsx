import type { ExportFormat } from '../canvas/hooks/useCanvasExport';

import { HeaderActions } from './HeaderActions';
import { HeaderBrand } from './HeaderBrand';

interface HeaderProps {
  onNewDiagram: () => void;
  onExport: (format: ExportFormat) => void;
}

export function Header({ onNewDiagram, onExport }: HeaderProps) {
  return (
    <header className="relative shrink-0 border-b border-white/10 bg-brand-primary">
      <div className="flex h-27 items-center justify-between gap-6 px-6">
        <HeaderBrand />
        <HeaderActions onNewDiagram={onNewDiagram} onExport={onExport} />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-accent/0 via-accent to-accent/0"
        aria-hidden="true"
      />
    </header>
  );
}
