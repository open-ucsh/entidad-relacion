import { createConnection } from '@/domain/diagram/factories/connection';
import { createAttribute } from '@/domain/diagram/factories/element';

import { findDiagramElement, getDiagramElements } from '@/domain/diagram/queries/elements';

import { appendDiagramActivity, replaceActiveDiagram } from '../helpers';
import { createAlignmentUpdates, createDistributionUpdates } from '../lib/element-arrangement';
import { findConnectedAttributePosition } from '../lib/element-placement';
import {
  duplicateDiagramElements,
  moveDiagramElements,
  removeDiagramElements,
  updateDiagram,
} from '../mutations';

import type {
  DiagramStoreSlice,
  ElementAlignment,
  ElementDistribution,
  ElementSlice,
} from '../types';

function getSelectedDiagramElements(
  selectedElementIds: string[],
  diagram: Parameters<typeof getDiagramElements>[0],
) {
  const selectedIds = new Set(selectedElementIds);

  return getDiagramElements(diagram).filter((element) => selectedIds.has(element.id));
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

  addIsa: (isa) => {
    set((state) => {
      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          isas: [...state.diagram.isas, isa],
        },
        'element-created',
        'Se creó una jerarquía ISA.',
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

      const position = findConnectedAttributePosition(state.diagram, parentId);

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

      const renamed = typeof updates.name === 'string' && element;

      const diagram = appendDiagramActivity(
        updatedDiagram,
        renamed ? 'element-renamed' : 'element-updated',
        renamed
          ? `Se renombró “${element.name}” a “${updates.name}”.`
          : 'Se actualizaron las propiedades de un elemento.',
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

  alignSelectedElements: (alignment: ElementAlignment) => {
    set((state) => {
      const selectedElements = getSelectedDiagramElements(state.selectedElementIds, state.diagram);

      const updates = createAlignmentUpdates(selectedElements, alignment);

      if (updates.length === 0) {
        return state;
      }

      const diagram = appendDiagramActivity(
        moveDiagramElements(state.diagram, updates),
        'element-updated',
        `Se alinearon ${selectedElements.length} elementos.`,
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  distributeSelectedElements: (distribution: ElementDistribution) => {
    set((state) => {
      const selectedElements = getSelectedDiagramElements(state.selectedElementIds, state.diagram);

      const updates = createDistributionUpdates(selectedElements, distribution);

      if (updates.length === 0) {
        return state;
      }

      const diagram = appendDiagramActivity(
        moveDiagramElements(state.diagram, updates),
        'element-updated',
        `Se distribuyeron ${selectedElements.length} elementos.`,
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  duplicateSelectedElements: () => {
    const selectedElementIds = get().selectedElementIds;

    if (selectedElementIds.length === 0) {
      return;
    }

    set((state) => {
      const { diagram: duplicatedDiagram, duplicatedIds } = duplicateDiagramElements(
        state.diagram,
        selectedElementIds,
      );

      if (duplicatedIds.length === 0) {
        return state;
      }

      const diagram = appendDiagramActivity(
        duplicatedDiagram,
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
