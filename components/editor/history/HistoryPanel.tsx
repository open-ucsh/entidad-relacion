'use client';

import { getDiagramElements } from '@/domain/diagram/queries/elements';

import { selectActiveDiagram } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { HistoryActivityList } from './HistoryActivityList';
import { HistoryPanelHeader } from './HistoryPanelHeader';
import { HistorySummary } from './HistorySummary';

interface HistoryPanelProps {
  onSelectTarget: () => void;
}

export function HistoryPanel({ onSelectTarget }: HistoryPanelProps) {
  const diagram = useDiagramStore(selectActiveDiagram);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  const activities = [...diagram.activity].reverse();

  const selectableTargetIds = new Set([
    ...getDiagramElements(diagram).map((element) => element.id),
    ...diagram.connections.map((connection) => connection.id),
  ]);

  const originLabel =
    diagram.metadata.origin === 'imported' ? 'Proyecto importado' : 'Creado en MER UCSH';

  return (
    <section aria-labelledby="history-title" className="flex h-full min-h-0 flex-col bg-surface">
      <HistoryPanelHeader subtitle={originLabel} />

      <HistorySummary
        createdAt={diagram.metadata.createdAt}
        updatedAt={diagram.metadata.updatedAt}
        importedAt={diagram.metadata.importedAt}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <HistoryActivityList
          activities={activities}
          isActivitySelectable={(activity) =>
            Boolean(activity.target && selectableTargetIds.has(activity.target.id))
          }
          onSelectActivity={(activity) => {
            if (!activity.target) {
              return;
            }

            setSelectedElement(activity.target.id);
            onSelectTarget();
          }}
        />
      </div>
    </section>
  );
}
