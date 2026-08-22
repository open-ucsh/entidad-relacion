import type { Diagram, DiagramDocumentHistory } from '@/domain/diagram/models';

const MAX_HISTORY_SIZE = 50;

export function createDocumentHistory(): DiagramDocumentHistory {
  return {
    undoStack: [],
    redoStack: [],
  };
}

export function pushUndoSnapshot(
  history: DiagramDocumentHistory,
  diagram: Diagram,
): DiagramDocumentHistory {
  return {
    undoStack: [...history.undoStack, diagram].slice(-MAX_HISTORY_SIZE),
    redoStack: [],
  };
}
