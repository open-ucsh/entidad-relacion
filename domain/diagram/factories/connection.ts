import { createId } from '@/domain/diagram/lib/id';

import type { Connection, IsaConnectionRole } from '@/domain/diagram/models';

export function createConnection(
  fromId: string,
  toId: string,
  isaRole: IsaConnectionRole = 'none',
): Connection {
  return {
    id: createId('connection'),
    type: 'connection',
    fromId,
    toId,
    minimum: 'unspecified',
    maximum: 'unspecified',
    isaRole,
  };
}
