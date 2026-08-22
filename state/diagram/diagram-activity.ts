import { createId } from '@/domain/diagram/lib/id';

import type { Diagram, DiagramActivityType } from '@/domain/diagram/models';

const MAX_ACTIVITY_SIZE = 200;

export function appendDiagramActivity(
  diagram: Diagram,
  type: DiagramActivityType,
  details: string,
): Diagram {
  const occurredAt = new Date().toISOString();

  return {
    ...diagram,
    metadata: {
      ...diagram.metadata,
      updatedAt: occurredAt,
    },
    activity: [
      ...diagram.activity,
      {
        id: createId('activity'),
        type,
        occurredAt,
        details,
      },
    ].slice(-MAX_ACTIVITY_SIZE),
  };
}
