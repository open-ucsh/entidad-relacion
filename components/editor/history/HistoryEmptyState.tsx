import { Clock3 } from 'lucide-react';

export function HistoryEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-text-muted/60">
        <Clock3 size={20} aria-hidden="true" />
      </span>
      <p className="text-sm text-text-muted">Aún no hay actividad registrada.</p>
    </div>
  );
}
