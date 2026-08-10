import { appendDiagramActivity, replaceActiveDiagram } from '../helpers';
import type { ActivitySlice, DiagramStoreSlice } from '../types';

export const createActivitySlice: DiagramStoreSlice<ActivitySlice> = (set) => ({
  recordActivity: (type, details) => {
    set((state) =>
      replaceActiveDiagram(state, appendDiagramActivity(state.diagram, type, details)),
    );
  },
});
