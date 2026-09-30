import { createId } from '@/domain/diagram/lib/id';
import { createLogicalWorkspace } from '@/domain/logical/factories';

import type { DiagramDocument } from '../diagram-document';
import { appendDiagramActivity } from '../diagram-activity';
import { createDiagramAppearance } from '../diagram-appearance';
import { createDiagramDocument, replaceActiveDiagram } from '../diagram-documents';
import { createDocumentHistory } from '../document-history';
import type { DiagramStoreSlice, DocumentSlice } from '../diagram-store.types';
import {
  discardEmptyDocuments,
  hasDocumentCapacity,
  hasDocumentContent,
} from '../document-library';
import { createEditorResetState } from '../editor-reset-state';

export const createDocumentSlice: DiagramStoreSlice<DocumentSlice> = (set, get) => {
  const initialDocument = createDiagramDocument();

  return {
    diagram: initialDocument.diagram,
    appearance: initialDocument.appearance,
    logicalWorkspace: initialDocument.logicalWorkspace,
    documents: [initialDocument],
    activeDocumentId: initialDocument.id,

    setDiagram: (diagram) => {
      set((state) => ({
        ...replaceActiveDiagram(state, diagram),
        ...createEditorResetState(),
      }));
    },

    importDiagram: (
      diagram,
      appearance = createDiagramAppearance(),
      logicalWorkspace = createLogicalWorkspace(),
    ) => {
      set((state) => {
        const documents = discardEmptyDocuments(state.documents);

        if (!hasDocumentCapacity(documents)) {
          return state;
        }

        const importedAt = new Date().toISOString();

        const importedAppearance = {
          elementColors: {
            ...appearance.elementColors,
          },
        };

        const importedDiagram = {
          ...diagram,
          metadata: {
            ...diagram.metadata,
            name: diagram.metadata.name || 'Diagrama importado',
            origin: 'imported' as const,
            importedAt,
            updatedAt: importedAt,
          },
          activity: [
            ...diagram.activity,
            {
              id: createId('activity'),
              type: 'diagram-imported' as const,
              occurredAt: importedAt,
              details: 'Se importó un proyecto JSON en la web de MER UCSH.',
            },
          ],
        };

        const importedLogicalWorkspace = structuredClone(logicalWorkspace);

        const importedDocument: DiagramDocument = {
          id: createId('document'),
          diagram: importedDiagram,
          appearance: importedAppearance,
          logicalWorkspace: importedLogicalWorkspace,
          history: createDocumentHistory(),
        };

        return {
          diagram: importedDiagram,
          appearance: importedAppearance,
          logicalWorkspace: importedDocument.logicalWorkspace,
          documents: [...documents, importedDocument],
          activeDocumentId: importedDocument.id,
          ...createEditorResetState(),
        };
      });
    },

    createDocument: (name) => {
      set((state) => {
        const documents = discardEmptyDocuments(state.documents);

        if (!hasDocumentCapacity(documents)) {
          return state;
        }

        const document = createDiagramDocument(name);

        return {
          diagram: document.diagram,
          appearance: document.appearance,
          logicalWorkspace: document.logicalWorkspace,
          documents: [...documents, document],
          activeDocumentId: document.id,
          ...createEditorResetState(),
        };
      });
    },

    openDocument: (id) => {
      const document = get().documents.find((item) => item.id === id);

      if (!document) {
        return;
      }

      set((state) => ({
        diagram: document.diagram,
        appearance: document.appearance,
        logicalWorkspace: document.logicalWorkspace,
        documents: discardEmptyDocuments(state.documents, id),
        activeDocumentId: document.id,
        ...createEditorResetState(),
      }));
    },

    duplicateDocument: (id) => {
      const source = get().documents.find((document) => document.id === id);

      if (!source || !hasDocumentContent(source)) {
        return;
      }

      set((state) => {
        const documents = discardEmptyDocuments(state.documents);

        if (!hasDocumentCapacity(documents)) {
          return state;
        }

        const createdAt = new Date().toISOString();

        const duplicatedName = `${source.diagram.metadata.name} copia`;

        const duplicatedDiagram = appendDiagramActivity(
          {
            ...source.diagram,
            metadata: {
              ...source.diagram.metadata,
              name: duplicatedName,
              createdAt,
              updatedAt: createdAt,
              origin: 'created-in-app',
              importedAt: null,
            },
          },
          'diagram-created',
          `Se creó una copia de “${source.diagram.metadata.name}”.`,
        );

        const duplicatedDocument: DiagramDocument = {
          id: createId('document'),
          diagram: duplicatedDiagram,
          appearance: {
            elementColors: {
              ...source.appearance.elementColors,
            },
          },
          logicalWorkspace: structuredClone(source.logicalWorkspace),
          history: createDocumentHistory(),
        };

        return {
          diagram: duplicatedDocument.diagram,
          appearance: duplicatedDocument.appearance,
          logicalWorkspace: duplicatedDocument.logicalWorkspace,
          documents: [...documents, duplicatedDocument],
          activeDocumentId: duplicatedDocument.id,
          ...createEditorResetState(),
        };
      });
    },

    deleteDocument: (id) => {
      set((state) => {
        const documents = discardEmptyDocuments(state.documents, id);

        const remainingDocuments = documents.filter((document) => document.id !== id);

        if (remainingDocuments.length === 0) {
          const document = createDiagramDocument();

          return {
            diagram: document.diagram,
            appearance: document.appearance,
            logicalWorkspace: document.logicalWorkspace,
            documents: [document],
            activeDocumentId: document.id,
            ...createEditorResetState(),
          };
        }

        if (id !== state.activeDocumentId) {
          return {
            documents: remainingDocuments,
          };
        }

        const nextDocument = remainingDocuments[0];

        if (!nextDocument) {
          return state;
        }

        return {
          documents: remainingDocuments,
          activeDocumentId: nextDocument.id,
          diagram: nextDocument.diagram,
          appearance: nextDocument.appearance,
          logicalWorkspace: nextDocument.logicalWorkspace,
          ...createEditorResetState(),
        };
      });
    },

    setDiagramName: (name) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return;
      }

      set((state) => {
        if (state.diagram.metadata.name === trimmedName) {
          return state;
        }

        const diagram = appendDiagramActivity(
          {
            ...state.diagram,
            metadata: {
              ...state.diagram.metadata,
              name: trimmedName,
            },
          },
          'diagram-renamed',
          `Se renombró el proyecto a “${trimmedName}”.`,
        );

        return replaceActiveDiagram(state, diagram);
      });
    },
  };
};
