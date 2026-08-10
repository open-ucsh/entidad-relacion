'use client';

import type { Tool } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import { selectActiveDiagram } from '@/state/diagram/selectors';
import { useDiagramStore } from '@/state/diagram/store';

export function useDiagramTool() {
  const diagram = useDiagramStore(selectActiveDiagram);
  const selectedElementId = useDiagramStore((state) => state.selectedElementId);

  const setActiveTool = useDiagramStore((state) => state.setActiveTool);
  const createConnectedAttribute = useDiagramStore((state) => state.createConnectedAttribute);

  function activateTool(tool: Tool) {
    if (tool === 'attribute' && selectedElementId) {
      const selectedElement = findDiagramElement(diagram, selectedElementId);

      if (selectedElement && selectedElement.type !== 'attribute') {
        createConnectedAttribute(selectedElement.id);
        return;
      }
    }

    setActiveTool(tool);
  }

  return {
    activateTool,
  };
}
