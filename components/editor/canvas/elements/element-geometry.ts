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

const ENTITY_SHAPE = {
  width: 120,
  height: 56,
} as const;

const RELATIONSHIP_SHAPE = {
  width: 120,
  height: 60,
} as const;

const ATTRIBUTE_SHAPE = {
  radiusX: 55,
  radiusY: 28,
  outerOutlineOffset: 5,
} as const;

function getElementBounds(element: DiagramElement): ElementBounds {
  switch (element.type) {
    case 'entity':
      return {
        center: element.position,
        halfWidth: ENTITY_SHAPE.width / 2,
        halfHeight: ENTITY_SHAPE.height / 2,
      };

    case 'relationship':
      return {
        center: element.position,
        halfWidth: RELATIONSHIP_SHAPE.width / 2,
        halfHeight: RELATIONSHIP_SHAPE.height / 2,
      };

    case 'attribute':
      return {
        center: element.position,
        halfWidth: ATTRIBUTE_SHAPE.radiusX,
        halfHeight: ATTRIBUTE_SHAPE.radiusY + ATTRIBUTE_SHAPE.outerOutlineOffset,
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
