import type {
  Attribute,
  Connection,
  Diagram,
  Entity,
  Isa,
  Relationship,
  Tool,
} from '@/domain/models';

export interface DiagramState {
  diagram: Diagram;

  selectedElementId: string | null;
  selectedConnectionId: string | null;

  activeTool: Tool;

  connectionSourceId: string | null;

  setDiagram: (diagram: Diagram) => void;

  setSelectedElement: (id: string | null) => void;
  setSelectedConnection: (id: string | null) => void;

  setActiveTool: (tool: Tool) => void;

  setConnectionSourceId: (id: string | null) => void;

  addEntity: (entity: Entity) => void;

  addRelationship: (relationship: Relationship) => void;

  addAttribute: (attribute: Attribute) => void;

  addIsa: (isa: Isa) => void;

  addConnection: (connection: Connection) => void;

  updateElement: (id: string, updates: Partial<Entity | Relationship | Attribute | Isa>) => void;

  updateConnection: (id: string, updates: Partial<Connection>) => void;
}

export const initialDiagram: Diagram = {
  entities: [],
  relationships: [],
  attributes: [],
  isas: [],
  connections: [],
};
