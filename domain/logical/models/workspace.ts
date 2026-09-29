import type { LogicalModel } from './logical-model';

export type LogicalWorkspaceOrigin = 'generated' | 'manual';

export interface LogicalWorkspace {
  origin: LogicalWorkspaceOrigin;
  model: LogicalModel;
}
