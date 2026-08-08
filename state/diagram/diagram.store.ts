import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/domain/diagram/lib/id';
import type { Diagram, DiagramActivityType, DiagramDocument } from '@/domain/diagram/models';
import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { createInitialDiagram } from './diagram.initial';
import {
  moveDiagramElements,
  removeDiagramElements,
  updateDiagram,
  updateDiagramConnection,
} from './diagram.mutations';
import type { DiagramState } from './diagram.types';

interface PersistedDocumentLibrary {
  diagram: Diagram;
  documents: DiagramDocument[];
  activeDocumentId: string;
}

function createDocument(name = 'Diagrama sin título'): DiagramDocument {
  return {
    id: createId('document'),
    diagram: createInitialDiagram(name),
  };
}

const initialDocument = createDocument();

function appendActivity(diagram: Diagram, type: DiagramActivityType, details: string): Diagram {
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

function withActiveDiagram(
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

function migratePersistedState(persistedState: unknown, version: number): PersistedDocumentLibrary {
  if (version < 2) {
    const previousState = persistedState as Partial<PersistedDocumentLibrary>;

    if (previousState.diagram) {
      const migratedDocument: DiagramDocument = {
        id: createId('document'),
        diagram: previousState.diagram,
      };

      return {
        diagram: previousState.diagram,
        documents: [migratedDocument],
        activeDocumentId: migratedDocument.id,
      };
    }
  }

  return persistedState as PersistedDocumentLibrary;
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      diagram: initialDocument.diagram,
      documents: [initialDocument],
      activeDocumentId: initialDocument.id,

      selectedElementId: null,
      selectedElementIds: [],
      connectionSourceId: null,
      activeTool: 'select',

      setDiagram: (diagram) => {
        set((state) => ({
          ...withActiveDiagram(state, diagram),
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
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
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
        }));
      },

      resetDiagram: () => {
        set((state) => {
          const diagram = createInitialDiagram(state.diagram.metadata.name);

          return {
            ...withActiveDiagram(state, diagram),
            selectedElementId: null,
            selectedElementIds: [],
            connectionSourceId: null,
            activeTool: 'select',
          };
        });
      },

      createDocument: (name) => {
        const document = createDocument(name);

        set((state) => ({
          diagram: document.diagram,
          documents: [...state.documents, document],
          activeDocumentId: document.id,
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
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
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
        });
      },

      duplicateDocument: (id) => {
        const source = get().documents.find((document) => document.id === id);

        if (!source) {
          return;
        }

        const createdAt = new Date().toISOString();
        const duplicatedName = `${source.diagram.metadata.name} copia`;

        const duplicatedDiagram = appendActivity(
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
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
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
          selectedElementId: null,
          selectedElementIds: [],
          connectionSourceId: null,
          activeTool: 'select',
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

          const diagram = appendActivity(
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

          return withActiveDiagram(state, diagram);
        });
      },

      setSelectedElement: (id) => {
        set({
          selectedElementId: id,
          selectedElementIds: id ? [id] : [],
        });
      },

      toggleSelectedElement: (id) => {
        set((state) => {
          const isSelected = state.selectedElementIds.includes(id);

          const selectedElementIds = isSelected
            ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedElementIds, id];

          return {
            selectedElementIds,
            selectedElementId: isSelected ? (selectedElementIds.at(-1) ?? null) : id,
          };
        });
      },

      selectAllElements: () => {
        set((state) => {
          const selectedElementIds = [
            ...state.diagram.entities.map((element) => element.id),
            ...state.diagram.relationships.map((element) => element.id),
            ...state.diagram.attributes.map((element) => element.id),
          ];

          return {
            selectedElementIds,
            selectedElementId: selectedElementIds.at(-1) ?? null,
          };
        });
      },

      clearSelection: () => {
        set({
          selectedElementId: null,
          selectedElementIds: [],
        });
      },

      setActiveTool: (activeTool) => {
        set({
          activeTool,
          connectionSourceId: null,
        });
      },

      addEntity: (entity) => {
        set((state) => {
          const diagram = appendActivity(
            {
              ...state.diagram,
              entities: [...state.diagram.entities, entity],
            },
            'element-created',
            `Se creó la entidad “${entity.name}”.`,
          );

          return withActiveDiagram(state, diagram);
        });
      },

      addRelationship: (relationship) => {
        set((state) => {
          const diagram = appendActivity(
            {
              ...state.diagram,
              relationships: [...state.diagram.relationships, relationship],
            },
            'element-created',
            `Se creó la relación “${relationship.name}”.`,
          );

          return withActiveDiagram(state, diagram);
        });
      },

      addAttribute: (attribute) => {
        set((state) => {
          const diagram = appendActivity(
            {
              ...state.diagram,
              attributes: [...state.diagram.attributes, attribute],
            },
            'element-created',
            `Se creó el atributo “${attribute.name}”.`,
          );

          return withActiveDiagram(state, diagram);
        });
      },

      addConnection: (connection) => {
        set((state) => {
          const diagram = appendActivity(
            {
              ...state.diagram,
              connections: [...state.diagram.connections, connection],
            },
            'connection-created',
            'Se creó una conexión.',
          );

          return withActiveDiagram(state, diagram);
        });
      },

      updateElement: (id, updates) => {
        set((state) => {
          const element = findDiagramElement(state.diagram, id);
          const updatedDiagram = updateDiagram(state.diagram, id, updates);

          const details =
            typeof updates.name === 'string' && element
              ? `Se renombró “${element.name}” a “${updates.name}”.`
              : 'Se actualizaron las propiedades de un elemento.';

          const diagram = appendActivity(
            updatedDiagram,
            typeof updates.name === 'string' ? 'element-renamed' : 'element-updated',
            details,
          );

          return withActiveDiagram(state, diagram);
        });
      },

      updateConnection: (id, updates) => {
        set((state) => {
          const diagram = appendActivity(
            updateDiagramConnection(state.diagram, id, updates),
            'connection-updated',
            'Se actualizó la cardinalidad de una conexión.',
          );

          return withActiveDiagram(state, diagram);
        });
      },

      moveElements: (updates) => {
        if (updates.length === 0) {
          return;
        }

        set((state) => withActiveDiagram(state, moveDiagramElements(state.diagram, updates)));
      },

      removeElement: (id) => {
        get().removeElements([id]);
      },

      removeElements: (ids) => {
        if (ids.length === 0) {
          return;
        }

        const removedIds = new Set(ids);

        set((state) => {
          const selectedElementIds = state.selectedElementIds.filter(
            (selectedId) => !removedIds.has(selectedId),
          );

          const diagram = appendActivity(
            removeDiagramElements(state.diagram, ids),
            'elements-removed',
            `Se eliminaron ${ids.length} elemento${ids.length === 1 ? '' : 's'}.`,
          );

          return {
            ...withActiveDiagram(state, diagram),
            selectedElementIds,
            selectedElementId: selectedElementIds.at(-1) ?? null,
            connectionSourceId:
              state.connectionSourceId && removedIds.has(state.connectionSourceId)
                ? null
                : state.connectionSourceId,
          };
        });
      },

      recordActivity: (type, details) => {
        set((state) => withActiveDiagram(state, appendActivity(state.diagram, type, details)));
      },

      handleConnectClick: (id) => {
        const { addConnection, connectionSourceId, diagram } = get();

        if (!connectionSourceId) {
          set({ connectionSourceId: id });
          return;
        }

        if (connectionSourceId === id) {
          set({ connectionSourceId: null });
          return;
        }

        const alreadyExists = diagram.connections.some(
          (connection) =>
            (connection.fromId === connectionSourceId && connection.toId === id) ||
            (connection.fromId === id && connection.toId === connectionSourceId),
        );

        if (!alreadyExists) {
          addConnection({
            id: createId('connection'),
            type: 'connection',
            fromId: connectionSourceId,
            toId: id,
            minimum: 'unspecified',
            maximum: 'unspecified',
          });
        }

        set({ connectionSourceId: null });
      },
    }),
    {
      name: 'er-designer-documents',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        diagram: state.diagram,
        documents: state.documents,
        activeDocumentId: state.activeDocumentId,
      }),
      migrate: migratePersistedState,
    },
  ),
);
