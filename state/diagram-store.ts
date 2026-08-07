import { create } from 'zustand';

import type { Attribute, Connection, Diagram, Entity, Isa, Relationship } from '@/domain/models';

interface DiagramState {
  diagram: Diagram;

  selectedElementId: string | null;

  setDiagram(diagram: Diagram): void;

  setSelectedElement(id: string | null): void;

  addEntity(entity: Entity): void;

  addRelationship(relationship: Relationship): void;

  addAttribute(attribute: Attribute): void;

  addIsa(isa: Isa): void;

  addConnection(connection: Connection): void;
}

const initialDiagram: Diagram = {
  entities: [],
  relationships: [],
  attributes: [],
  isas: [],
  connections: [],
};

export const useDiagramStore = create<DiagramState>((set) => ({
  diagram: initialDiagram,

  selectedElementId: null,

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
}));
