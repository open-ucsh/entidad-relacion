'use client';

import { MoveHorizontal } from 'lucide-react';
import { Panel, PanelHeader } from '@/components/ui';
import { findConnectionById, findElementById } from '@/domain/queries';
import { useDiagramStore } from '@/state/diagram-store';
import { InspectorConnectionContent } from './InspectorConnectionContent';
import { InspectorElementContent } from './InspectorElementContent';
import { InspectorEmpty } from './InspectorEmpty';
import { InspectorField } from './InspectorField';
import { InspectorHeader } from './InspectorHeader';

const nameInputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40';

export function Inspector() {
  const diagram = useDiagramStore((state) => state.diagram);

  const selectedElementId = useDiagramStore((state) => state.selectedElementId);

  const selectedConnectionId = useDiagramStore((state) => state.selectedConnectionId);

  const updateElement = useDiagramStore((state) => state.updateElement);

  const updateConnection = useDiagramStore((state) => state.updateConnection);

  const element = selectedElementId ? findElementById(diagram, selectedElementId) : undefined;

  const connection = selectedConnectionId
    ? findConnectionById(diagram, selectedConnectionId)
    : undefined;

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col border-l border-border">
      <div className="flex h-full min-h-0 flex-col">
        <Panel>
          <PanelHeader title="Inspector" />

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!element && !connection ? (
              <InspectorEmpty />
            ) : (
              <div className="space-y-6 p-5">
                {element ? <InspectorHeader element={element} /> : null}

                {element ? (
                  <>
                    <InspectorField label="Nombre">
                      <input
                        className={nameInputClassName}
                        type="text"
                        value={element.name}
                        onChange={(event) => {
                          updateElement(element.id, {
                            name: event.target.value,
                          });
                        }}
                      />
                    </InspectorField>

                    <InspectorField label="Identificador">
                      <div className="rounded-md border border-border bg-background px-3 py-2">
                        <code className="break-all text-xs text-text-muted">{element.id}</code>
                      </div>
                    </InspectorField>

                    <InspectorField label="Posición">
                      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                        <MoveHorizontal size={14} className="shrink-0 text-text-muted" />

                        <div className="flex flex-1 items-center justify-between text-sm text-text">
                          <span className="tabular-nums">X {Math.round(element.position.x)}</span>

                          <span className="h-4 w-px bg-border" />

                          <span className="tabular-nums">Y {Math.round(element.position.y)}</span>
                        </div>
                      </div>
                    </InspectorField>

                    <InspectorElementContent
                      element={element}
                      diagram={diagram}
                      updateElement={updateElement}
                    />
                  </>
                ) : null}

                {connection ? (
                  <InspectorConnectionContent
                    diagram={diagram}
                    connection={connection}
                    updateConnection={updateConnection}
                  />
                ) : null}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </aside>
  );
}
