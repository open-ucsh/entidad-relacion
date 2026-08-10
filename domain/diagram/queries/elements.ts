import type { BaseElement, Diagram, DiagramElement } from '@/domain/diagram/models';

export function getDiagramElements(diagram: Diagram): DiagramElement[] {
  return [...diagram.entities, ...diagram.relationships, ...diagram.attributes];
}

export function findDiagramElement(diagram: Diagram, id: string): DiagramElement | undefined {
  return getDiagramElements(diagram).find((element) => element.id === id);
}

export function getElementPosition(
  diagram: Diagram,
  id: string,
): BaseElement['position'] | undefined {
  return findDiagramElement(diagram, id)?.position;
}

export { getDiagramContentBounds } from './bounds';
