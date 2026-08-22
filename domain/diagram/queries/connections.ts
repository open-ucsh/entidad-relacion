import { getElementBoundaryPoint } from '@/components/editor/canvas/elements/element-shape-geometry';
import type { Connection, Diagram, Point } from '@/domain/diagram/models';

import { findDiagramElement } from './elements';

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

export function findDiagramConnection(diagram: Diagram, id: string): Connection | undefined {
  return diagram.connections.find((connection) => connection.id === id);
}

export function formatConnectionCardinality(connection: Connection): string | null {
  if (connection.minimum === 'unspecified' || connection.maximum === 'unspecified') {
    return null;
  }

  return `(${connection.minimum},${connection.maximum})`;
}
