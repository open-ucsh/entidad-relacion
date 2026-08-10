'use client';

import { selectActiveDiagram } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { HistoryActivityList } from './history-activity-list';
import { HistoryPanelHeader } from './history-panel-header';
import { HistorySummary } from './history-summary';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const diagram = useDiagramStore(selectActiveDiagram);

  if (!isOpen) {
    return null;
  }

  const activities = [...diagram.activity].reverse();
  const originLabel =
    diagram.metadata.origin === 'imported' ? 'Proyecto importado' : 'Creado en ER Designer';

  return (
    <div className="fixed inset-0 z-40 bg-text/20">
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
