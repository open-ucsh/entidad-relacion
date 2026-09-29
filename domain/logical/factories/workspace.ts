import type {
  LogicalModel,
  LogicalTablePosition,
  LogicalWorkspace,
  LogicalWorkspaceOrigin,
} from '@/domain/logical/models';

const TABLE_WIDTH = 288;
const TABLE_GAP_X = 80;
const TABLE_GAP_Y = 80;
const TABLES_PER_ROW = 3;

export function createEmptyLogicalModel(): LogicalModel {
  return {
    tables: [],
    diagnostics: [],
  };
}

export function createLogicalTablePositions(
  model: LogicalModel,
): Record<string, LogicalTablePosition> {
  return Object.fromEntries(
    model.tables.map((table, index) => {
      const column = index % TABLES_PER_ROW;
      const row = Math.floor(index / TABLES_PER_ROW);

      return [
        table.id,
        {
          x: column * (TABLE_WIDTH + TABLE_GAP_X),
          y: row * (240 + TABLE_GAP_Y),
        },
      ];
    }),
  );
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
