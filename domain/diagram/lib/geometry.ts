import type { DiagramElement, Point } from '@/domain/diagram/models';

export const ELEMENT_GEOMETRY = {
  entity: {
    width: 120,
    height: 56,
  },
  relationship: {
    width: 120,
    height: 60,
  },
  attribute: {
    radiusX: 55,
    radiusY: 28,
    outerOutlineOffset: 5,
  },
  isa: {
    width: 64,
    height: 52,
  },
} as const;

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getRectangleBoundaryPoint(element: DiagramElement, target: Point): Point {
  const { x, y } = element.position;
  const halfWidth = ELEMENT_GEOMETRY.entity.width / 2;
  const halfHeight = ELEMENT_GEOMETRY.entity.height / 2;

  const dx = target.x - x;
  const dy = target.y - y;

  if (dx === 0 && dy === 0) {
    return element.position;
  }

  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);

  return {
    x: x + dx * scale,
    y: y + dy * scale,
  };
}

function getDiamondBoundaryPoint(element: DiagramElement, target: Point): Point {
  const { x, y } = element.position;
  const halfWidth = ELEMENT_GEOMETRY.relationship.width / 2;
  const halfHeight = ELEMENT_GEOMETRY.relationship.height / 2;

  const dx = target.x - x;
  const dy = target.y - y;

  if (dx === 0 && dy === 0) {
    return element.position;
  }

  const denominator = Math.abs(dx) / halfWidth + Math.abs(dy) / halfHeight;

  return {
    x: x + dx / denominator,
    y: y + dy / denominator,
  };
}

function getEllipseBoundaryPoint(element: DiagramElement, target: Point): Point {
  const { x, y } = element.position;
  const radiusX = ELEMENT_GEOMETRY.attribute.radiusX;
  const radiusY = ELEMENT_GEOMETRY.attribute.radiusY;

  const dx = target.x - x;
  const dy = target.y - y;

  if (dx === 0 && dy === 0) {
    return element.position;
  }

  const scale = 1 / Math.sqrt((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY));

  return {
    x: x + dx * scale,
    y: y + dy * scale,
  };
}

function cross(first: Point, second: Point): number {
  return first.x * second.y - first.y * second.x;
}

function getIsaBoundaryPoint(element: DiagramElement, target: Point): Point {
  const { x, y } = element.position;
  const halfWidth = ELEMENT_GEOMETRY.isa.width / 2;
  const halfHeight = ELEMENT_GEOMETRY.isa.height / 2;

  const direction = {
    x: target.x - x,
    y: target.y - y,
  };

  if (direction.x === 0 && direction.y === 0) {
    return element.position;
  }

  const vertices = [
    { x, y: y - halfHeight },
    { x: x + halfWidth, y: y + halfHeight },
    { x: x - halfWidth, y: y + halfHeight },
  ];

  let closestScale = Number.POSITIVE_INFINITY;

  vertices.forEach((start, index) => {
    const end = vertices[(index + 1) % vertices.length];

    if (!end) {
      return;
    }

    const edge = {
      x: end.x - start.x,
      y: end.y - start.y,
    };

    const relativeStart = {
      x: start.x - x,
      y: start.y - y,
    };

    const denominator = cross(direction, edge);

    if (denominator === 0) {
      return;
    }

    const scale = cross(relativeStart, edge) / denominator;
    const edgePosition = cross(relativeStart, direction) / denominator;

    if (scale >= 0 && edgePosition >= 0 && edgePosition <= 1) {
      closestScale = Math.min(closestScale, scale);
    }
  });

  if (!Number.isFinite(closestScale)) {
    return element.position;
  }

  return {
    x: x + direction.x * closestScale,
    y: y + direction.y * closestScale,
  };
}

export function getElementBoundaryPoint(element: DiagramElement, target: Point): Point {
  switch (element.type) {
    case 'entity':
      return getRectangleBoundaryPoint(element, target);
    case 'relationship':
      return getDiamondBoundaryPoint(element, target);
    case 'attribute':
      return getEllipseBoundaryPoint(element, target);
    case 'isa':
      return getIsaBoundaryPoint(element, target);
  }
}
