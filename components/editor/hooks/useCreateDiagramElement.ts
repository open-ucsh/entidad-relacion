import type { Attribute, Entity, Point, Relationship, Tool } from '@/domain/diagram/models';

import { createId } from '@/domain/diagram/lib/id';
import { useDiagramStore } from '@/state/diagram/store';

type CreatableTool = Extract<Tool, 'entity' | 'relationship' | 'attribute'>;
export type CreatableElement = Entity | Relationship | Attribute;

const GRID_SIZE = 24;

function snapToGrid(position: Point): Point {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  };
}

function createElement(tool: CreatableTool, position: Point): CreatableElement {
  switch (tool) {
    case 'entity':
      return {
        id: createId('entity'),
        type: 'entity',
        name: 'Nueva Entidad',
        position,
        kind: 'regular',
      };

    case 'relationship':
      return {
        id: createId('relationship'),
        type: 'relationship',
        name: 'Nueva Relación',
        position,
        kind: 'regular',
      };

    case 'attribute':
      return {
        id: createId('attribute'),
        type: 'attribute',
        name: 'Nuevo Atributo',
        position,
        keyType: 'normal',
        unique: false,
        multivalued: false,
        optional: false,
        composite: false,
        derived: false,
      };
  }
}

export function useCreateDiagramElement() {
  const addEntity = useDiagramStore((state) => state.addEntity);
  const addRelationship = useDiagramStore((state) => state.addRelationship);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function createDiagramElementAt(tool: CreatableTool, position: Point): CreatableElement {
    const element = createElement(tool, snapToGrid(position));

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
