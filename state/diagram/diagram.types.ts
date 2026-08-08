import type {
  Attribute,
  Connection,
  Diagram,
  DiagramActivityType,
  DiagramDocument,
  Entity,
  Point,
  Relationship,
  Tool,
} from '@/domain/diagram/models';

export interface ElementPositionUpdate {
  id: string;
  position: Point;
}

export interface DiagramState {
  diagram: Diagram;
  documents: DiagramDocument[];
  activeDocumentId: string;

  selectedElementId: string | null;
  selectedElementIds: string[];
  connectionSourceId: string | null;
  activeTool: Tool;

  setDiagram: (diagram: Diagram) => void;
  importDiagram: (diagram: Diagram) => void;
  resetDiagram: () => void;

  createDocument: (name?: string) => void;
  openDocument: (id: string) => void;
  duplicateDocument: (id: string) => void;
  deleteDocument: (id: string) => void;

  setDiagramName: (name: string) => void;

  setSelectedElement: (id: string | null) => void;
  toggleSelectedElement: (id: string) => void;
  selectAllElements: () => void;
  clearSelection: () => void;

  setActiveTool: (tool: Tool) => void;

  addEntity: (entity: Entity) => void;
  addRelationship: (relationship: Relationship) => void;
  addAttribute: (attribute: Attribute) => void;
  addConnection: (connection: Connection) => void;

  updateElement: (id: string, updates: Partial<Entity | Relationship | Attribute>) => void;

  updateConnection: (id: string, updates: Partial<Connection>) => void;

  moveElements: (updates: ElementPositionUpdate[]) => void;

  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;

  recordActivity: (type: DiagramActivityType, details: string) => void;

  handleConnectClick: (id: string) => void;
}
