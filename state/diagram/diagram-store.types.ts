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

import type {
  LogicalColumn,
  LogicalRelationCardinality,
  LogicalTable,
  LogicalTablePosition,
  LogicalWorkspace,
} from '@/domain/logical/models';

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
  logicalWorkspace: LogicalWorkspace;
  documents: DiagramDocument[];
  activeDocumentId: string;

  setDiagram: (diagram: Diagram) => void;
  importDiagram: (
    diagram: Diagram,
    appearance?: DiagramAppearance,
    logicalWorkspace?: LogicalWorkspace,
  ) => void;

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

  insertRelationshipIntoConnection: (relationshipId: string, connectionId: string) => boolean;

  addRelationshipToConnection: (relationship: Relationship, connectionId: string) => boolean;
}

export interface LogicalSlice {
  generateLogicalModel: () => void;
  createManualLogicalModel: () => void;

  addLogicalTable: (name?: string) => void;
  removeLogicalTable: (tableId: string) => void;
  renameLogicalTable: (tableId: string, name: string) => void;
  moveLogicalTable: (tableId: string, position: LogicalTablePosition) => void;

  addLogicalColumn: (tableId: string, name?: string) => void;
  updateLogicalColumn: (tableId: string, columnId: string, updates: Partial<LogicalColumn>) => void;
  removeLogicalColumn: (tableId: string, columnId: string) => void;

  addLogicalForeignKey: (sourceTableId: string, referencedTableId: string) => void;
  removeLogicalForeignKey: (sourceTableId: string, foreignKeyId: string) => void;

  updateLogicalForeignKeyCardinality: (
    sourceTableId: string,
    foreignKeyId: string,
    side: 'source' | 'referenced',
    cardinality: LogicalRelationCardinality,
  ) => void;

  replaceLogicalTable: (tableId: string, table: LogicalTable) => void;
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
  LogicalSlice &
  HistorySlice;

export type DiagramStoreSlice<T> = StateCreator<DiagramState, [], [], T>;
