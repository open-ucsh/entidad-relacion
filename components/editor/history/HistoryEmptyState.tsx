import { Clock3 } from 'lucide-react';

export function HistoryEmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Clock3 size={20} aria-hidden="true" />
      </span>

      <h3 className="mt-4 text-sm font-semibold text-text">Aún no hay actividad registrada</h3>

      <p className="mt-1 max-w-56 text-sm leading-6 text-text-muted">
        Los cambios relevantes del proyecto aparecerán aquí.
      </p>
    </div>
  );
}
