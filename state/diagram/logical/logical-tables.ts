import { createId } from '@/domain/diagram/lib/id';

import type { LogicalTable, LogicalWorkspace, LogicalTablePosition } from '@/domain/logical/models';

const NEW_TABLE_OFFSET = 32;
const NEW_TABLE_WRAP = 5;

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
  const index = workspace.model.tables.length;

  return {
    x: 40 + (index % NEW_TABLE_WRAP) * (288 + NEW_TABLE_OFFSET),
    y: 40 + Math.floor(index / NEW_TABLE_WRAP) * (220 + NEW_TABLE_OFFSET),
  };
}
