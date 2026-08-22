import type { Diagram } from '@/domain/diagram/models';

import type { DiagramAppearance } from './diagram-appearance';
import type { DiagramDocumentHistory, DiagramDocumentSnapshot } from './diagram-document';

const MAX_HISTORY_SIZE = 50;

export function createDocumentHistory(): DiagramDocumentHistory {
  return {
    undoStack: [],
    redoStack: [],
  };
}

export function createDocumentSnapshot(
  diagram: Diagram,
  appearance: DiagramAppearance,
): DiagramDocumentSnapshot {
  return {
    diagram,
    appearance: {
      elementColors: { ...appearance.elementColors },
    },
  };
}

export function pushUndoSnapshot(
  history: DiagramDocumentHistory,
  snapshot: DiagramDocumentSnapshot,
): DiagramDocumentHistory {
  return {
    undoStack: [...history.undoStack, snapshot].slice(-MAX_HISTORY_SIZE),
    redoStack: [],
  };
}
