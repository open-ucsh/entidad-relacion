import type { Point } from '@/domain/diagram/models';

const CANVAS_GRID_SIZE = 24;

export function snapToGrid(position: Point, gridSize = CANVAS_GRID_SIZE): Point {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

export function snapDelta(value: number, gridSize = CANVAS_GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}
