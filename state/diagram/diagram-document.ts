import type { Diagram } from '@/domain/diagram/models';

import type { DiagramAppearance } from './diagram-appearance';

export interface DiagramDocumentSnapshot {
  diagram: Diagram;
  appearance: DiagramAppearance;
}

export interface DiagramDocumentHistory {
  undoStack: DiagramDocumentSnapshot[];
  redoStack: DiagramDocumentSnapshot[];
}

export interface DiagramDocument {
  id: string;
  diagram: Diagram;
  appearance: DiagramAppearance;
  history: DiagramDocumentHistory;
}
