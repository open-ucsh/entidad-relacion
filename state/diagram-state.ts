import type { Attribute, Connection, Diagram, Entity, Relationship, Tool } from '@/domain/models';
import type { ExportFormat } from '@/components/canvas/hooks/useCanvasExport';

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
    updates: Partial<Entity | Relationship | Attribute | Connection>,
  ) => void;

  removeElement: (id: string) => void;

  handleConnectClick: (id: string) => void;

  clearSelection: () => void;
  exportHandler: ((format: ExportFormat) => void) | null;
  setExportHandler: (handler: ((format: ExportFormat) => void) | null) => void;
}

export const initialDiagram: Diagram = {
  entities: [],
  relationships: [],
  attributes: [],
  connections: [],
};
