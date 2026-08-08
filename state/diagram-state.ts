import type { Attribute, Connection, Diagram, Entity, Relationship, Tool } from '@/domain/models';

export interface DiagramState {
  diagram: Diagram;
  selectedElementId: string | null;
  selectedElementIds: string[];
  connectionSourceId: string | null;
  activeTool: Tool;

  setDiagram: (diagram: Diagram) => void;
  setSelectedElement: (id: string | null) => void;
  toggleSelectedElement: (id: string) => void;
  selectAllElements: () => void;
  setActiveTool: (tool: Tool) => void;

  addEntity: (entity: Entity) => void;
  addRelationship: (relationship: Relationship) => void;
  addAttribute: (attribute: Attribute) => void;
  addConnection: (connection: Connection) => void;

  updateElement: (
    id: string,
    updates: Partial<Entity | Relationship | Attribute | Connection>,
  ) => void;

  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;
  handleConnectClick: (id: string) => void;
  clearSelection: () => void;
}

export const createInitialDiagram = (): Diagram => ({
  entities: [],
  relationships: [],
  attributes: [],
  connections: [],
});
