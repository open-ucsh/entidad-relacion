import { createId } from '@/domain/diagram/lib/id';
import type { DiagramDocument } from '@/domain/diagram/models';

import {
  appendDiagramActivity,
  createDiagramDocument,
  createEditorResetState,
  replaceActiveDiagram,
} from '../diagram.helpers';
import type { DiagramStoreSlice, DocumentSlice } from '../diagram.types';

export const createDocumentSlice: DiagramStoreSlice<DocumentSlice> = (set, get) => {
  const initialDocument = createDiagramDocument();

  return {
    diagram: initialDocument.diagram,
    documents: [initialDocument],
    activeDocumentId: initialDocument.id,

    setDiagram: (diagram) => {
      set((state) => ({
        ...replaceActiveDiagram(state, diagram),
        ...createEditorResetState(),
      }));
    },

    importDiagram: (diagram) => {
      const importedAt = new Date().toISOString();

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
            details: 'Se importó un proyecto JSON en ER Designer.',
          },
        ],
      };

      const importedDocument: DiagramDocument = {
        id: createId('document'),
        diagram: importedDiagram,
      };

      set((state) => ({
        diagram: importedDiagram,
        documents: [...state.documents, importedDocument],
        activeDocumentId: importedDocument.id,
        ...createEditorResetState(),
      }));
    },

    resetDiagram: () => {
      set((state) => {
        const diagram = createDiagramDocument(state.diagram.metadata.name).diagram;

        return {
          ...replaceActiveDiagram(state, diagram),
          ...createEditorResetState(),
        };
      });
    },

    createDocument: (name) => {
      const document = createDiagramDocument(name);

      set((state) => ({
        diagram: document.diagram,
        documents: [...state.documents, document],
        activeDocumentId: document.id,
        ...createEditorResetState(),
      }));
    },

    openDocument: (id) => {
      const document = get().documents.find((item) => item.id === id);

      if (!document) {
        return;
      }

      set({
        diagram: document.diagram,
        activeDocumentId: document.id,
        ...createEditorResetState(),
      });
    },

    duplicateDocument: (id) => {
      const source = get().documents.find((document) => document.id === id);

      if (!source) {
        return;
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
      };

      set((state) => ({
        diagram: duplicatedDocument.diagram,
        documents: [...state.documents, duplicatedDocument],
        activeDocumentId: duplicatedDocument.id,
        ...createEditorResetState(),
      }));
    },

    deleteDocument: (id) => {
      const documents = get().documents;

      if (documents.length <= 1) {
        return;
      }

      const remainingDocuments = documents.filter((document) => document.id !== id);

      if (id !== get().activeDocumentId) {
        set({ documents: remainingDocuments });
        return;
      }

      const nextDocument = remainingDocuments[0];

      if (!nextDocument) {
        return;
      }

      set({
        documents: remainingDocuments,
        activeDocumentId: nextDocument.id,
        diagram: nextDocument.diagram,
        ...createEditorResetState(),
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
