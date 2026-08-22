'use client';

import { PanelHeader } from '@/components/ui';

import { findDiagramConnection } from '@/domain/diagram/queries/connections';
import { findDiagramElement, getDiagramElements } from '@/domain/diagram/queries/elements';
import { getElementColor } from '@/state/diagram/diagram-appearance';
import { selectActiveDiagram } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

import { InspectorConnectionContent } from './InspectorConnectionContent';
import { InspectorConnectionHeader } from './InspectorConnectionHeader';
import { InspectorElementContent } from './InspectorElementContent';
import { InspectorEmpty } from './InspectorEmpty';
import { InspectorHeader } from './InspectorHeader';
import { InspectorMultiSelection } from './InspectorMultiSelection';

export function Inspector() {
  const diagram = useDiagramStore(selectActiveDiagram);
  const appearance = useDiagramStore((state) => state.appearance);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);
  const selectedElementIds = useDiagramStore((state) => state.selectedElementIds);
  const updateElement = useDiagramStore((state) => state.updateElement);
  const setElementColor = useDiagramStore((state) => state.setElementColor);
  const setSelectedElementsColor = useDiagramStore((state) => state.setSelectedElementsColor);
  const updateConnection = useDiagramStore((state) => state.updateConnection);
  const createConnectedAttribute = useDiagramStore((state) => state.createConnectedAttribute);
  const alignSelectedElements = useDiagramStore((state) => state.alignSelectedElements);
  const distributeSelectedElements = useDiagramStore((state) => state.distributeSelectedElements);

  const selectedElements = getDiagramElements(diagram).filter((element) =>
    selectedElementIds.includes(element.id),
  );

  const selectedColors = selectedElements.map((element) => getElementColor(appearance, element.id));

  const [firstSelectedColor] = selectedColors;

  const selectedColor =
    firstSelectedColor !== undefined &&
    selectedColors.every((color) => color === firstSelectedColor)
      ? firstSelectedColor
      : null;

  const element = selectedElementId ? findDiagramElement(diagram, selectedElementId) : undefined;

  const connection =
    !element && selectedElementId ? findDiagramConnection(diagram, selectedElementId) : undefined;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-surface">
      <PanelHeader title="Propiedades" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {selectedElements.length >= 2 ? (
          <div className="p-5">
            <InspectorMultiSelection
              count={selectedElements.length}
              color={selectedColor}
              onColorChange={setSelectedElementsColor}
              onAlign={alignSelectedElements}
              onDistribute={distributeSelectedElements}
            />
          </div>
        ) : connection ? (
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
              diagram={diagram}
              element={element}
              color={getElementColor(appearance, element.id)}
              updateElement={updateElement}
              setElementColor={setElementColor}
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
