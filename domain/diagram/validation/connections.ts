import type { Diagram, DiagramElement } from '@/domain/diagram/models';
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

export function canConnectDiagramElements(source: DiagramElement, target: DiagramElement): boolean {
  if (source.id === target.id) {
    return false;
  }

  return isEntityRelationshipPair(source, target) || isAttributeOwnerPair(source, target);
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
