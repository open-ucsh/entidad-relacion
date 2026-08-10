import { createId } from '@/domain/diagram/lib/id';
import type {
  Diagram,
  DiagramActivityType,
  DiagramDocument,
  DiagramDocumentHistory,
} from '@/domain/diagram/models';

import { createInitialDiagram } from './initial';
import type { DiagramState } from './types';

const MAX_ACTIVITY_SIZE = 200;
const MAX_HISTORY_SIZE = 50;

interface ReplaceDiagramOptions {
  history?: DiagramDocumentHistory | undefined;
  recordHistory?: boolean | undefined;
}

export function createDocumentHistory(): DiagramDocumentHistory {
  return {
    undoStack: [],
    redoStack: [],
  };
}

export function createDiagramDocument(name = 'Diagrama sin título'): DiagramDocument {
  return {
    id: createId('document'),
    diagram: createInitialDiagram(name),
    history: createDocumentHistory(),
  };
}

export function getActiveDocument(
  state: Pick<DiagramState, 'activeDocumentId' | 'documents'>,
): DiagramDocument | undefined {
  return state.documents.find((document) => document.id === state.activeDocumentId);
}

export function appendDiagramActivity(
  diagram: Diagram,
  type: DiagramActivityType,
  details: string,
): Diagram {
  const occurredAt = new Date().toISOString();

  return {
    ...diagram,
    metadata: {
      ...diagram.metadata,
      updatedAt: occurredAt,
    },
    activity: [
      ...diagram.activity,
      {
        id: createId('activity'),
        type,
        occurredAt,
        details,
      },
    ].slice(-MAX_ACTIVITY_SIZE),
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

export function replaceActiveDiagram(
  state: Pick<DiagramState, 'activeDocumentId' | 'diagram' | 'documents'>,
  diagram: Diagram,
  options: ReplaceDiagramOptions = {},
) {
  const activeDocument = getActiveDocument(state);

  if (!activeDocument) {
    return {
      diagram,
      documents: state.documents,
    };
  }

  const history =
    options.history ??
    (options.recordHistory === false
      ? activeDocument.history
      : pushUndoSnapshot(activeDocument.history, state.diagram));

  return {
    diagram,
    documents: state.documents.map((document) =>
      document.id === state.activeDocumentId
        ? {
            ...document,
            diagram,
            history,
          }
        : document,
    ),
  };
}

export function createEditorResetState() {
  return {
    selectedElementId: null,
    selectedElementIds: [],
    connectionSourceId: null,
    activeTool: 'select' as const,
  };
}
