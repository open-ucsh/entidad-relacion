import { appendDiagramActivity } from '../diagram-activity';
import { getActiveDocument, replaceActiveDiagram } from '../diagram-documents';

import { createDocumentSnapshot, pushUndoSnapshot } from '../document-history';

import type { DiagramStoreSlice, HistorySlice } from '../diagram-store.types';

export const createHistorySlice: DiagramStoreSlice<HistorySlice> = (set) => ({
  pendingHistorySnapshot: null,

  beginHistoryTransaction: () => {
    set((state) => {
      if (state.pendingHistorySnapshot) {
        return state;
      }

      return {
        pendingHistorySnapshot: createDocumentSnapshot(state.diagram, state.appearance),
      };
    });
  },

  completeHistoryTransaction: (type, details) => {
    set((state) => {
      const snapshot = state.pendingHistorySnapshot;
      const activeDocument = getActiveDocument(state);

      if (!snapshot || !activeDocument) {
        return {
          pendingHistorySnapshot: null,
        };
      }

      const diagram = appendDiagramActivity(state.diagram, type, details);

      return {
        ...replaceActiveDiagram(state, diagram, {
          history: pushUndoSnapshot(activeDocument.history, snapshot),
        }),
        pendingHistorySnapshot: null,
      };
    });
  },

  cancelHistoryTransaction: () => {
    set({
      pendingHistorySnapshot: null,
    });
  },

  undo: () => {
    set((state) => {
      const activeDocument = getActiveDocument(state);
      const previousSnapshot = activeDocument?.history.undoStack.at(-1);

      if (!activeDocument || !previousSnapshot) {
        return state;
      }

      return {
        ...replaceActiveDiagram(state, previousSnapshot.diagram, {
          appearance: previousSnapshot.appearance,
          history: {
            undoStack: activeDocument.history.undoStack.slice(0, -1),
            redoStack: [
              createDocumentSnapshot(state.diagram, state.appearance),
              ...activeDocument.history.redoStack,
            ],
          },
        }),
        pendingHistorySnapshot: null,
        selectedElementId: null,
        selectedElementIds: [],
        connectionSourceId: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      const activeDocument = getActiveDocument(state);
      const nextSnapshot = activeDocument?.history.redoStack.at(0);

      if (!activeDocument || !nextSnapshot) {
        return state;
      }

      return {
        ...replaceActiveDiagram(state, nextSnapshot.diagram, {
          appearance: nextSnapshot.appearance,
          history: {
            undoStack: [
              ...activeDocument.history.undoStack,
              createDocumentSnapshot(state.diagram, state.appearance),
            ],
            redoStack: activeDocument.history.redoStack.slice(1),
          },
        }),
        pendingHistorySnapshot: null,
        selectedElementId: null,
        selectedElementIds: [],
        connectionSourceId: null,
      };
    });
  },
});
