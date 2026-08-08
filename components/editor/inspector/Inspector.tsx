'use client';

import { Panel, PanelHeader } from '@/components/ui';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { useDiagramStore } from '@/state/diagram/diagram.store';

import { InspectorElementContent } from './InspectorElementContent';
import { InspectorEmpty } from './InspectorEmpty';
import { InspectorHeader } from './InspectorHeader';

export function Inspector() {
  const diagram = useDiagramStore((state) => state.diagram);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const updateElement = useDiagramStore((state) => state.updateElement);

  const element = selectedElementId ? findDiagramElement(diagram, selectedElementId) : undefined;

  return (
    <aside className="h-full min-h-0">
      <Panel>
        <PanelHeader title="Inspector" />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!element ? (
            <InspectorEmpty />
          ) : (
            <div className="space-y-6 p-5">
              <InspectorHeader key={element.id} element={element} updateElement={updateElement} />

              <InspectorElementContent element={element} updateElement={updateElement} />
            </div>
          )}
        </div>
      </Panel>
    </aside>
  );
}
