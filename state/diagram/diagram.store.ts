import { create } from 'zustand';

import { createId } from '@/domain/diagram/lib/id';

import { createInitialDiagram } from './diagram.initial';
import { moveDiagramElements, removeDiagramElements, updateDiagram } from './diagram.mutations';
import type { DiagramState } from './diagram.types';

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagram: createInitialDiagram(),
  selectedElementId: null,
  selectedElementIds: [],
  connectionSourceId: null,
  activeTool: 'select',

  setDiagram: (diagram) => {
    set({
      diagram,
      selectedElementId: null,
      selectedElementIds: [],
      connectionSourceId: null,
    });
  },

  resetDiagram: () => {
    set({
      diagram: createInitialDiagram(),
      selectedElementId: null,
      selectedElementIds: [],
      connectionSourceId: null,
      activeTool: 'select',
    });
  },

  setSelectedElement: (id) => {
    set({
      selectedElementId: id,
      selectedElementIds: id ? [id] : [],
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
        ...state.diagram.entities.map((element) => element.id),
        ...state.diagram.relationships.map((element) => element.id),
        ...state.diagram.attributes.map((element) => element.id),
      ];

      return {
        selectedElementIds,
        selectedElementId: selectedElementIds.at(-1) ?? null,
      };
    });
  },

  clearSelection: () => {
    set({
      selectedElementId: null,
      selectedElementIds: [],
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

  moveElements: (updates) => {
    if (updates.length === 0) {
      return;
    }

    set((state) => ({
      diagram: moveDiagramElements(state.diagram, updates),
    }));
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
    const { addConnection, connectionSourceId, diagram } = get();

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
}));
