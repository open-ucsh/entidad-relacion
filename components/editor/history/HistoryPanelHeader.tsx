import { Clock3 } from 'lucide-react';

interface HistoryPanelHeaderProps {
  subtitle: string;
}

export function HistoryPanelHeader({ subtitle }: HistoryPanelHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-5 py-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Clock3 size={16} aria-hidden="true" />
      </span>

      <div>
        <h2 id="history-title" className="text-sm font-semibold text-text">
          Historial del proyecto
        </h2>

        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
    </header>
  );
}
