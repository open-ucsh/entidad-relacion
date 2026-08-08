import type { Attribute, Entity, Point, Relationship, Tool } from '@/domain/diagram/models';

import { distance } from '@/domain/diagram/lib/geometry';
import { createId } from '@/domain/diagram/lib/id';
import { getDiagramElements } from '@/domain/diagram/queries/elements';
import { useDiagramStore } from '@/state/diagram/diagram.store';

type CreatableTool = Extract<Tool, 'entity' | 'relationship' | 'attribute'>;
type CreatableElement = Entity | Relationship | Attribute;

const GRID_START: Point = {
  x: 180,
  y: 120,
};

const GRID_SPACING: Point = {
  x: 160,
  y: 120,
};

const GRID_COLUMNS = 5;
const MIN_DISTANCE = 130;
const MAX_POSITION_ATTEMPTS = 500;

function getNextFreePosition(occupiedPositions: Point[]): Point {
  for (let index = 0; index < MAX_POSITION_ATTEMPTS; index += 1) {
    const candidate: Point = {
      x: GRID_START.x + (index % GRID_COLUMNS) * GRID_SPACING.x,
      y: GRID_START.y + Math.floor(index / GRID_COLUMNS) * GRID_SPACING.y,
    };

    const isOccupied = occupiedPositions.some(
      (position) => distance(position, candidate) < MIN_DISTANCE,
    );

    if (!isOccupied) {
      return candidate;
    }
  }

  return {
    x: GRID_START.x,
    y: GRID_START.y + Math.ceil(MAX_POSITION_ATTEMPTS / GRID_COLUMNS) * GRID_SPACING.y,
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
  const diagram = useDiagramStore((state) => state.diagram);

  const addEntity = useDiagramStore((state) => state.addEntity);
  const addRelationship = useDiagramStore((state) => state.addRelationship);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function createDiagramElement(tool: CreatableTool) {
    const occupiedPositions = getDiagramElements(diagram).map((element) => element.position);

    const element = createElement(tool, getNextFreePosition(occupiedPositions));

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
  }

  return {
    createDiagramElement,
  };
}
