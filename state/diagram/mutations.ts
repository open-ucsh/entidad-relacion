import type { Attribute, Diagram, Entity, Relationship } from '@/domain/diagram/models';
import type { Connection } from '@/domain/diagram/models';

import type { ElementPositionUpdate } from './types';

type DiagramElement = Entity | Relationship | Attribute;

function updateCollection<T extends { id: string }>(
  items: T[],
  id: string,
  updates: Partial<T>,
): T[] {
  return items.map((item) =>
    item.id === id
      ? {
          ...item,
          ...updates,
        }
      : item,
  );
}

function moveCollection<T extends { id: string; position: unknown }>(
  items: T[],
  positions: Map<string, ElementPositionUpdate['position']>,
): T[] {
  return items.map((item) => {
    const position = positions.get(item.id);

    return position
      ? {
          ...item,
          position,
        }
      : item;
  });
}

export function updateDiagram(
  diagram: Diagram,
  id: string,
  updates: Partial<DiagramElement>,
): Diagram {
  return {
    ...diagram,
    entities: updateCollection(diagram.entities, id, updates as Partial<Entity>),
    relationships: updateCollection(diagram.relationships, id, updates as Partial<Relationship>),
    attributes: updateCollection(diagram.attributes, id, updates as Partial<Attribute>),
  };
}

export function updateDiagramConnection(
  diagram: Diagram,
  id: string,
  updates: Partial<Connection>,
): Diagram {
  return {
    ...diagram,
    connections: updateCollection(diagram.connections, id, updates),
  };
}

export function moveDiagramElements(diagram: Diagram, updates: ElementPositionUpdate[]): Diagram {
  const positions = new Map(updates.map((update) => [update.id, update.position]));

  return {
    ...diagram,
    entities: moveCollection(diagram.entities, positions),
    relationships: moveCollection(diagram.relationships, positions),
    attributes: moveCollection(diagram.attributes, positions),
  };
}

export function removeDiagramElements(diagram: Diagram, ids: string[]): Diagram {
  const removedIds = new Set(ids);

  return {
    ...diagram,
    entities: diagram.entities.filter((item) => !removedIds.has(item.id)),
    relationships: diagram.relationships.filter((item) => !removedIds.has(item.id)),
    attributes: diagram.attributes.filter((item) => !removedIds.has(item.id)),
    connections: diagram.connections.filter(
      (item) =>
        !removedIds.has(item.id) && !removedIds.has(item.fromId) && !removedIds.has(item.toId),
    ),
  };
}
