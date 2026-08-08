import type { Connection, Diagram, Point } from '@/domain/diagram/models';

import { getElementPosition } from './elements';

export interface ConnectionEndpoints {
  from: Point;
  to: Point;
}

export function getConnectionEndpoints(
  diagram: Diagram,
  connection: Connection,
): ConnectionEndpoints | null {
  const from = getElementPosition(diagram, connection.fromId);
  const to = getElementPosition(diagram, connection.toId);

  if (!from || !to) {
    return null;
  }

  return { from, to };
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
