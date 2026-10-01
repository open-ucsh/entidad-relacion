import type { Diagram, DiagramActivityType } from '@/domain/diagram/models';

import type { LogicalWorkspace } from '@/domain/logical/models';

import { appendDiagramActivity } from '../diagram-activity';
import { replaceActiveDiagram } from '../diagram-documents';
import type { DiagramState } from '../diagram-store.types';

export interface LogicalOperationResult {
  workspace: LogicalWorkspace;
  activity?: {
    type: DiagramActivityType;
    details: string;
  };
  recordHistory?: boolean;
}

export function applyLogicalOperation(state: DiagramState, result: LogicalOperationResult | null) {
  if (!result) {
    return state;
  }

  const diagram: Diagram = result.activity
    ? appendDiagramActivity(state.diagram, result.activity.type, result.activity.details)
    : state.diagram;

  return replaceActiveDiagram(state, diagram, {
    logicalWorkspace: result.workspace,
    ...(result.recordHistory !== undefined
      ? {
          recordHistory: result.recordHistory,
        }
      : {}),
  });
}
