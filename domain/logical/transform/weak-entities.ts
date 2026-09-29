import type { Diagram } from '@/domain/diagram/models';
import type { LogicalDiagnostic } from '@/domain/logical/models';
import { getEntityRelationships } from '@/domain/logical/queries/ownership';

export function validateWeakEntities(diagram: Diagram, diagnostics: LogicalDiagnostic[]): void {
  for (const entity of diagram.entities) {
    if (entity.kind !== 'weak') {
      continue;
    }

    const relationships = getEntityRelationships(diagram, entity.id);

    const hasIdentifyingRelationship = relationships.some(
      (relationship) => relationship.kind === 'identifying',
    );

    if (!hasIdentifyingRelationship) {
      diagnostics.push({
        id: `logical:diagnostic:weak-identifying:${entity.id}`,
        severity: 'error',
        sourceElementId: entity.id,
        message: `La entidad débil "${entity.name}" necesita una relación identificadora.`,
      });
    }
  }
}
