import type { Connection, Diagram, Point } from '@/domain/diagram/models';

import { findDiagramElement } from '@/domain/diagram/queries/elements';

import { getElementBoundaryPoint } from '../elements/element-connection-geometry';

export interface ConnectionEndpoints {
  from: Point;
  to: Point;
}

export function getConnectionEndpoints(
  diagram: Diagram,
  connection: Connection,
): ConnectionEndpoints | null {
  const fromElement = findDiagramElement(diagram, connection.fromId);
  const toElement = findDiagramElement(diagram, connection.toId);

  if (!fromElement || !toElement) {
    return null;
  }

  return {
    from: getElementBoundaryPoint(fromElement, toElement.position),
    to: getElementBoundaryPoint(toElement, fromElement.position),
  };
}
