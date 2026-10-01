import type { LogicalTable, LogicalTablePosition } from '@/domain/logical/models';

export interface PositionedLogicalTable {
  table: LogicalTable;
  position: LogicalTablePosition;
}

export interface LogicalBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LOGICAL_TABLE_WIDTH = 288;
export const LOGICAL_TABLE_ESTIMATED_HEIGHT = 360;

export function getLogicalBounds(tables: PositionedLogicalTable[]): LogicalBounds | null {
  if (tables.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const { position } of tables) {
    minX = Math.min(minX, position.x);
    minY = Math.min(minY, position.y);

    maxX = Math.max(maxX, position.x + LOGICAL_TABLE_WIDTH);

    maxY = Math.max(maxY, position.y + LOGICAL_TABLE_ESTIMATED_HEIGHT);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}
