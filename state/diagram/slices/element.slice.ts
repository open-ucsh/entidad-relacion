import { createId } from '@/domain/diagram/lib/id';
import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { appendDiagramActivity, replaceActiveDiagram } from '../diagram.helpers';
import { moveDiagramElements, removeDiagramElements, updateDiagram } from '../diagram.mutations';
import type { DiagramStoreSlice, ElementSlice } from '../diagram.types';

const DUPLICATE_OFFSET = 32;

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
