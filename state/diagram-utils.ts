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

export function removeDiagramElement(diagram: Diagram, id: string): Diagram {
  return {
    ...diagram,
    entities: diagram.entities.filter((item) => item.id !== id),
    relationships: diagram.relationships.filter((item) => item.id !== id),
    attributes: diagram.attributes.filter((item) => item.id !== id),
    connections: diagram.connections.filter(
      (item) => item.id !== id && item.fromId !== id && item.toId !== id,
    ),
  };
}
