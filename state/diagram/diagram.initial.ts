import type { Diagram } from '@/domain/diagram/models';

export function createInitialDiagram(): Diagram {
  return {
    entities: [],
    relationships: [],
    attributes: [],
    connections: [],
  };
}
