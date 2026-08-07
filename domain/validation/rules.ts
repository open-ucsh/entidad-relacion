import type { Attribute, Connection, Diagram, Entity, Isa, Relationship } from '../models';

import { findElementById } from '../queries';

export type DiagramElement = Entity | Relationship | Attribute | Isa;

export interface ValidationIssue {
  code: string;
  message: string;
  elementId?: string;
}

export function canConnect(source: DiagramElement, target: DiagramElement): boolean {
  if (source.id === target.id) {
    return false;
  }

  switch (source.type) {
    case 'entity':
      return target.type === 'relationship' || target.type === 'attribute' || target.type === 'isa';

    case 'relationship':
      return target.type === 'entity' || target.type === 'attribute';

    case 'attribute':
      return (
        target.type === 'entity' || target.type === 'relationship' || target.type === 'attribute'
      );

    case 'isa':
      return target.type === 'entity';
  }
}

export function validateConnection(diagram: Diagram, connection: Connection): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const source = findElementById(diagram, connection.sourceId);
  const target = findElementById(diagram, connection.targetId);

  if (!source) {
    issues.push({
      code: 'SOURCE_NOT_FOUND',
      message: 'El elemento origen no existe.',
      elementId: connection.sourceId,
    });
  }

  if (!target) {
    issues.push({
      code: 'TARGET_NOT_FOUND',
      message: 'El elemento destino no existe.',
      elementId: connection.targetId,
    });
  }

  if (source && target && !canConnect(source, target)) {
    issues.push({
      code: 'INVALID_CONNECTION',
      message: 'La conexión no es válida.',
      elementId: connection.id,
    });
  }

  return issues;
}

export function validateDiagram(diagram: Diagram): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const connection of diagram.connections) {
    issues.push(...validateConnection(diagram, connection));
  }

  for (const relationship of diagram.relationships) {
    if (relationship.kind !== 'identifying') {
      continue;
    }

    const connectedToWeakEntity = diagram.connections.some((connection) => {
      if (connection.sourceId !== relationship.id && connection.targetId !== relationship.id) {
        return false;
      }

      const otherId =
        connection.sourceId === relationship.id ? connection.targetId : connection.sourceId;

      const element = findElementById(diagram, otherId);

      return element?.type === 'entity' && element.kind === 'weak';
    });

    if (!connectedToWeakEntity) {
      issues.push({
        code: 'INVALID_IDENTIFYING_RELATIONSHIP',
        message: 'Una relación identificadora debe estar conectada a una entidad débil.',
        elementId: relationship.id,
      });
    }
  }

  return issues;
}
