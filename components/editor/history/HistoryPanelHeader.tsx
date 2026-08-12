import { Clock3, X } from 'lucide-react';

interface HistoryPanelHeaderProps {
  subtitle: string;
  onClose: () => void;
}

export function HistoryPanelHeader({ subtitle, onClose }: HistoryPanelHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          <Clock3 size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 id="history-title" className="text-sm font-semibold text-text">
            Historial del proyecto
          </h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar historial"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </header>
  );
}
