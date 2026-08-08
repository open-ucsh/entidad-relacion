import type { Diagram } from './diagram';

export interface DiagramDocumentHistory {
  undoStack: Diagram[];
  redoStack: Diagram[];
}

export interface DiagramDocument {
  id: string;
  diagram: Diagram;
  history: DiagramDocumentHistory;
}
