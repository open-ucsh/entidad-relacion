import { ELEMENT_GEOMETRY } from '@/domain/diagram/lib/geometry';
import type { Diagram, DiagramElement, Point } from '@/domain/diagram/models';
import { getDiagramElements } from '@/domain/diagram/queries/elements';

export interface DiagramBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElementBounds {
  center: Point;
  halfWidth: number;
  halfHeight: number;
}

function getElementBounds(element: DiagramElement): ElementBounds {
  switch (element.type) {
    case 'entity':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.entity.width / 2,
        halfHeight: ELEMENT_GEOMETRY.entity.height / 2,
      };

    case 'relationship':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.relationship.width / 2,
        halfHeight: ELEMENT_GEOMETRY.relationship.height / 2,
      };

    case 'attribute':
      return {
        center: element.position,
        halfWidth: ELEMENT_GEOMETRY.attribute.radiusX,
        halfHeight:
          ELEMENT_GEOMETRY.attribute.radiusY + ELEMENT_GEOMETRY.attribute.outerOutlineOffset,
      };
  }
}

export function getDiagramContentBounds(diagram: Diagram): DiagramBounds | null {
  const elements = getDiagramElements(diagram).map(getElementBounds);

  if (elements.length === 0) {
    return null;
  }

  const left = Math.min(...elements.map((element) => element.center.x - element.halfWidth));

  const right = Math.max(...elements.map((element) => element.center.x + element.halfWidth));

  const top = Math.min(...elements.map((element) => element.center.y - element.halfHeight));

  const bottom = Math.max(...elements.map((element) => element.center.y + element.halfHeight));

  return {
    x: left,
    y: top,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
  };
}

export function truncateLabel(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value;
}
