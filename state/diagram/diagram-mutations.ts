import { createId } from '@/domain/diagram/lib/id';

import type {
  Attribute,
  Connection,
  Diagram,
  DiagramElement,
  Entity,
  Isa,
  Relationship,
} from '@/domain/diagram/models';

import type { ElementPositionUpdate } from './diagram-store.types';

export interface DuplicateDiagramElementsResult {
  diagram: Diagram;
  duplicatedIds: string[];
  duplicatedIdBySourceId: Record<string, string>;
  duplicatedConnectionCount: number;
}

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

function duplicateCollection<
  T extends { id: string; name: string; position: DiagramElement['position'] },
>(
  items: T[],
  selectedIds: Set<string>,
  prefix: 'entity' | 'relationship' | 'attribute' | 'isa',
  offset: number,
): {
  elements: T[];
  duplicatedIdBySourceId: Record<string, string>;
} {
  const duplicatedIdBySourceId: Record<string, string> = {};

  const elements = items
    .filter((item) => selectedIds.has(item.id))
    .map((item) => {
      const duplicatedId = createId(prefix);

      duplicatedIdBySourceId[item.id] = duplicatedId;

      return {
        ...item,
        id: duplicatedId,
        name: `${item.name} copia`,
        position: {
          x: item.position.x + offset,
          y: item.position.y + offset,
        },
      };
    });

  return {
    elements,
    duplicatedIdBySourceId,
  };
}

function duplicateInternalConnections(
  connections: Connection[],
  duplicatedIdBySourceId: Record<string, string>,
): Connection[] {
  return connections.flatMap((connection) => {
    const fromId = duplicatedIdBySourceId[connection.fromId];
    const toId = duplicatedIdBySourceId[connection.toId];

    if (!fromId || !toId) {
      return [];
    }

    return [
      {
        ...connection,
        id: createId('connection'),
        fromId,
        toId,
      },
    ];
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
    isas: updateCollection(diagram.isas, id, updates as Partial<Isa>),
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
    isas: moveCollection(diagram.isas, positions),
  };
}

export function duplicateDiagramElements(
  diagram: Diagram,
  ids: string[],
  offset = 32,
): DuplicateDiagramElementsResult {
  const selectedIds = new Set(ids);
  const duplicatedEntities = duplicateCollection(diagram.entities, selectedIds, 'entity', offset);
  const duplicatedRelationships = duplicateCollection(
    diagram.relationships,
    selectedIds,
    'relationship',
    offset,
  );
  const duplicatedAttributes = duplicateCollection(
    diagram.attributes,
    selectedIds,
    'attribute',
    offset,
  );
  const duplicatedIsas = duplicateCollection(diagram.isas, selectedIds, 'isa', offset);

  const duplicatedIds = [
    ...duplicatedEntities.elements.map((entity) => entity.id),
    ...duplicatedRelationships.elements.map((relationship) => relationship.id),
    ...duplicatedAttributes.elements.map((attribute) => attribute.id),
    ...duplicatedIsas.elements.map((isa) => isa.id),
  ];

  const duplicatedIdBySourceId = {
    ...duplicatedEntities.duplicatedIdBySourceId,
    ...duplicatedRelationships.duplicatedIdBySourceId,
    ...duplicatedAttributes.duplicatedIdBySourceId,
    ...duplicatedIsas.duplicatedIdBySourceId,
  };

  const duplicatedConnections = duplicateInternalConnections(
    diagram.connections,
    duplicatedIdBySourceId,
  );

  return {
    diagram: {
      ...diagram,
      entities: [...diagram.entities, ...duplicatedEntities.elements],
      relationships: [...diagram.relationships, ...duplicatedRelationships.elements],
      attributes: [...diagram.attributes, ...duplicatedAttributes.elements],
      isas: [...diagram.isas, ...duplicatedIsas.elements],
      connections: [...diagram.connections, ...duplicatedConnections],
    },
    duplicatedIds,
    duplicatedIdBySourceId,
    duplicatedConnectionCount: duplicatedConnections.length,
  };
}

export function removeDiagramElements(diagram: Diagram, ids: string[]): Diagram {
  const removedIds = new Set(ids);

  return {
    ...diagram,
    entities: diagram.entities.filter((item) => !removedIds.has(item.id)),
    relationships: diagram.relationships.filter((item) => !removedIds.has(item.id)),
    attributes: diagram.attributes.filter((item) => !removedIds.has(item.id)),
    isas: diagram.isas.filter((item) => !removedIds.has(item.id)),
    connections: diagram.connections.filter(
      (item) =>
        !removedIds.has(item.id) && !removedIds.has(item.fromId) && !removedIds.has(item.toId),
    ),
  };
}
