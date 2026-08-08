import { appendDiagramActivity, replaceActiveDiagram } from '../diagram.helpers';
import type { ActivitySlice, DiagramStoreSlice } from '../diagram.types';

export const createActivitySlice: DiagramStoreSlice<ActivitySlice> = (set) => ({
  recordActivity: (type, details) => {
    set((state) =>
      replaceActiveDiagram(state, appendDiagramActivity(state.diagram, type, details)),
    );
  },
});
