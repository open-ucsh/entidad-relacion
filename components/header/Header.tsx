import type { ExportFormat } from '@/components/canvas/hooks/useCanvasExport';

import { HeaderActions } from './HeaderActions';
import { HeaderBrand } from './HeaderBrand';

interface HeaderProps {
  onExport: (format: ExportFormat) => void;
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="relative flex h-20 items-center justify-between border-b border-border bg-brand-primary px-5">
      <HeaderBrand />

      <HeaderActions onExport={onExport} />

      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-accent/0 via-accent to-accent/0"
        aria-hidden="true"
      />
    </header>
  );
}
