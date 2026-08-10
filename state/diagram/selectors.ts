import type { Diagram, DiagramDocument } from '@/domain/diagram/models';

import type { DiagramState } from './types';

export function selectActiveDiagram(state: DiagramState): Diagram {
  return state.diagram;
}

export function selectActiveDocument(state: DiagramState): DiagramDocument | undefined {
  return state.documents.find((document) => document.id === state.activeDocumentId);
}

export function selectCanUndo(state: DiagramState): boolean {
  return (selectActiveDocument(state)?.history.undoStack.length ?? 0) > 0;
}

export function selectCanRedo(state: DiagramState): boolean {
  return (selectActiveDocument(state)?.history.redoStack.length ?? 0) > 0;
}
