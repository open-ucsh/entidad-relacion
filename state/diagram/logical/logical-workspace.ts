import type { LogicalModel, LogicalTable, LogicalWorkspace } from '@/domain/logical/models';

export function createManualLogicalWorkspace(
  workspace: LogicalWorkspace,
  model: LogicalModel,
): LogicalWorkspace {
  return {
    ...workspace,
    origin: 'manual',
    model: {
      ...model,
      diagnostics: [],
    },
  };
}

export function replaceLogicalTables(
  workspace: LogicalWorkspace,
  tables: LogicalTable[],
): LogicalWorkspace {
  return createManualLogicalWorkspace(workspace, {
    ...workspace.model,
    tables,
  });
}
