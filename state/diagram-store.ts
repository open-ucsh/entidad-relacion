import { create } from 'zustand';
import { removeDiagramElement, updateDiagram } from './diagram-utils';

import type { DiagramState } from './diagram-state';
import { initialDiagram } from './diagram-state';
import { createId } from '@/lib/id';

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagram: initialDiagram,

  selectedElementId: null,
  connectionSourceId: null,

  activeTool: 'select',

  setDiagram: (diagram) => {
    set({ diagram });
  },

  setSelectedElement: (selectedElementId) => {
    set({ selectedElementId });
  },

  setActiveTool: (activeTool) => {
    set({ activeTool, connectionSourceId: null });
  },

  addEntity: (entity) => {
    set((state) => ({
      diagram: { ...state.diagram, entities: [...state.diagram.entities, entity] },
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
      diagram: { ...state.diagram, attributes: [...state.diagram.attributes, attribute] },
    }));
  },

  addConnection: (connection) => {
    set((state) => ({
      diagram: { ...state.diagram, connections: [...state.diagram.connections, connection] },
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      diagram: updateDiagram(state.diagram, id, updates),
    }));
  },

  removeElement: (id) => {
    set((state) => ({
      diagram: removeDiagramElement(state.diagram, id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    }));
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
    set({ selectedElementId: null });
  },
}));
