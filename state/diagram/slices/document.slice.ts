import { createId } from '@/domain/diagram/lib/id';

import type { DiagramDocument } from '../diagram-document';

import { appendDiagramActivity } from '../diagram-activity';
import { createDiagramAppearance } from '../diagram-appearance';
import { createDiagramDocument, replaceActiveDiagram } from '../diagram-documents';
import { createEditorResetState } from '../editor-reset-state';
import { createDocumentHistory } from '../document-history';

import type { DiagramStoreSlice, DocumentSlice } from '../diagram-store.types';

export const createDocumentSlice: DiagramStoreSlice<DocumentSlice> = (set, get) => {
  const initialDocument = createDiagramDocument();

  return {
    diagram: initialDocument.diagram,
    appearance: initialDocument.appearance,
    documents: [initialDocument],
    activeDocumentId: initialDocument.id,

    setDiagram: (diagram) => {
      set((state) => ({
        ...replaceActiveDiagram(state, diagram),
        ...createEditorResetState(),
      }));
    },

    importDiagram: (diagram, appearance = createDiagramAppearance()) => {
      const importedAt = new Date().toISOString();

      const importedAppearance = {
        elementColors: { ...appearance.elementColors },
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
            details: 'Se importó un proyecto JSON en ER Designer.',
          },
        ],
      };

      const importedDocument: DiagramDocument = {
        id: createId('document'),
        diagram: importedDiagram,
        appearance: importedAppearance,
        history: createDocumentHistory(),
      };

      set((state) => ({
        diagram: importedDiagram,
        appearance: importedAppearance,
        documents: [...state.documents, importedDocument],
        activeDocumentId: importedDocument.id,
        ...createEditorResetState(),
      }));
    },

    resetDiagram: () => {
      set((state) => {
        const document = createDiagramDocument(state.diagram.metadata.name);

        return {
          ...replaceActiveDiagram(state, document.diagram, {
            appearance: document.appearance,
          }),
          ...createEditorResetState(),
        };
      });
    },

    createDocument: (name) => {
      const document = createDiagramDocument(name);

      set((state) => ({
        diagram: document.diagram,
        appearance: document.appearance,
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
        appearance: document.appearance,
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
        appearance: {
          elementColors: { ...source.appearance.elementColors },
        },
        history: createDocumentHistory(),
      };

      set((state) => ({
        diagram: duplicatedDocument.diagram,
        appearance: duplicatedDocument.appearance,
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
        appearance: nextDocument.appearance,
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
