import type {
  Connection,
  Diagram,
  DiagramElement,
  IsaConnectionRole,
} from '@/domain/diagram/models';

import { findDiagramElement } from '@/domain/diagram/queries/elements';

function isEntityRelationshipPair(source: DiagramElement, target: DiagramElement): boolean {
  return (
    (source.type === 'entity' && target.type === 'relationship') ||
    (source.type === 'relationship' && target.type === 'entity')
  );
}

function isAttributeOwnerPair(source: DiagramElement, target: DiagramElement): boolean {
  return (
    (source.type === 'attribute' && (target.type === 'entity' || target.type === 'relationship')) ||
    (target.type === 'attribute' && (source.type === 'entity' || source.type === 'relationship'))
  );
}

function isEntityIsaPair(source: DiagramElement, target: DiagramElement): boolean {
  return (
    (source.type === 'entity' && target.type === 'isa') ||
    (source.type === 'isa' && target.type === 'entity')
  );
}

export function getIsaConnectionRole(
  source: DiagramElement,
  target: DiagramElement,
): IsaConnectionRole {
  if (source.type === 'entity' && target.type === 'isa') {
    return 'supertype';
  }

  if (source.type === 'isa' && target.type === 'entity') {
    return 'subtype';
  }

  return 'none';
}

export function canConnectDiagramElements(source: DiagramElement, target: DiagramElement): boolean {
  if (source.id === target.id) {
    return false;
  }

  return (
    isEntityRelationshipPair(source, target) ||
    isAttributeOwnerPair(source, target) ||
    isEntityIsaPair(source, target)
  );
}

export function canConnectElementsById(
  diagram: Diagram,
  sourceId: string,
  targetId: string,
): boolean {
  const source = findDiagramElement(diagram, sourceId);
  const target = findDiagramElement(diagram, targetId);

  if (!source || !target) {
    return false;
  }

  return canConnectDiagramElements(source, target);
}

export function hasDiagramConnection(
  diagram: Diagram,
  sourceId: string,
  targetId: string,
): boolean {
  return diagram.connections.some(
    (connection) =>
      (connection.fromId === sourceId && connection.toId === targetId) ||
      (connection.fromId === targetId && connection.toId === sourceId),
  );
}

export function hasIsaSupertypeConnection(diagram: Diagram, isaId: string): boolean {
  return diagram.connections.some(
    (connection) => connection.isaRole === 'supertype' && connection.toId === isaId,
  );
}

export function canCreateConnection(diagram: Diagram, sourceId: string, targetId: string): boolean {
  const source = findDiagramElement(diagram, sourceId);
  const target = findDiagramElement(diagram, targetId);

  if (
    !source ||
    !target ||
    !canConnectDiagramElements(source, target) ||
    hasDiagramConnection(diagram, sourceId, targetId)
  ) {
    return false;
  }

  const isaRole = getIsaConnectionRole(source, target);

  return isaRole !== 'supertype' || !hasIsaSupertypeConnection(diagram, target.id);
}

export function hasValidIsaConnectionRole(diagram: Diagram, connection: Connection): boolean {
  const source = findDiagramElement(diagram, connection.fromId);
  const target = findDiagramElement(diagram, connection.toId);

  if (!source || !target) {
    return false;
  }

  return connection.isaRole === getIsaConnectionRole(source, target);
}
