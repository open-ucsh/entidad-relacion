import type { Diagram, Point } from '@/domain/diagram/models';

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

const ENTITY_BOUNDS = {
  halfWidth: 60,
  halfHeight: 28,
};

const RELATIONSHIP_BOUNDS = {
  halfWidth: 60,
  halfHeight: 30,
};

const ATTRIBUTE_BOUNDS = {
  halfWidth: 60,
  halfHeight: 33,
};

function getElementBounds(diagram: Diagram): ElementBounds[] {
  return [
    ...diagram.entities.map((entity) => ({
      center: entity.position,
      ...ENTITY_BOUNDS,
    })),
    ...diagram.relationships.map((relationship) => ({
      center: relationship.position,
      ...RELATIONSHIP_BOUNDS,
    })),
    ...diagram.attributes.map((attribute) => ({
      center: attribute.position,
      ...ATTRIBUTE_BOUNDS,
    })),
  ];
}

export function getDiagramContentBounds(diagram: Diagram): DiagramBounds | null {
  const elements = getElementBounds(diagram);

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
