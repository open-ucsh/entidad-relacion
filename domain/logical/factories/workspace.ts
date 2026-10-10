import type {
  LogicalModel,
  LogicalTable,
  LogicalTablePosition,
  LogicalWorkspace,
  LogicalWorkspaceOrigin,
} from '@/domain/logical/models';

const TABLE_WIDTH = 288;
const TABLE_GAP_X = 96;
const TABLE_GAP_Y = 120;
const ROW_HEIGHT = 320;

function getConnectionCount(table: LogicalTable, tables: LogicalTable[]): number {
  const outgoing = table.foreignKeys.length;

  const incoming = tables.reduce(
    (count, candidate) =>
      count +
      candidate.foreignKeys.filter((foreignKey) => foreignKey.referencedTableId === table.id)
        .length,
    0,
  );

  return outgoing + incoming;
}

function getTableDepth(table: LogicalTable): number {
  if (table.sourceType === 'entity') {
    return 0;
  }

  if (table.sourceType === 'relationship') {
    return 1;
  }

  return 2;
}

function compareTables(first: LogicalTable, second: LogicalTable, tables: LogicalTable[]): number {
  const depthDifference = getTableDepth(first) - getTableDepth(second);

  if (depthDifference !== 0) {
    return depthDifference;
  }

  const connectionDifference =
    getConnectionCount(second, tables) - getConnectionCount(first, tables);

  if (connectionDifference !== 0) {
    return connectionDifference;
  }

  return first.name.localeCompare(second.name);
}

function groupTables(model: LogicalModel): LogicalTable[][] {
  const sorted = [...model.tables].sort((first, second) =>
    compareTables(first, second, model.tables),
  );

  const entities = sorted.filter((table) => table.sourceType === 'entity');

  const relationships = sorted.filter((table) => table.sourceType === 'relationship');

  const attributes = sorted.filter((table) => table.sourceType === 'attribute');

  return [entities, relationships, attributes].filter((row) => row.length > 0);
}

function getRowWidth(tableCount: number): number {
  if (tableCount === 0) {
    return 0;
  }

  return tableCount * TABLE_WIDTH + (tableCount - 1) * TABLE_GAP_X;
}

function createRowPositions(
  tables: LogicalTable[],
  row: number,
  maxWidth: number,
): Array<[string, LogicalTablePosition]> {
  const rowWidth = getRowWidth(tables.length);

  const startX = Math.max(0, (maxWidth - rowWidth) / 2);

  return tables.map((table, column) => [
    table.id,
    {
      x: startX + column * (TABLE_WIDTH + TABLE_GAP_X),
      y: row * (ROW_HEIGHT + TABLE_GAP_Y),
    },
  ]);
}

export function createEmptyLogicalModel(): LogicalModel {
  return {
    tables: [],
    diagnostics: [],
  };
}

export function createLogicalTablePositions(
  model: LogicalModel,
): Record<string, LogicalTablePosition> {
  const rows = groupTables(model);

  const maxWidth = Math.max(0, ...rows.map((row) => getRowWidth(row.length)));

  return Object.fromEntries(rows.flatMap((row, index) => createRowPositions(row, index, maxWidth)));
}

export function createLogicalWorkspace(
  origin: LogicalWorkspaceOrigin = 'manual',
  model: LogicalModel = createEmptyLogicalModel(),
): LogicalWorkspace {
  return {
    origin,
    model,
    positions: createLogicalTablePositions(model),
  };
}
