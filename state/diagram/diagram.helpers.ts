import { createId } from '@/domain/diagram/lib/id';
import type { Diagram, DiagramActivityType, DiagramDocument } from '@/domain/diagram/models';

import { createInitialDiagram } from './diagram.initial';
import type { DiagramState } from './diagram.types';

export function createDiagramDocument(name = 'Diagrama sin título'): DiagramDocument {
  return {
    id: createId('document'),
    diagram: createInitialDiagram(name),
  };
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
    ],
  };
}

export function replaceActiveDiagram(
  state: Pick<DiagramState, 'activeDocumentId' | 'documents'>,
  diagram: Diagram,
) {
  return {
    diagram,
    documents: state.documents.map((document) =>
      document.id === state.activeDocumentId
        ? {
            ...document,
            diagram,
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
