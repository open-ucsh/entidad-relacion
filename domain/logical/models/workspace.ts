import type { LogicalModel } from './logical-model';

export type LogicalWorkspaceOrigin = 'generated' | 'manual';

export interface LogicalTablePosition {
  x: number;
  y: number;
}

export interface LogicalWorkspace {
  origin: LogicalWorkspaceOrigin;
  model: LogicalModel;
  positions: Record<string, LogicalTablePosition>;
}
