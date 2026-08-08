import type { SelectionSlice, DiagramStoreSlice } from '../diagram.types';

export const createSelectionSlice: DiagramStoreSlice<SelectionSlice> = (set) => ({
  selectedElementId: null,
  selectedElementIds: [],
  connectionSourceId: null,
  activeTool: 'select',

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
});
