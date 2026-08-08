import type { StateCreator } from 'zustand';

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

export interface DocumentSlice {
  diagram: Diagram;
  documents: DiagramDocument[];
  activeDocumentId: string;

  setDiagram: (diagram: Diagram) => void;
  importDiagram: (diagram: Diagram) => void;
  resetDiagram: () => void;

  createDocument: (name?: string) => void;
  openDocument: (id: string) => void;
  duplicateDocument: (id: string) => void;
  deleteDocument: (id: string) => void;

  setDiagramName: (name: string) => void;
}

export interface SelectionSlice {
  selectedElementId: string | null;
  selectedElementIds: string[];
  connectionSourceId: string | null;
  activeTool: Tool;

  setSelectedElement: (id: string | null) => void;
  toggleSelectedElement: (id: string) => void;
  selectAllElements: () => void;
  clearSelection: () => void;
  setSelectedElements: (ids: string[]) => void;

  setActiveTool: (tool: Tool) => void;
}

export interface ElementSlice {
  addEntity: (entity: Entity) => void;
  addRelationship: (relationship: Relationship) => void;
  addAttribute: (attribute: Attribute) => void;

  updateElement: (id: string, updates: Partial<Entity | Relationship | Attribute>) => void;
  duplicateSelectedElements: () => void;
  moveElements: (updates: ElementPositionUpdate[]) => void;

  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;
}

export interface ConnectionSlice {
  addConnection: (connection: Connection) => void;

  updateConnection: (id: string, updates: Partial<Connection>) => void;

  handleConnectClick: (id: string) => void;
}

export interface ActivitySlice {
  recordActivity: (type: DiagramActivityType, details: string) => void;
}

export interface HistorySlice {
  pendingHistorySnapshot: Diagram | null;

  undo: () => void;
  redo: () => void;

  beginHistoryTransaction: () => void;
  completeHistoryTransaction: (type: DiagramActivityType, details: string) => void;
  cancelHistoryTransaction: () => void;
}

export type DiagramState = DocumentSlice &
  SelectionSlice &
  ElementSlice &
  ConnectionSlice &
  ActivitySlice &
  HistorySlice;

export type DiagramStoreSlice<T> = StateCreator<DiagramState, [], [], T>;
