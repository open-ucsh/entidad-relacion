import { create } from 'zustand';

export type LogicalSelection =
  | {
      type: 'table';
      tableId: string;
      columnId?: string;
    }
  | {
      type: 'relation';
      sourceTableId: string;
      foreignKeyId: string;
    }
  | null;

interface LogicalSelectionState {
  selection: LogicalSelection;
  setSelection: (selection: LogicalSelection) => void;
  clearSelection: () => void;
}

export const useLogicalSelectionStore = create<LogicalSelectionState>((set) => ({
  selection: null,

  setSelection: (selection) => {
    set({ selection });
  },

  clearSelection: () => {
    set({ selection: null });
  },
}));
