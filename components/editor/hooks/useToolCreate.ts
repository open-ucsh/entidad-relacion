import type { Attribute, Entity, Relationship, Tool } from '@/domain/models';

import { createId } from '@/lib/id';
import { distance } from '@/lib/geometry';
import { getElements } from '@/domain/queries/elements';
import { useDiagramStore } from '@/state/diagram-store';

type CanvasElement = Entity | Relationship | Attribute;

const GRID_START_X = 180;
const GRID_START_Y = 120;
const GRID_SPACING_X = 160;
const GRID_SPACING_Y = 120;
const GRID_COLUMNS = 5;

const MIN_DISTANCE = 130;

const MAX_ATTEMPTS = 500;

function getNextFreePosition(occupiedPositions: { x: number; y: number }[]) {
  for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
    const candidate = {
      x: GRID_START_X + (index % GRID_COLUMNS) * GRID_SPACING_X,
      y: GRID_START_Y + Math.floor(index / GRID_COLUMNS) * GRID_SPACING_Y,
    };

    const isOccupied = occupiedPositions.some(
      (position) => distance(position, candidate) < MIN_DISTANCE,
    );

    if (!isOccupied) {
      return candidate;
    }
  }

  return {
    x: GRID_START_X,
    y: GRID_START_Y + Math.ceil(MAX_ATTEMPTS / GRID_COLUMNS) * GRID_SPACING_Y,
  };
}

export function useCanvasCreate() {
  const diagram = useDiagramStore((state) => state.diagram);

  const addEntity = useDiagramStore((state) => state.addEntity);
  const addRelationship = useDiagramStore((state) => state.addRelationship);
  const addAttribute = useDiagramStore((state) => state.addAttribute);

  const setSelectedElement = useDiagramStore((state) => state.setSelectedElement);

  function create(tool: Tool) {
    if (tool === 'select' || tool === 'connect') {
      return;
    }

    const occupiedPositions = getElements(diagram).map((element) => element.position);

    const position = getNextFreePosition(occupiedPositions);

    let element: CanvasElement | null = null;

    switch (tool) {
      case 'entity':
        element = {
          type: 'entity',
          id: createId('entity'),
          name: 'Nueva Entidad',
          position,
          kind: 'regular',
        };
        break;

      case 'relationship':
        element = {
          type: 'relationship',
          id: createId('relationship'),
          name: 'Nueva Relación',
          position,
          kind: 'regular',
        };
        break;

      case 'attribute':
        element = {
          type: 'attribute',
          id: createId('attribute'),
          name: 'Nuevo Atributo',
          position,
          keyType: 'normal',
          unique: false,
          multivalued: false,
          optional: false,
          composite: false,
          derived: false,
        };
        break;

      default:
        return;
    }

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
    create,
  };
}
