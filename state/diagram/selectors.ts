import type { Diagram } from '@/domain/diagram/models';
import type { DiagramDocument } from './diagram-document';

import type { DiagramState } from './diagram-store.types';

export function selectActiveDiagram(state: DiagramState): Diagram {
  return state.diagram;
}

function selectActiveDocument(state: DiagramState): DiagramDocument | undefined {
  return state.documents.find((document) => document.id === state.activeDocumentId);
}

export function selectCanUndo(state: DiagramState): boolean {
  return (selectActiveDocument(state)?.history.undoStack.length ?? 0) > 0;
}

export function selectCanRedo(state: DiagramState): boolean {
  return (selectActiveDocument(state)?.history.redoStack.length ?? 0) > 0;
}
