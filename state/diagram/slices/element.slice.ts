import type { ElementSlice, DiagramStoreSlice } from '../diagram.types';

import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { appendDiagramActivity, replaceActiveDiagram } from '../diagram.helpers';
import { moveDiagramElements, removeDiagramElements, updateDiagram } from '../diagram.mutations';

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

    set((state) => replaceActiveDiagram(state, moveDiagramElements(state.diagram, updates)));
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
