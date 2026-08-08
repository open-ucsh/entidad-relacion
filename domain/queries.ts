import type { Attribute, BaseElement, Connection, Diagram, Entity, Relationship } from './models';

export type DiagramElement = Entity | Relationship | Attribute;

export function getElements(diagram: Diagram): DiagramElement[] {
  return [...diagram.entities, ...diagram.relationships, ...diagram.attributes];
}

export function findElementById(diagram: Diagram, id: string): DiagramElement | undefined {
  return getElements(diagram).find((element) => element.id === id);
}

export function getElementPosition(
  diagram: Diagram,
  id: string,
): BaseElement['position'] | undefined {
  return findElementById(diagram, id)?.position;
}

export function getConnectionEndpoints(diagram: Diagram, connection: Connection) {
  const from = getElementPosition(diagram, connection.fromId);
  const to = getElementPosition(diagram, connection.toId);

  if (!from || !to) {
    return null;
  }

  return { from, to };
}
