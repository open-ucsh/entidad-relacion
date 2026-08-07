import { create } from 'zustand';

import type { DiagramState } from './diagram-state';
import { initialDiagram } from './diagram-state';
import { updateConnections, updateDiagram } from './diagram-utils';

export const useDiagramStore = create<DiagramState>((set) => ({
  diagram: initialDiagram,

  selectedElementId: null,
  selectedConnectionId: null,

  activeTool: 'select',

  connectionSourceId: null,

  setDiagram: (diagram) => {
    set({
      diagram,
    });
  },

  setSelectedElement: (selectedElementId) => {
    set({
      selectedElementId,
      selectedConnectionId: null,
    });
  },

  setSelectedConnection: (selectedConnectionId) => {
    set({
      selectedConnectionId,
      selectedElementId: null,
    });
  },

  setActiveTool: (activeTool) => {
    set({
      activeTool,
      connectionSourceId: null,
      selectedConnectionId: null,
    });
  },

  setConnectionSourceId: (connectionSourceId) => {
    set({
      connectionSourceId,
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

  addIsa: (isa) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        isas: [...state.diagram.isas, isa],
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

  updateConnection: (id, updates) => {
    set((state) => ({
      diagram: updateConnections(state.diagram, id, updates),
    }));
  },
}));
