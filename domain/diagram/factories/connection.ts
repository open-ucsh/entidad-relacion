import { createId } from '@/domain/diagram/lib/id';
import type { Connection } from '@/domain/diagram/models';

export function createConnection(fromId: string, toId: string): Connection {
  return {
    id: createId('connection'),
    type: 'connection',
    fromId,
    toId,
    minimum: 'unspecified',
    maximum: 'unspecified',
  };
}
