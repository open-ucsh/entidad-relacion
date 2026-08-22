import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/domain/diagram/lib/id';

import type { Diagram } from '@/domain/diagram/models';

import {
  createDiagramAppearance,
  type DiagramAppearance,
  type ElementColor,
} from './diagram-appearance';

import type { DiagramDocument } from './diagram-document';

import { createDocumentHistory } from './document-history';
import type { DiagramState } from './diagram-store.types';

import { createConnectionSlice } from './slices/connection.slice';
import { createDocumentSlice } from './slices/document.slice';
import { createElementSlice } from './slices/element.slice';
import { createHistorySlice } from './slices/history.slice';
import { createSelectionSlice } from './slices/selection.slice';

const VALID_ELEMENT_COLORS = new Set<ElementColor>([
  'neutral',
  'blue',
  'emerald',
  'violet',
  'orange',
  'rose',
]);

interface PersistedDocumentLibrary {
  diagram: Diagram;
  appearance: DiagramAppearance;
  documents: DiagramDocument[];
  activeDocumentId: string;
}

function clearDocumentHistory(document: DiagramDocument): DiagramDocument {
  return {
    ...document,
    history: createDocumentHistory(),
  };
}

function migrateLegacyDiagram(diagram: Diagram): {
  diagram: Diagram;
  appearance: DiagramAppearance;
} {
  const elementColors: Record<string, ElementColor> = {};

  const collectColors = (elements: Array<{ id: string; color?: unknown }>) => {
    elements.forEach((element) => {
      if (
        typeof element.color === 'string' &&
        VALID_ELEMENT_COLORS.has(element.color as ElementColor) &&
        element.color !== 'neutral'
      ) {
        elementColors[element.id] = element.color as ElementColor;
      }
    });
  };

  collectColors(diagram.entities);
  collectColors(diagram.relationships);
  collectColors(diagram.attributes);
  collectColors(diagram.isas);

  const removeLegacyColors = <T extends object>(elements: T[]): T[] =>
    elements.map(
      (element) =>
        Object.fromEntries(Object.entries(element).filter(([key]) => key !== 'color')) as T,
    );

  return {
    diagram: {
      ...diagram,
      entities: removeLegacyColors(diagram.entities),
      relationships: removeLegacyColors(diagram.relationships),
      attributes: removeLegacyColors(diagram.attributes),
      isas: removeLegacyColors(diagram.isas),
    },
    appearance: {
      elementColors,
    },
  };
}

function migratePersistedState(persistedState: unknown, version: number): PersistedDocumentLibrary {
  const previousState = persistedState as Partial<PersistedDocumentLibrary>;

  let migratedState: PersistedDocumentLibrary;

  if (version < 2 && previousState.diagram) {
    const migratedDiagram = migrateLegacyDiagram(previousState.diagram);

    const migratedDocument: DiagramDocument = {
      id: createId('document'),
      diagram: migratedDiagram.diagram,
      appearance: migratedDiagram.appearance,
      history: createDocumentHistory(),
    };

    migratedState = {
      diagram: migratedDocument.diagram,
      appearance: migratedDocument.appearance,
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

  if (version < 5) {
    const documents = migratedState.documents.map((document) => {
      const migratedDiagram = migrateLegacyDiagram(document.diagram);

      return {
        ...document,
        diagram: migratedDiagram.diagram,
        appearance: migratedDiagram.appearance,
        history: createDocumentHistory(),
      };
    });

    const activeDocument =
      documents.find((document) => document.id === migratedState.activeDocumentId) ?? documents[0];

    migratedState = {
      ...migratedState,
      diagram: activeDocument?.diagram ?? migratedState.diagram,
      appearance: activeDocument?.appearance ?? createDiagramAppearance(),
      documents,
      activeDocumentId: activeDocument?.id ?? migratedState.activeDocumentId,
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
      version: 5,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        diagram: state.diagram,
        appearance: state.appearance,
        documents: state.documents.map(clearDocumentHistory),
        activeDocumentId: state.activeDocumentId,
      }),
      migrate: migratePersistedState,
    },
  ),
);
