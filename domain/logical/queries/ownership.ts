import type { Attribute, Connection, Diagram, Entity, Relationship } from '@/domain/diagram/models';

export interface RelationshipParticipant {
  entity: Entity;
  connection: Connection;
}

function getOwnedAttributes(diagram: Diagram, ownerId: string): Attribute[] {
  const attributeIds = new Set<string>();

  for (const connection of diagram.connections) {
    if (connection.fromId === ownerId) {
      attributeIds.add(connection.toId);
    }

    if (connection.toId === ownerId) {
      attributeIds.add(connection.fromId);
    }
  }

  return diagram.attributes.filter((attribute) => attributeIds.has(attribute.id));
}

export function getEntityAttributes(diagram: Diagram, entityId: string): Attribute[] {
  return getOwnedAttributes(diagram, entityId);
}

export function getRelationshipAttributes(diagram: Diagram, relationshipId: string): Attribute[] {
  return getOwnedAttributes(diagram, relationshipId);
}

export function getRelationshipParticipants(
  diagram: Diagram,
  relationshipId: string,
): RelationshipParticipant[] {
  const entityById = new Map(diagram.entities.map((entity) => [entity.id, entity]));
  const participants: RelationshipParticipant[] = [];

  for (const connection of diagram.connections) {
    let entityId: string | null = null;

    if (connection.fromId === relationshipId) {
      entityId = connection.toId;
    } else if (connection.toId === relationshipId) {
      entityId = connection.fromId;
    }

    if (!entityId) {
      continue;
    }

    const entity = entityById.get(entityId);

    if (!entity) {
      continue;
    }

    participants.push({
      entity,
      connection,
    });
  }

  return participants;
}

export function getEntityRelationships(diagram: Diagram, entityId: string): Relationship[] {
  const relationshipIds = new Set<string>();

  for (const connection of diagram.connections) {
    if (connection.fromId === entityId) {
      relationshipIds.add(connection.toId);
    }

    if (connection.toId === entityId) {
      relationshipIds.add(connection.fromId);
    }
  }

  return diagram.relationships.filter((relationship) => relationshipIds.has(relationship.id));
}
