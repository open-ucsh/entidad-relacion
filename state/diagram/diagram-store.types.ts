import type { StateCreator } from 'zustand';

import type {
  Attribute,
  Connection,
  Diagram,
  DiagramActivityType,
  DiagramElement,
  Entity,
  Isa,
  Point,
  Relationship,
  Tool,
} from '@/domain/diagram/models';

import type { DiagramAppearance, ElementColor } from './diagram-appearance';
import type { DiagramDocument, DiagramDocumentSnapshot } from './diagram-document';

export interface ElementPositionUpdate {
  id: string;
  position: Point;
}

export interface CanvasFocusRequest {
  targetId: string;
  requestId: number;
}

export interface DocumentSlice {
  diagram: Diagram;
  appearance: DiagramAppearance;
  documents: DiagramDocument[];
  activeDocumentId: string;

  setDiagram: (diagram: Diagram) => void;
  importDiagram: (diagram: Diagram, appearance?: DiagramAppearance) => void;

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
  canvasFocusRequest: CanvasFocusRequest | null;

  setSelectedElement: (id: string | null) => void;
  toggleSelectedElement: (id: string) => void;
  selectAllElements: () => void;
  clearSelection: () => void;
  setSelectedElements: (ids: string[]) => void;
  focusDiagramTarget: (id: string) => void;

  setActiveTool: (tool: Tool) => void;
}

export type ElementAlignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export type ElementDistribution = 'horizontal' | 'vertical';

export interface ElementSlice {
  addEntity: (entity: Entity) => void;
  addRelationship: (relationship: Relationship) => void;
  addAttribute: (attribute: Attribute) => void;
  addIsa: (isa: Isa) => void;
  createConnectedAttribute: (parentId: string) => void;

  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  setElementColor: (id: string, color: ElementColor) => void;
  setSelectedElementsColor: (color: ElementColor) => void;

  duplicateSelectedElements: () => void;
  alignSelectedElements: (alignment: ElementAlignment) => void;
  distributeSelectedElements: (distribution: ElementDistribution) => void;

  moveElements: (updates: ElementPositionUpdate[]) => void;

  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;
}

export interface ConnectionSlice {
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;

  beginConnection: (sourceId: string) => void;
  cancelConnection: () => void;
  connectElements: (fromId: string, toId: string) => void;

  handleConnectClick: (id: string) => void;
}

export interface HistorySlice {
  pendingHistorySnapshot: DiagramDocumentSnapshot | null;

  undo: () => void;
  redo: () => void;

  beginHistoryTransaction: () => void;
  completeHistoryTransaction: (
    type: DiagramActivityType,
    details: string,
    options?: {
      recordActivity?: boolean;
    },
  ) => void;
  cancelHistoryTransaction: () => void;
}

export type DiagramState = DocumentSlice &
  SelectionSlice &
  ElementSlice &
  ConnectionSlice &
  HistorySlice;

export type DiagramStoreSlice<T> = StateCreator<DiagramState, [], [], T>;
