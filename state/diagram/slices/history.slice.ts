import { getActiveDocument, replaceActiveDiagram } from '../diagram-documents';
import { pushUndoSnapshot } from '../document-history';
import { appendDiagramActivity } from '../diagram-activity';
import type { DiagramStoreSlice, HistorySlice } from '../diagram-store.types';

export const createHistorySlice: DiagramStoreSlice<HistorySlice> = (set) => ({
  pendingHistorySnapshot: null,

  beginHistoryTransaction: () => {
    set((state) => {
      if (state.pendingHistorySnapshot) {
        return state;
      }

      return {
        pendingHistorySnapshot: state.diagram,
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
      const previousDiagram = activeDocument?.history.undoStack.at(-1);

      if (!activeDocument || !previousDiagram) {
        return state;
      }

      return {
        ...replaceActiveDiagram(state, previousDiagram, {
          history: {
            undoStack: activeDocument.history.undoStack.slice(0, -1),
            redoStack: [state.diagram, ...activeDocument.history.redoStack],
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
      const nextDiagram = activeDocument?.history.redoStack.at(0);

      if (!activeDocument || !nextDiagram) {
        return state;
      }

      return {
        ...replaceActiveDiagram(state, nextDiagram, {
          history: {
            undoStack: [...activeDocument.history.undoStack, state.diagram],
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
