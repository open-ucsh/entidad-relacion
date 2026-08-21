import type { Diagram, Entity, Isa } from '@/domain/diagram/models';

import { findDiagramElement } from './elements';

export interface IsaHierarchy {
  supertype: Entity | null;
  subtypes: Entity[];
}

function findConnectedEntity(diagram: Diagram, id: string): Entity | null {
  const element = findDiagramElement(diagram, id);

  return element?.type === 'entity' ? element : null;
}

export function getIsaHierarchy(diagram: Diagram, isa: Isa): IsaHierarchy {
  const supertypeConnection = diagram.connections.find(
    (connection) => connection.isaRole === 'supertype' && connection.toId === isa.id,
  );

  const supertype = supertypeConnection
    ? findConnectedEntity(diagram, supertypeConnection.fromId)
    : null;

  const subtypes = diagram.connections
    .filter((connection) => connection.isaRole === 'subtype' && connection.fromId === isa.id)
    .map((connection) => findConnectedEntity(diagram, connection.toId))
    .filter((entity): entity is Entity => entity !== null);

  return {
    supertype,
    subtypes,
  };
}
