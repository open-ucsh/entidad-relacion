import type { Attribute, Connection, Diagram, Entity, Relationship, Tool } from '@/domain/models';

export interface DiagramState {
  diagram: Diagram;
  selectedElementId: string | null;
  connectionSourceId: string | null;
  activeTool: Tool;

  setDiagram: (diagram: Diagram) => void;
  setSelectedElement: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;

  addEntity: (entity: Entity) => void;
  addRelationship: (relationship: Relationship) => void;
  addAttribute: (attribute: Attribute) => void;
  addConnection: (connection: Connection) => void;

  updateElement: (
    id: string,
    updates: Partial<Entity> | Partial<Relationship> | Partial<Attribute> | Partial<Connection>,
  ) => void;

  removeElement: (id: string) => void;

  /**
   * Maneja el flujo de dos clics para crear una conexión:
   * primer clic define el origen, segundo clic el destino.
   * Un segundo clic sobre el mismo elemento cancela la selección de origen.
   */
  handleConnectClick: (id: string) => void;

  clearSelection: () => void;
}

/** Crea un diagrama vacío. Usar como fábrica, no como referencia compartida. */
export const createInitialDiagram = (): Diagram => ({
  entities: [],
  relationships: [],
  attributes: [],
  connections: [],
});
