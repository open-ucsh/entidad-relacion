import { create } from 'zustand';

import { createId } from '@/lib/id';

import { removeDiagramElements, updateDiagram } from './diagram-utils';
import type { DiagramState } from './diagram-state';
import { createInitialDiagram } from './diagram-state';

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagram: createInitialDiagram(),
  selectedElementId: null,
  selectedElementIds: [],
  connectionSourceId: null,
  activeTool: 'select',

  setDiagram: (diagram) => {
    set({ diagram });
  },

  setSelectedElement: (selectedElementId) => {
    set({
      selectedElementId,
      selectedElementIds: selectedElementId ? [selectedElementId] : [],
    });
  },

  toggleSelectedElement: (id) => {
    set((state) => {
      const isSelected = state.selectedElementIds.includes(id);

      const selectedElementIds = isSelected
        ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedElementIds, id];

      return {
        selectedElementIds,
        selectedElementId: isSelected ? (selectedElementIds.at(-1) ?? null) : id,
      };
    });
  },

  selectAllElements: () => {
    set((state) => {
      const selectedElementIds = [
        ...state.diagram.entities.map((item) => item.id),
        ...state.diagram.relationships.map((item) => item.id),
        ...state.diagram.attributes.map((item) => item.id),
      ];

      return {
        selectedElementIds,
        selectedElementId: selectedElementIds.at(-1) ?? null,
      };
    });
  },

  setActiveTool: (activeTool) => {
    set({
      activeTool,
      connectionSourceId: null,
    });
  },

  addEntity: (entity) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        entities: [...state.diagram.entities, entity],
      },
    }));
  },

  addRelationship: (relationship) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        relationships: [...state.diagram.relationships, relationship],
      },
    }));
  },

  addAttribute: (attribute) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        attributes: [...state.diagram.attributes, attribute],
      },
    }));
  },

  addConnection: (connection) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        connections: [...state.diagram.connections, connection],
      },
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      diagram: updateDiagram(state.diagram, id, updates),
    }));
  },

  removeElement: (id) => {
    get().removeElements([id]);
  },

  removeElements: (ids) => {
    const removedIds = new Set(ids);

    set((state) => {
      const selectedElementIds = state.selectedElementIds.filter((id) => !removedIds.has(id));

      return {
        diagram: removeDiagramElements(state.diagram, ids),
        selectedElementIds,
        selectedElementId: selectedElementIds.at(-1) ?? null,
        connectionSourceId:
          state.connectionSourceId && removedIds.has(state.connectionSourceId)
            ? null
            : state.connectionSourceId,
      };
    });
  },

  handleConnectClick: (id) => {
    const { connectionSourceId, diagram, addConnection } = get();

    if (!connectionSourceId) {
      set({ connectionSourceId: id });
      return;
    }

    if (connectionSourceId === id) {
      set({ connectionSourceId: null });
      return;
    }

    const alreadyExists = diagram.connections.some(
      (connection) =>
        (connection.fromId === connectionSourceId && connection.toId === id) ||
        (connection.fromId === id && connection.toId === connectionSourceId),
    );

    if (!alreadyExists) {
      addConnection({
        id: createId('connection'),
        type: 'connection',
        fromId: connectionSourceId,
        toId: id,
      });
    }

    set({ connectionSourceId: null });
  },

  clearSelection: () => {
    set({
      selectedElementId: null,
      selectedElementIds: [],
    });
  },
}));
