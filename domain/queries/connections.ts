import type { Connection, Diagram } from '@/domain/models';

import { getElementPosition } from './elements';

export function getConnectionEndpoints(diagram: Diagram, connection: Connection) {
  const from = getElementPosition(diagram, connection.fromId);
  const to = getElementPosition(diagram, connection.toId);

  if (!from || !to) {
    return null;
  }

  return { from, to };
}
