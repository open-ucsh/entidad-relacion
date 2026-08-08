import { createId } from '@/domain/diagram/lib/id';

import { appendDiagramActivity, replaceActiveDiagram } from '../diagram.helpers';
import { updateDiagramConnection } from '../diagram.mutations';
import type { ConnectionSlice, DiagramStoreSlice } from '../diagram.types';

export const createConnectionSlice: DiagramStoreSlice<ConnectionSlice> = (set, get) => ({
  addConnection: (connection) => {
    set((state) => {
      const diagram = appendDiagramActivity(
        {
          ...state.diagram,
          connections: [...state.diagram.connections, connection],
        },
        'connection-created',
        'Se creó una conexión.',
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  updateConnection: (id, updates) => {
    set((state) => {
      const diagram = appendDiagramActivity(
        updateDiagramConnection(state.diagram, id, updates),
        'connection-updated',
        'Se actualizó la cardinalidad de una conexión.',
      );

      return replaceActiveDiagram(state, diagram);
    });
  },

  handleConnectClick: (id) => {
    const { addConnection, connectionSourceId, diagram } = get();

    if (!connectionSourceId) {
      set({ connectionSourceId: id });
      return;
    }

    if (connectionSourceId === id) {
      set({ connectionSourceId: null });
      return;
    }

    const alreadyExists = diagram.connections.some(
      (connection) =>
        (connection.fromId === connectionSourceId && connection.toId === id) ||
        (connection.fromId === id && connection.toId === connectionSourceId),
    );

    if (!alreadyExists) {
      addConnection({
        id: createId('connection'),
        type: 'connection',
        fromId: connectionSourceId,
        toId: id,
        minimum: 'unspecified',
        maximum: 'unspecified',
      });
    }

    set({ connectionSourceId: null });
  },
});
