import { createId } from '@/domain/diagram/lib/id';

import type { LogicalTable, LogicalTablePosition, LogicalWorkspace } from '@/domain/logical/models';

const TABLE_WIDTH = 288;
const TABLE_GAP = 48;
const START_POSITION = 40;
const COLUMNS_PER_ROW = 4;
const MIN_ROW_HEIGHT = 192;

interface OccupiedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function estimateTableHeight(table: LogicalTable): number {
  const headerHeight = Math.max(48, Math.ceil(table.name.length / 24) * 20 + 24);

  const columnsHeight =
    table.columns.length === 0
      ? 56
      : table.columns.reduce((height, column) => {
          const charactersPerLine =
            column.primaryKey &&
            table.foreignKeys.some((foreignKey) => foreignKey.columnIds.includes(column.id))
              ? 22
              : 28;

          const lines = Math.max(1, Math.ceil(column.name.length / charactersPerLine));

          return height + Math.max(40, lines * 20 + 16);
        }, 0);

  return headerHeight + columnsHeight + 56;
}

function overlaps(first: OccupiedArea, second: OccupiedArea): boolean {
  return (
    first.x < second.x + second.width + TABLE_GAP &&
    first.x + first.width + TABLE_GAP > second.x &&
    first.y < second.y + second.height + TABLE_GAP &&
    first.y + first.height + TABLE_GAP > second.y
  );
}

export function createLogicalTable(name: string): LogicalTable {
  const id = createId('logical-table');

  return {
    id,
    name,
    columns: [],
    foreignKeys: [],
    sourceElementId: id,
    sourceType: 'entity',
  };
}

export function getNewLogicalTablePosition(workspace: LogicalWorkspace): LogicalTablePosition {
  const occupiedAreas: OccupiedArea[] = workspace.model.tables.map((table) => {
    const position = workspace.positions[table.id] ?? {
      x: 64,
      y: 64,
    };

    return {
      ...position,
      width: TABLE_WIDTH,
      height: estimateTableHeight(table),
    };
  });

  const newTableHeight = 160;

  const lastOccupiedBottom = occupiedAreas.reduce(
    (bottom, area) => Math.max(bottom, area.y + area.height),
    START_POSITION,
  );

  const rowCount =
    Math.ceil((lastOccupiedBottom + TABLE_GAP - START_POSITION) / MIN_ROW_HEIGHT) + 2;

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < COLUMNS_PER_ROW; column += 1) {
      const candidate: OccupiedArea = {
        x: START_POSITION + column * (TABLE_WIDTH + TABLE_GAP),
        y: START_POSITION + row * MIN_ROW_HEIGHT,
        width: TABLE_WIDTH,
        height: newTableHeight,
      };

      if (!occupiedAreas.some((area) => overlaps(candidate, area))) {
        return {
          x: candidate.x,
          y: candidate.y,
        };
      }
    }
  }

  return {
    x: START_POSITION,
    y: lastOccupiedBottom + TABLE_GAP,
  };
}
