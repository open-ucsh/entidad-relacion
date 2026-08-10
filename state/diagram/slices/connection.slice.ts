import { createId } from '@/domain/diagram/lib/id';
import { canConnectElementsById } from '@/domain/diagram/validation/connections';

import { appendDiagramActivity, replaceActiveDiagram } from '../helpers';
import { updateDiagramConnection } from '../mutations';
import type { ConnectionSlice, DiagramStoreSlice } from '../types';

function connectionAlreadyExists(
  diagram: {
    connections: Array<{
      fromId: string;
      toId: string;
    }>;
  },
  fromId: string,
  toId: string,
): boolean {
  return diagram.connections.some(
    (connection) =>
      (connection.fromId === fromId && connection.toId === toId) ||
      (connection.fromId === toId && connection.toId === fromId),
  );
}

export const createConnectionSlice: DiagramStoreSlice<ConnectionSlice> = (set, get) => ({
  addConnection: (connection) => {
    const { diagram } = get();

    if (
      !canConnectElementsById(diagram, connection.fromId, connection.toId) ||
      connectionAlreadyExists(diagram, connection.fromId, connection.toId)
    ) {
      return;
    }

    set((state) => {
      const nextDiagram = appendDiagramActivity(
        {
          ...state.diagram,
          connections: [...state.diagram.connections, connection],
        },
        'connection-created',
        'Se creó una conexión.',
      );

      return replaceActiveDiagram(state, nextDiagram);
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
    const { addConnection, diagram } = get();

    if (
      !canConnectElementsById(diagram, fromId, toId) ||
      connectionAlreadyExists(diagram, fromId, toId)
    ) {
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
