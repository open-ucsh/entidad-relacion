import { createId } from '@/domain/diagram/lib/id';

import type { Diagram, DiagramDocument, DiagramDocumentHistory } from '@/domain/diagram/models';

import { createDocumentHistory, pushUndoSnapshot } from './document-history';
import { createInitialDiagram } from '@/domain/diagram/factories/diagram';

import type { DiagramState } from './diagram-store.types';

interface ReplaceDiagramOptions {
  history?: DiagramDocumentHistory;
  recordHistory?: boolean;
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
