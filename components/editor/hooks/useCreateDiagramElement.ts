'use client';

import { createDiagramElement } from '@/domain/diagram/factories/element';
import type { Point, Tool } from '@/domain/diagram/models';
import { useDiagramStore } from '@/state/diagram/store';

type CreatableTool = Extract<Tool, 'entity' | 'relationship' | 'attribute'>;

const GRID_SIZE = 24;

function snapToGrid(position: Point): Point {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  };
}

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
