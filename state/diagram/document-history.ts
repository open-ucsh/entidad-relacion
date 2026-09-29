import type { Diagram } from '@/domain/diagram/models';
import type { LogicalWorkspace } from '@/domain/logical/models';

import type { DiagramAppearance } from './diagram-appearance';
import type { DiagramDocumentHistory, DiagramDocumentSnapshot } from './diagram-document';

const MAX_HISTORY_SIZE = 50;

function cloneLogicalWorkspace(workspace: LogicalWorkspace): LogicalWorkspace {
  return structuredClone(workspace);
}

export function createDocumentHistory(): DiagramDocumentHistory {
  return {
    undoStack: [],
    redoStack: [],
  };
}

export function createDocumentSnapshot(
  diagram: Diagram,
  appearance: DiagramAppearance,
  logicalWorkspace: LogicalWorkspace,
): DiagramDocumentSnapshot {
  return {
    diagram,
    appearance: {
      elementColors: { ...appearance.elementColors },
    },
    logicalWorkspace: cloneLogicalWorkspace(logicalWorkspace),
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
