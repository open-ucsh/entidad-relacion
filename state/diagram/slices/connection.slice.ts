import { createConnection } from '@/domain/diagram/factories/connection';
import { findDiagramElement } from '@/domain/diagram/queries/elements';
import type { Relationship } from '@/domain/diagram/models';

import { insertRelationshipIntoDiagramConnection } from '../diagram-mutations';

import {
  canCreateConnection,
  getIsaConnectionRole,
  hasValidIsaConnectionRole,
} from '@/domain/diagram/validation/connections';

import { appendDiagramActivity } from '../diagram-activity';
import { getConnectionUpdateDetails } from '../diagram-activity-details';
import { replaceActiveDiagram } from '../diagram-documents';
import { updateDiagramConnection } from '../diagram-mutations';

import type { ConnectionSlice, DiagramStoreSlice } from '../diagram-store.types';

function getRelationshipInsertionResult(
  diagram: Parameters<typeof insertRelationshipIntoDiagramConnection>[0],
  relationship: Relationship,
  connectionId: string,
) {
  return insertRelationshipIntoDiagramConnection(diagram, relationship, connectionId);
}

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
        { id: connection.id, kind: 'connection' },
      );

      return replaceActiveDiagram(state, nextDiagram);
    });
  },

  updateConnection: (id, updates) => {
    set((state) => {
      const connection = state.diagram.connections.find((item) => item.id === id);

      if (!connection) {
        return state;
      }

      const hasChanges =
        (updates.minimum !== undefined && updates.minimum !== connection.minimum) ||
        (updates.maximum !== undefined && updates.maximum !== connection.maximum) ||
        (updates.isaRole !== undefined && updates.isaRole !== connection.isaRole);

      if (!hasChanges) {
        return state;
      }

      const diagram = appendDiagramActivity(
        updateDiagramConnection(state.diagram, id, updates),
        'connection-updated',
        getConnectionUpdateDetails(connection, updates),
        { id: connection.id, kind: 'connection' },
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

  insertRelationshipIntoConnection: (relationshipId, connectionId) => {
    const relationship = get().diagram.relationships.find((item) => item.id === relationshipId);

    if (!relationship) {
      return false;
    }

    let inserted = false;

    set((state) => {
      const result = getRelationshipInsertionResult(state.diagram, relationship, connectionId);

      if (!result) {
        return state;
      }

      inserted = true;

      return replaceActiveDiagram(state, result.diagram, {
        recordHistory: false,
      });
    });

    return inserted;
  },

  addRelationshipToConnection: (relationship, connectionId) => {
    if (findDiagramElement(get().diagram, relationship.id)) {
      return false;
    }

    let inserted = false;

    set((state) => {
      const result = getRelationshipInsertionResult(state.diagram, relationship, connectionId);

      if (!result) {
        return state;
      }

      inserted = true;

      const diagram = appendDiagramActivity(
        result.diagram,
        'element-created',
        `Se creó la relación “${relationship.name}” y se insertó en una conexión.`,
        {
          id: relationship.id,
          kind: 'element',
        },
      );

      return {
        ...replaceActiveDiagram(state, diagram),
        selectedElementId: relationship.id,
        selectedElementIds: [relationship.id],
      };
    });

    return inserted;
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
