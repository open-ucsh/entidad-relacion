import type { Connection, Diagram } from '@/domain/diagram/models';

export function findDiagramConnection(diagram: Diagram, id: string): Connection | undefined {
  return diagram.connections.find((connection) => connection.id === id);
}

export function formatConnectionCardinality(connection: Connection): string | null {
  if (connection.minimum === 'unspecified' || connection.maximum === 'unspecified') {
    return null;
  }

  return `(${connection.minimum},${connection.maximum})`;
}
