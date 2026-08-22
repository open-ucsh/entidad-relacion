import { createConnection } from '@/domain/diagram/factories/connection';
import { createAttribute } from '@/domain/diagram/factories/element';
import { getElementColor } from '../diagram-appearance';

import { findDiagramElement, getDiagramElements } from '@/domain/diagram/queries/elements';

import { appendDiagramActivity } from '../diagram-activity';
import { replaceActiveDiagram } from '../diagram-documents';
import { createAlignmentUpdates, createDistributionUpdates } from '../lib/element-arrangement';
import { findConnectedAttributePosition } from '../lib/element-placement';
import {
  duplicateDiagramElements,
  moveDiagramElements,
  removeDiagramElements,
  updateDiagram,
} from '../diagram-mutations';

import type {
  DiagramStoreSlice,
  ElementAlignment,
  ElementDistribution,
  ElementSlice,
} from '../diagram-store.types';

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

      if (!element) {
        return state;
      }

      const updatedDiagram = updateDiagram(state.diagram, id, updates);
      const renamed = typeof updates.name === 'string';

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

  setElementColor: (id, color) => {
    set((state) => {
      const element = findDiagramElement(state.diagram, id);

      if (!element || getElementColor(state.appearance, id) === color) {
        return state;
      }

      const elementColors =
        color === 'neutral'
          ? Object.fromEntries(
              Object.entries(state.appearance.elementColors).filter(
                ([elementId]) => elementId !== id,
              ),
            )
          : {
              ...state.appearance.elementColors,
              [id]: color,
            };

      const diagram = appendDiagramActivity(
        state.diagram,
        'element-updated',
        `Se actualizó el color de “${element.name}”.`,
      );

      return replaceActiveDiagram(state, diagram, {
        appearance: { elementColors },
      });
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
      const {
        diagram: duplicatedDiagram,
        duplicatedIds,
        duplicatedIdBySourceId,
      } = duplicateDiagramElements(state.diagram, selectedElementIds);

      if (duplicatedIds.length === 0) {
        return state;
      }

      const diagram = appendDiagramActivity(
        duplicatedDiagram,
        'element-created',
        `Se duplicó ${duplicatedIds.length} elemento${duplicatedIds.length === 1 ? '' : 's'}.`,
      );

      const elementColors = { ...state.appearance.elementColors };

      Object.entries(duplicatedIdBySourceId).forEach(([sourceId, duplicatedId]) => {
        const color = state.appearance.elementColors[sourceId];

        if (color) {
          elementColors[duplicatedId] = color;
        }
      });

      return {
        ...replaceActiveDiagram(state, diagram, {
          appearance: { elementColors },
        }),
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

      const elementColors = Object.fromEntries(
        Object.entries(state.appearance.elementColors).filter(
          ([elementId]) => !removedIds.has(elementId),
        ),
      );

      return {
        ...replaceActiveDiagram(state, diagram, {
          appearance: { elementColors },
        }),
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
