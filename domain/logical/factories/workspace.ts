import type { LogicalWorkspace } from '@/domain/logical/models';

export function createLogicalWorkspace(): LogicalWorkspace {
  return {
    origin: 'manual',
    model: {
      tables: [],
      diagnostics: [],
    },
    positions: {},
  };
}
