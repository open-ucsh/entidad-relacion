import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/domain/diagram/lib/id';
import type { Diagram, DiagramDocument } from '@/domain/diagram/models';

import { createDocumentHistory } from './diagram.helpers';
import { createActivitySlice } from './slices/activity.slice';
import { createConnectionSlice } from './slices/connection.slice';
import { createDocumentSlice } from './slices/document.slice';
import { createElementSlice } from './slices/element.slice';
import { createHistorySlice } from './slices/history.slice';
import { createSelectionSlice } from './slices/selection.slice';
import type { DiagramState } from './diagram.types';

interface PersistedDocumentLibrary {
  diagram: Diagram;
  documents: DiagramDocument[];
  activeDocumentId: string;
}

function migratePersistedState(persistedState: unknown, version: number): PersistedDocumentLibrary {
  if (version < 2) {
    const previousState = persistedState as Partial<PersistedDocumentLibrary>;

    if (previousState.diagram) {
      const migratedDocument: DiagramDocument = {
        id: createId('document'),
        diagram: previousState.diagram,
        history: createDocumentHistory(),
      };

      return {
        diagram: previousState.diagram,
        documents: [migratedDocument],
        activeDocumentId: migratedDocument.id,
      };
    }
  }

  if (version < 3) {
    const previousState = persistedState as PersistedDocumentLibrary;

    return {
      ...previousState,
      documents: previousState.documents.map((document) => {
        const legacyDocument = document as Partial<DiagramDocument>;

        return {
          ...document,
          history: legacyDocument.history ?? createDocumentHistory(),
        };
      }),
    };
  }

  return persistedState as PersistedDocumentLibrary;
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (...store) => ({
      ...createDocumentSlice(...store),
      ...createSelectionSlice(...store),
      ...createElementSlice(...store),
      ...createConnectionSlice(...store),
      ...createActivitySlice(...store),
      ...createHistorySlice(...store),
    }),
    {
      name: 'er-designer-documents',
      version: 3,
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
