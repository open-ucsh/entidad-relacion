import { createInitialDiagram } from '@/domain/diagram/factories/diagram';
import { createId } from '@/domain/diagram/lib/id';
import type { Diagram } from '@/domain/diagram/models';
import { createLogicalWorkspace } from '@/domain/logical/factories';
import type { LogicalWorkspace } from '@/domain/logical/models';

import { createDiagramAppearance, type DiagramAppearance } from './diagram-appearance';
import type { DiagramDocument, DiagramDocumentHistory } from './diagram-document';
import {
  createDocumentHistory,
  createDocumentSnapshot,
  pushUndoSnapshot,
} from './document-history';
import type { DiagramState } from './diagram-store.types';

interface ReplaceDiagramOptions {
  appearance?: DiagramAppearance;
  logicalWorkspace?: LogicalWorkspace;
  history?: DiagramDocumentHistory;
  recordHistory?: boolean;
}

export function createDiagramDocument(name = 'Diagrama sin título'): DiagramDocument {
  return {
    id: createId('document'),
    diagram: createInitialDiagram(name),
    appearance: createDiagramAppearance(),
    logicalWorkspace: createLogicalWorkspace(),
    history: createDocumentHistory(),
  };
}

export function getActiveDocument(
  state: Pick<DiagramState, 'activeDocumentId' | 'documents'>,
): DiagramDocument | undefined {
  return state.documents.find((document) => document.id === state.activeDocumentId);
}

export function replaceActiveDiagram(
  state: Pick<
    DiagramState,
    'activeDocumentId' | 'appearance' | 'diagram' | 'documents' | 'logicalWorkspace'
  >,
  diagram: Diagram,
  options: ReplaceDiagramOptions = {},
) {
  const activeDocument = getActiveDocument(state);
  const appearance = options.appearance ?? state.appearance;
  const logicalWorkspace = options.logicalWorkspace ?? state.logicalWorkspace;

  if (!activeDocument) {
    return {
      diagram,
      appearance,
      logicalWorkspace,
      documents: state.documents,
    };
  }

  const history =
    options.history ??
    (options.recordHistory === false
      ? activeDocument.history
      : pushUndoSnapshot(
          activeDocument.history,
          createDocumentSnapshot(state.diagram, state.appearance, state.logicalWorkspace),
        ));

  return {
    diagram,
    appearance,
    logicalWorkspace,
    documents: state.documents.map((document) =>
      document.id === state.activeDocumentId
        ? {
            ...document,
            diagram,
            appearance,
            logicalWorkspace,
            history,
          }
        : document,
    ),
  };
}
