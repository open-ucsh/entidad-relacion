'use client';

import { createDiagramElement } from '@/domain/diagram/factories/element';
import type { Point, Tool } from '@/domain/diagram/models';
import { useDiagramStore } from '@/state/diagram/store';

import { snapToGrid } from '../canvas/lib/grid';

type CreatableTool = Extract<Tool, 'entity' | 'relationship' | 'attribute'>;

export function useCreateDiagramElement() {
  const addEntity = useDiagramStore((state) => state.addEntity);
  const addRelationship = useDiagramStore((state) => state.addRelationship);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function createDiagramElementAt(tool: CreatableTool, position: Point) {
    const element = createDiagramElement(tool, snapToGrid(position));

    switch (element.type) {
      case 'entity':
        addEntity(element);
        break;

      case 'relationship':
        addRelationship(element);
        break;

      case 'attribute':
        addAttribute(element);
        break;
    }

    setSelectedElement(element.id);

    return element;
  }

  return {
    createDiagramElementAt,
  };
}
