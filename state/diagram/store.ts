import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/domain/diagram/lib/id';
import type { Diagram, DiagramDocument } from '@/domain/diagram/models';

import { createDocumentHistory } from './helpers';
import { createConnectionSlice } from './slices/connection.slice';
import { createDocumentSlice } from './slices/document.slice';
import { createElementSlice } from './slices/element.slice';
import { createHistorySlice } from './slices/history.slice';
import { createSelectionSlice } from './slices/selection.slice';
import type { DiagramState } from './types';

interface PersistedDocumentLibrary {
  diagram: Diagram;
  documents: DiagramDocument[];
  activeDocumentId: string;
}

function clearDocumentHistory(document: DiagramDocument): DiagramDocument {
  return {
    ...document,
    history: createDocumentHistory(),
  };
}

function migratePersistedState(persistedState: unknown, version: number): PersistedDocumentLibrary {
  const previousState = persistedState as Partial<PersistedDocumentLibrary>;

  let migratedState: PersistedDocumentLibrary;

  if (version < 2 && previousState.diagram) {
    const migratedDocument: DiagramDocument = {
      id: createId('document'),
      diagram: previousState.diagram,
      history: createDocumentHistory(),
    };

    migratedState = {
      diagram: previousState.diagram,
      documents: [migratedDocument],
      activeDocumentId: migratedDocument.id,
    };
  } else {
    migratedState = previousState as PersistedDocumentLibrary;
  }

  if (version < 3) {
    migratedState = {
      ...migratedState,
      documents: migratedState.documents.map((document) => {
        const legacyDocument = document as Partial<DiagramDocument>;

        return {
          ...document,
          history: legacyDocument.history ?? createDocumentHistory(),
        };
      }),
    };
  }

  if (version < 4) {
    migratedState = {
      ...migratedState,
      documents: migratedState.documents.map(clearDocumentHistory),
    };
  }

  return migratedState;
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (...store) => ({
      ...createDocumentSlice(...store),
      ...createSelectionSlice(...store),
      ...createElementSlice(...store),
      ...createConnectionSlice(...store),
      ...createHistorySlice(...store),
    }),
    {
      name: 'er-designer-documents',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        diagram: state.diagram,
        documents: state.documents.map(clearDocumentHistory),
        activeDocumentId: state.activeDocumentId,
      }),
      migrate: migratePersistedState,
    },
  ),
);
