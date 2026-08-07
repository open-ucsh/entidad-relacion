import type { Attribute, Connection, Diagram, Entity, Isa, Relationship } from '@/domain/models';

type DiagramElement = Entity | Relationship | Attribute | Isa;

export function updateCollection<T extends { id: string }>(
  items: T[],
  id: string,
  updates: Partial<DiagramElement>,
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
    entities: updateCollection(diagram.entities, id, updates),
    relationships: updateCollection(diagram.relationships, id, updates),
    attributes: updateCollection(diagram.attributes, id, updates),
    isas: updateCollection(diagram.isas, id, updates),
  };
}

export function updateConnections(
  diagram: Diagram,
  id: string,
  updates: Partial<Connection>,
): Diagram {
  return {
    ...diagram,
    connections: diagram.connections.map((connection) =>
      connection.id === id
        ? {
            ...connection,
            ...updates,
          }
        : connection,
    ),
  };
}
