import type {
  LogicalModel,
  LogicalWorkspace,
  LogicalWorkspaceOrigin,
} from '@/domain/logical/models';

export function createEmptyLogicalModel(): LogicalModel {
  return {
    tables: [],
    diagnostics: [],
  };
}

export function createLogicalWorkspace(
  origin: LogicalWorkspaceOrigin = 'manual',
  model: LogicalModel = createEmptyLogicalModel(),
): LogicalWorkspace {
  return {
    origin,
    model,
  };
}
