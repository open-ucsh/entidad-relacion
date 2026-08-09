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

  beginConnection: (sourceId) => {
    set({
      connectionSourceId: sourceId,
    });
  },

  cancelConnection: () => {
    set({
      connectionSourceId: null,
    });
  },

  connectElements: (fromId, toId) => {
    if (fromId === toId) {
      return;
    }

    const { addConnection, diagram } = get();

    const alreadyExists = diagram.connections.some(
      (connection) =>
        (connection.fromId === fromId && connection.toId === toId) ||
        (connection.fromId === toId && connection.toId === fromId),
    );

    if (alreadyExists) {
      return;
    }

    addConnection({
      id: createId('connection'),
      type: 'connection',
      fromId,
      toId,
      minimum: 'unspecified',
      maximum: 'unspecified',
    });
  },

  handleConnectClick: (id) => {
    const { beginConnection, cancelConnection, connectElements, connectionSourceId } = get();

    if (!connectionSourceId) {
      beginConnection(id);
      return;
    }

    if (connectionSourceId === id) {
      cancelConnection();
      return;
    }

    connectElements(connectionSourceId, id);
    cancelConnection();
  },
});
