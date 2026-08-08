import type { BaseElement, Diagram, Entity, Relationship, Attribute } from '@/domain/models';

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
