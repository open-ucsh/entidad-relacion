import { createConnection } from '@/domain/diagram/factories/connection';

import {
  canCreateConnection,
  getIsaConnectionRole,
  hasValidIsaConnectionRole,
} from '@/domain/diagram/validation/connections';

import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { appendDiagramActivity, replaceActiveDiagram } from '../helpers';
import { updateDiagramConnection } from '../mutations';

import type { ConnectionSlice, DiagramStoreSlice } from '../types';

export const createConnectionSlice: DiagramStoreSlice<ConnectionSlice> = (set, get) => ({
  addConnection: (connection) => {
    const { diagram } = get();

    if (
      !canCreateConnection(diagram, connection.fromId, connection.toId) ||
      !hasValidIsaConnectionRole(diagram, connection)
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
        connection.isaRole === 'supertype'
          ? 'Se conectó el supertipo a la jerarquía ISA.'
          : connection.isaRole === 'subtype'
            ? 'Se conectó un subtipo a la jerarquía ISA.'
            : 'Se creó una conexión.',
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

    if (!canCreateConnection(diagram, fromId, toId)) {
      return;
    }

    const source = findDiagramElement(diagram, fromId);
    const target = findDiagramElement(diagram, toId);

    if (!source || !target) {
      return;
    }

    addConnection(createConnection(fromId, toId, getIsaConnectionRole(source, target)));
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
