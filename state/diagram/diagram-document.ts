import type { Diagram } from '@/domain/diagram/models';
import type { LogicalWorkspace } from '@/domain/logical/models';

import type { DiagramAppearance } from './diagram-appearance';

export interface DiagramDocumentSnapshot {
  diagram: Diagram;
  appearance: DiagramAppearance;
  logicalWorkspace: LogicalWorkspace;
}

export interface DiagramDocumentHistory {
  undoStack: DiagramDocumentSnapshot[];
  redoStack: DiagramDocumentSnapshot[];
}

export interface DiagramDocument {
  id: string;
  diagram: Diagram;
  appearance: DiagramAppearance;
  logicalWorkspace: LogicalWorkspace;
  history: DiagramDocumentHistory;
}
