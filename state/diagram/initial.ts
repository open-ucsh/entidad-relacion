import { createId } from '@/domain/diagram/lib/id';

import type { Diagram } from '@/domain/diagram/models';

export function createInitialDiagram(name = 'Diagrama sin título'): Diagram {
  const createdAt = new Date().toISOString();

  return {
    entities: [],
    relationships: [],
    attributes: [],
    isas: [],
    connections: [],
    metadata: {
      name,
      createdAt,
      updatedAt: createdAt,
      origin: 'created-in-app',
      importedAt: null,
    },
    activity: [
      {
        id: createId('activity'),
        type: 'diagram-created',
        occurredAt: createdAt,
        details: 'Se creó el proyecto en ER Designer.',
      },
    ],
  };
}
