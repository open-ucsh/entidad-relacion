import type { Attribute, Connection, Diagram, Entity, Relationship } from '@/domain/models';

type DiagramElement = Entity | Relationship | Attribute | Connection;

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
    connections: updateCollection(diagram.connections, id, updates as Partial<Connection>),
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
