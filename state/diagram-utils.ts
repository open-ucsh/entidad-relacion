import type { Attribute, Connection, Diagram, Entity, Isa, Relationship } from '@/domain/models';

type DiagramElement = Entity | Relationship | Attribute | Isa;

export function updateCollection<T extends { id: string }>(
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

    isas: updateCollection(diagram.isas, id, updates as Partial<Isa>),
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

export function removeDiagramConnection(diagram: Diagram, id: string): Diagram {
  return {
    ...diagram,
    connections: diagram.connections.filter((connection) => connection.id !== id),
  };
}

export function removeDiagramElement(diagram: Diagram, id: string): Diagram {
  return {
    ...diagram,

    entities: diagram.entities.filter((item) => item.id !== id),

    relationships: diagram.relationships.filter((item) => item.id !== id),

    attributes: diagram.attributes.filter((item) => item.id !== id),

    isas: diagram.isas.filter((item) => item.id !== id),

    connections: diagram.connections.filter(
      (connection) => connection.sourceId !== id && connection.targetId !== id,
    ),
  };
}
