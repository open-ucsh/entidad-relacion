import type { Attribute, Diagram } from '@/domain/diagram/models';

export function getAttributeChildren(diagram: Diagram, attributeId: string): Attribute[] {
  const childIds = new Set(
    diagram.connections
      .filter((connection) => connection.fromId === attributeId)
      .map((connection) => connection.toId),
  );

  return diagram.attributes.filter((attribute) => childIds.has(attribute.id));
}
