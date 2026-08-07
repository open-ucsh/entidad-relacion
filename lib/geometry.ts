import type { Point } from '@/domain/models';

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function translatePoint(point: Point, dx: number, dy: number): Point {
  return {
    x: point.x + dx,
    y: point.y + dy,
  };
}

export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function isPointInsideRect(
  point: Point,
  position: Point,
  width: number,
  height: number,
): boolean {
  return (
    point.x >= position.x &&
    point.x <= position.x + width &&
    point.y >= position.y &&
    point.y <= position.y + height
  );
}
