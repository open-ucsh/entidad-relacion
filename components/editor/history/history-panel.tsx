'use client';

import { useDiagramStore } from '@/state/diagram/store';

import { HistoryActivityList } from './history-activity-list';
import { HistoryPanelHeader } from './history-panel-header';
import { HistorySummary } from './history-summary';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const diagram = useDiagramStore((state) => state.diagram);

  if (!isOpen) {
    return null;
  }

  const activities = [...diagram.activity].reverse();
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
        <HistoryPanelHeader subtitle={originLabel} onClose={onClose} />

        <HistorySummary
          createdAt={diagram.metadata.createdAt}
          updatedAt={diagram.metadata.updatedAt}
          importedAt={diagram.metadata.importedAt}
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <HistoryActivityList activities={activities} />
        </div>
      </aside>
    </div>
  );
}
