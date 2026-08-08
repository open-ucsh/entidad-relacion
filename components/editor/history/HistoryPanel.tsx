'use client';

import { Clock3, FolderInput, X } from 'lucide-react';

import { useDiagramStore } from '@/state/diagram/diagram.store';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(date),
  );
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat('es-CL', { timeStyle: 'short' }).format(new Date(date));
}

function formatDayLabel(date: string): string {
  const target = new Date(date);
  const now = new Date();
  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(target)) / 86_400_000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: target.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(target);
}

/** Groups a reverse-chronological activity list into day buckets ("Hoy", "Ayer", fecha). */
function groupActivitiesByDay<T extends { occurredAt: string }>(activities: T[]) {
  const groups: Array<{ label: string; items: T[] }> = [];

  for (const activity of activities) {
    const label = formatDayLabel(activity.occurredAt);
    const last = groups.at(-1);

    if (last && last.label === label) {
      last.items.push(activity);
    } else {
      groups.push({ label, items: [activity] });
    }
  }

  return groups;
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const diagram = useDiagramStore((state) => state.diagram);

  if (!isOpen) {
    return null;
  }

  const activities = [...diagram.activity].reverse();
  const groups = groupActivitiesByDay(activities);
  const originLabel =
    diagram.metadata.origin === 'imported' ? 'Proyecto importado' : 'Creado en ER Designer';

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-text/20 backdrop-blur-[1px]"
        aria-label="Cerrar historial"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id="history-title" className="text-sm font-semibold text-text">
              Historial del proyecto
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">{originLabel}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <dl className="grid grid-cols-2 gap-3 border-b border-border bg-surface px-5 py-3 text-xs">
          <div>
            <dt className="text-text-muted">Creado</dt>
            <dd className="mt-0.5 font-medium text-text">
              {formatDateTime(diagram.metadata.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-text-muted">Última edición</dt>
            <dd className="mt-0.5 font-medium text-text">
              {formatDateTime(diagram.metadata.updatedAt)}
            </dd>
          </div>

          {diagram.metadata.importedAt && (
            <div className="col-span-2 flex items-center gap-1.5 text-amber-700">
              <FolderInput size={12} aria-hidden="true" />
              Importado el {formatDateTime(diagram.metadata.importedAt)}
            </div>
          )}
        </dl>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {groups.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Clock3 size={22} className="text-text-muted/60" aria-hidden="true" />
              <p className="text-sm text-text-muted">Aún no hay actividad registrada.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section key={group.label}>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    {group.label}
                  </h3>

                  <ol className="space-y-3 border-l border-border pl-4">
                    {group.items.map((activity) => (
                      <li key={activity.id} className="relative">
                        <span
                          aria-hidden="true"
                          className="absolute -left-5 top-1 size-2 rounded-full bg-brand-primary/40 ring-4 ring-background"
                        />
                        <p className="text-sm leading-5 text-text">{activity.details}</p>
                        <time
                          dateTime={activity.occurredAt}
                          className="mt-0.5 block text-xs text-text-muted"
                        >
                          {formatTime(activity.occurredAt)}
                        </time>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
