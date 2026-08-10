import { createAttribute } from '@/domain/diagram/factories/element';
import { createConnection } from '@/domain/diagram/factories/connection';
import { createId } from '@/domain/diagram/lib/id';
import { distance } from '@/domain/diagram/lib/geometry';
import type { Diagram } from '@/domain/diagram/models';
import { findDiagramElement, getDiagramElements } from '@/domain/diagram/queries/elements';

import { appendDiagramActivity, replaceActiveDiagram } from '../helpers';
import { moveDiagramElements, removeDiagramElements, updateDiagram } from '../mutations';
import type { DiagramStoreSlice, ElementSlice } from '../types';

const DUPLICATE_OFFSET = 32;
const ATTRIBUTE_DISTANCE = 120;
const MIN_ATTRIBUTE_DISTANCE = 85;

const ATTRIBUTE_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0.7, y: 0.7 },
  { x: 0, y: 1 },
  { x: -0.7, y: 0.7 },
  { x: -1, y: 0 },
  { x: -0.7, y: -0.7 },
  { x: 0, y: -1 },
  { x: 0.7, y: -0.7 },
] as const;

function getConnectedAttributePosition(diagram: Diagram, parentId: string) {
  const parent = findDiagramElement(diagram, parentId);

  if (!parent) {
    return null;
  }

  const occupiedPositions = getDiagramElements(diagram).map((element) => element.position);

  for (let ring = 1; ring <= 4; ring += 1) {
    const distanceFromParent = ATTRIBUTE_DISTANCE * ring;

    for (const direction of ATTRIBUTE_DIRECTIONS) {
      const position = {
        x: parent.position.x + direction.x * distanceFromParent,
        y: parent.position.y + direction.y * distanceFromParent,
      };

      const isFree = occupiedPositions.every(
        (occupiedPosition) => distance(occupiedPosition, position) > MIN_ATTRIBUTE_DISTANCE,
      );

      if (isFree) {
        return position;
      }
    }
  }

  return {
    x: parent.position.x + ATTRIBUTE_DISTANCE,
    y: parent.position.y,
  };
}

export const createElementSlice: DiagramStoreSlice<ElementSlice> = (set, get) => ({
  addEntity: (entity) => {
    set((state) => {
      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          entities: [...state.diagram.entities, entity],
        },
        'element-created',
        `Se creó la entidad “${entity.name}”.`,
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  addRelationship: (relationship) => {
    set((state) => {
      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          relationships: [...state.diagram.relationships, relationship],
        },
        'element-created',
        `Se creó la relación “${relationship.name}”.`,
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  addAttribute: (attribute) => {
    set((state) => {
      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          attributes: [...state.diagram.attributes, attribute],
        },
        'element-created',
        `Se creó el atributo “${attribute.name}”.`,
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  createConnectedAttribute: (parentId) => {
    set((state) => {
      const parent = findDiagramElement(state.diagram, parentId);

      if (!parent || parent.type === 'attribute') {
        return state;
      }

      const position = getConnectedAttributePosition(state.diagram, parentId);

      if (!position) {
        return state;
      }

      const attribute = createAttribute(position);
      const connection = createConnection(parent.id, attribute.id);

      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          attributes: [...state.diagram.attributes, attribute],
          connections: [...state.diagram.connections, connection],
        },
        'element-created',
        `Se agregó el atributo “${attribute.name}” a “${parent.name}”.`,
      );

      return {
        ...replaceActiveDiagram(state, diagram),
        selectedElementId: attribute.id,
        selectedElementIds: [attribute.id],
      };
    });
  },

  updateElement: (id, updates) => {
    set((state) => {
      const element = findDiagramElement(state.diagram, id);
      const updatedDiagram = updateDiagram(state.diagram, id, updates);

      const details =
        typeof updates.name === 'string' && element
          ? `Se renombró “${element.name}” a “${updates.name}”.`
          : 'Se actualizaron las propiedades de un elemento.';

      const diagram = appendDiagramActivity(
        updatedDiagram,
        typeof updates.name === 'string' ? 'element-renamed' : 'element-updated',
        details,
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  moveElements: (updates) => {
    if (updates.length === 0) {
      return;
    }

    set((state) =>
      replaceActiveDiagram(state, moveDiagramElements(state.diagram, updates), {
        recordHistory: false,
      }),
    );
  },

  duplicateSelectedElements: () => {
    const selectedElementIds = get().selectedElementIds;

    if (selectedElementIds.length === 0) {
      return;
    }

    const selectedIds = new Set(selectedElementIds);

    set((state) => {
      const duplicatedEntities = state.diagram.entities
        .filter((entity) => selectedIds.has(entity.id))
        .map((entity) => ({
          ...entity,
          id: createId('entity'),
          name: `${entity.name} copia`,
          position: {
            x: entity.position.x + DUPLICATE_OFFSET,
            y: entity.position.y + DUPLICATE_OFFSET,
          },
        }));

      const duplicatedRelationships = state.diagram.relationships
        .filter((relationship) => selectedIds.has(relationship.id))
        .map((relationship) => ({
          ...relationship,
          id: createId('relationship'),
          name: `${relationship.name} copia`,
          position: {
            x: relationship.position.x + DUPLICATE_OFFSET,
            y: relationship.position.y + DUPLICATE_OFFSET,
          },
        }));

      const duplicatedAttributes = state.diagram.attributes
        .filter((attribute) => selectedIds.has(attribute.id))
        .map((attribute) => ({
          ...attribute,
          id: createId('attribute'),
          name: `${attribute.name} copia`,
          position: {
            x: attribute.position.x + DUPLICATE_OFFSET,
            y: attribute.position.y + DUPLICATE_OFFSET,
          },
        }));

      const duplicatedIds = [
        ...duplicatedEntities.map((entity) => entity.id),
        ...duplicatedRelationships.map((relationship) => relationship.id),
        ...duplicatedAttributes.map((attribute) => attribute.id),
      ];

      if (duplicatedIds.length === 0) {
        return state;
      }

      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          entities: [...state.diagram.entities, ...duplicatedEntities],
          relationships: [...state.diagram.relationships, ...duplicatedRelationships],
          attributes: [...state.diagram.attributes, ...duplicatedAttributes],
        },
        'element-created',
        `Se duplicó ${duplicatedIds.length} elemento${duplicatedIds.length === 1 ? '' : 's'}.`,
      );

      return {
        ...replaceActiveDiagram(state, diagram),
        selectedElementIds: duplicatedIds,
        selectedElementId: duplicatedIds.at(-1) ?? null,
      };
    });
  },

  removeElement: (id) => {
    get().removeElements([id]);
  },

  removeElements: (ids) => {
    if (ids.length === 0) {
      return;
    }

    const removedIds = new Set(ids);

    set((state) => {
      const selectedElementIds = state.selectedElementIds.filter(
        (selectedId) => !removedIds.has(selectedId),
      );

      const diagram = appendDiagramActivity(
        removeDiagramElements(state.diagram, ids),
        'elements-removed',
        `Se eliminaron ${ids.length} elemento${ids.length === 1 ? '' : 's'}.`,
      );

      return {
        ...replaceActiveDiagram(state, diagram),
        selectedElementIds,
        selectedElementId: selectedElementIds.at(-1) ?? null,
        connectionSourceId:
          state.connectionSourceId && removedIds.has(state.connectionSourceId)
            ? null
            : state.connectionSourceId,
      };
    });
  },
});
