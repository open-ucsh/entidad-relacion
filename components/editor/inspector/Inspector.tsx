'use client';

import { PanelHeader } from '@/components/ui';
import { findDiagramConnection } from '@/domain/diagram/queries/connections';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { selectActiveDiagram } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { InspectorConnectionContent } from './InspectorConnectionContent';
import { InspectorConnectionHeader } from './InspectorConnectionHeader';
import { InspectorElementContent } from './InspectorElementContent';
import { InspectorEmpty } from './InspectorEmpty';
import { InspectorHeader } from './InspectorHeader';

export function Inspector() {
  const diagram = useDiagramStore(selectActiveDiagram);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const updateConnection = useDiagramStore((state) => state.updateConnection);
  const createConnectedAttribute = useDiagramStore((state) => state.createConnectedAttribute);

  const element = selectedElementId ? findDiagramElement(diagram, selectedElementId) : undefined;

  const connection =
    !element && selectedElementId ? findDiagramConnection(diagram, selectedElementId) : undefined;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-surface">
      <PanelHeader title="Propiedades" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {connection ? (
          <div className="space-y-6 p-5">
            <InspectorConnectionHeader connection={connection} />

            <InspectorConnectionContent
              connection={connection}
              updateConnection={updateConnection}
            />
          </div>
        ) : element ? (
          <div className="space-y-6 p-5">
            <InspectorHeader
              key={`${element.id}:${element.name}`}
              element={element}
              updateElement={updateElement}
            />

            <InspectorElementContent
              element={element}
              updateElement={updateElement}
              onAddAttribute={createConnectedAttribute}
            />
          </div>
        ) : (
          <InspectorEmpty />
        )}
      </div>
    </aside>
  );
}
