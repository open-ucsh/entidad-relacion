import { create } from 'zustand';
import type { Attribute, Connection, Diagram, Entity, Isa, Relationship } from '@/domain/models';
import type { Tool } from '@/domain/models';

interface DiagramState {
  diagram: Diagram;
  selectedElementId: string | null;

  setDiagram: (diagram: Diagram) => void;
  setSelectedElement: (id: string | null) => void;

  addEntity: (entity: Entity) => void;
  addRelationship: (relationship: Relationship) => void;
  addAttribute: (attribute: Attribute) => void;
  addIsa: (isa: Isa) => void;
  addConnection: (connection: Connection) => void;

  updateElementPosition: (id: string, x: number, y: number) => void;

  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  connectionSourceId: string | null;

  setConnectionSourceId: (id: string | null) => void;
}

const initialDiagram: Diagram = {
  entities: [],
  relationships: [],
  attributes: [],
  isas: [],
  connections: [],
};

export const useDiagramStore = create<DiagramState>((set) => ({
  connectionSourceId: null,

  setConnectionSourceId: (connectionSourceId) => {
    set({ connectionSourceId });
  },
  diagram: initialDiagram,

  selectedElementId: null,
  activeTool: 'select',

  setActiveTool: (activeTool) => {
    set({
      activeTool,
      connectionSourceId: null,
    });
  },

  setDiagram: (diagram) => {
    set({
      diagram,
    });
  },

  setSelectedElement: (selectedElementId) => {
    set({
      selectedElementId,
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

  updateElementPosition: (id, x, y) => {
    set((state) => {
      const update = <T extends { id: string; position: { x: number; y: number } }>(items: T[]) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                position: { x, y },
              }
            : item,
        );

      return {
        diagram: {
          ...state.diagram,
          entities: update(state.diagram.entities),
          relationships: update(state.diagram.relationships),
          attributes: update(state.diagram.attributes),
          isas: update(state.diagram.isas),
        },
      };
    });
  },
}));
