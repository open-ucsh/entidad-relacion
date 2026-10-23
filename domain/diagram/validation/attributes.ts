import type { Diagram } from '@/domain/diagram/models';

export function hasValidAttributeHierarchy(diagram: Diagram): boolean {
  const attributes = new Map(diagram.attributes.map((attribute) => [attribute.id, attribute]));

  const ownerIds = new Set([
    ...diagram.entities.map((entity) => entity.id),
    ...diagram.relationships.map((relationship) => relationship.id),
  ]);

  const parentByChildId = new Map<string, string>();

  function assignParent(childId: string, parentId: string): boolean {
    if (parentByChildId.has(childId)) {
      return false;
    }

    parentByChildId.set(childId, parentId);

    return true;
  }

  for (const connection of diagram.connections) {
    const sourceAttribute = attributes.get(connection.fromId);
    const targetAttribute = attributes.get(connection.toId);

    if (sourceAttribute && targetAttribute) {
      if (
        sourceAttribute.id === targetAttribute.id ||
        !sourceAttribute.composite ||
        connection.isaRole !== 'none' ||
        connection.minimum !== 'unspecified' ||
        connection.maximum !== 'unspecified'
      ) {
        return false;
      }

      if (!assignParent(targetAttribute.id, sourceAttribute.id)) {
        return false;
      }

      continue;
    }

    if (sourceAttribute && ownerIds.has(connection.toId)) {
      if (!assignParent(sourceAttribute.id, connection.toId)) {
        return false;
      }
    } else if (targetAttribute && ownerIds.has(connection.fromId)) {
      if (!assignParent(targetAttribute.id, connection.fromId)) {
        return false;
      }
    }
  }

  const completedIds = new Set<string>();

  for (const attribute of diagram.attributes) {
    const pathIds = new Set<string>();
    let currentId: string | undefined = attribute.id;

    while (currentId !== undefined && attributes.has(currentId) && !completedIds.has(currentId)) {
      if (pathIds.has(currentId)) {
        return false;
      }

      pathIds.add(currentId);
      currentId = parentByChildId.get(currentId);
    }

    for (const id of pathIds) {
      completedIds.add(id);
    }
  }

  return true;
}
