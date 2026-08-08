import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/domain/diagram/lib/id';
import type { Diagram, DiagramDocument } from '@/domain/diagram/models';

import { createActivitySlice } from './slices/activity.slice';
import { createConnectionSlice } from './slices/connection.slice';
import { createDocumentSlice } from './slices/document.slice';
import { createElementSlice } from './slices/element.slice';
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
    (...store) => ({
      ...createDocumentSlice(...store),
      ...createSelectionSlice(...store),
      ...createElementSlice(...store),
      ...createConnectionSlice(...store),
      ...createActivitySlice(...store),
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
