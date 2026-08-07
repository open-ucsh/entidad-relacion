'use client';

import { MoveHorizontal } from 'lucide-react';

import { Panel, PanelHeader } from '@/components/ui';
import { useDiagramStore } from '@/state/diagram-store';

import { InspectorEmpty } from './InspectorEmpty';
import { InspectorField } from './InspectorField';
import { InspectorHeader } from './InspectorHeader';

function getSelectedElement(
  diagram: ReturnType<typeof useDiagramStore.getState>['diagram'],
  id: string,
) {
  return [
    ...diagram.entities,
    ...diagram.relationships,
    ...diagram.attributes,
    ...diagram.isas,
  ].find((element) => element.id === id);
}

export function Inspector() {
  const diagram = useDiagramStore((state) => state.diagram);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);

  const element = selectedElementId ? getSelectedElement(diagram, selectedElementId) : null;

  return (
    <aside className="border-l border-border">
      <Panel>
        <PanelHeader title="Inspector" />

        {!element ? (
          <InspectorEmpty />
        ) : (
          <div className="space-y-6 p-5">
            <InspectorHeader element={element} />

            <InspectorField label="Identificador">
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <code className="break-all text-xs text-text-muted">{element.id}</code>
              </div>
            </InspectorField>

            <InspectorField label="Posición">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <MoveHorizontal size={14} className="shrink-0 text-text-muted" />

                <div className="flex flex-1 items-center justify-between text-sm text-text">
                  <span className="tabular-nums">
                    X <span className="text-text-muted">{Math.round(element.position.x)}</span>
                  </span>

                  <span className="h-4 w-px bg-border" />

                  <span className="tabular-nums">
                    Y <span className="text-text-muted">{Math.round(element.position.y)}</span>
                  </span>
                </div>
              </div>
            </InspectorField>
          </div>
        )}
      </Panel>
    </aside>
  );
}
