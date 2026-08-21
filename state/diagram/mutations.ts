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

import type { ElementPositionUpdate } from './types';

export interface DuplicateDiagramElementsResult {
  diagram: Diagram;
  duplicatedIds: string[];
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
): T[] {
  return items
    .filter((item) => selectedIds.has(item.id))
    .map((item) => ({
      ...item,
      id: createId(prefix),
      name: `${item.name} copia`,
      position: {
        x: item.position.x + offset,
        y: item.position.y + offset,
      },
    }));
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

  const entities = duplicateCollection(diagram.entities, selectedIds, 'entity', offset);
  const relationships = duplicateCollection(
    diagram.relationships,
    selectedIds,
    'relationship',
    offset,
  );
  const attributes = duplicateCollection(diagram.attributes, selectedIds, 'attribute', offset);
  const isas = duplicateCollection(diagram.isas, selectedIds, 'isa', offset);

  const duplicatedIds = [
    ...entities.map((entity) => entity.id),
    ...relationships.map((relationship) => relationship.id),
    ...attributes.map((attribute) => attribute.id),
    ...isas.map((isa) => isa.id),
  ];

  return {
    diagram: {
      ...diagram,
      entities: [...diagram.entities, ...entities],
      relationships: [...diagram.relationships, ...relationships],
      attributes: [...diagram.attributes, ...attributes],
      isas: [...diagram.isas, ...isas],
    },
    duplicatedIds,
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
