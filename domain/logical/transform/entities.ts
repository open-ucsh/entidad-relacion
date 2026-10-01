import type { Diagram, Entity } from '@/domain/diagram/models';
import type { LogicalColumn, LogicalDiagnostic, LogicalTable } from '@/domain/logical/models';
import { getEntityAttributes } from '@/domain/logical/queries/ownership';

import { createAttributeColumnId, createEntityTableId, toLogicalName } from './naming';

function isIsaSubtype(diagram: Diagram, entityId: string): boolean {
  return diagram.connections.some(
    (connection) => connection.isaRole === 'subtype' && connection.toId === entityId,
  );
}

function createStoredColumns(
  diagram: Diagram,
  entity: Entity,
  diagnostics: LogicalDiagnostic[],
): LogicalColumn[] {
  const attributes = getEntityAttributes(diagram, entity.id);

  return attributes.flatMap((attribute) => {
    if (attribute.derived || attribute.multivalued) {
      return [];
    }

    if (attribute.composite) {
      diagnostics.push({
        id: `logical:diagnostic:composite:${attribute.id}`,
        severity: 'warning',
        sourceElementId: attribute.id,
        message: `El atributo compuesto "${attribute.name}" no puede descomponerse porque todavía no tiene subatributos definidos.`,
      });
    }

    const primaryKey =
      attribute.keyType === 'primary' ||
      (entity.kind === 'weak' && attribute.keyType === 'partial');

    return [
      {
        id: createAttributeColumnId(attribute.id),
        name: toLogicalName(attribute.name),
        primaryKey,
        nullable: primaryKey ? false : attribute.optional,
        unique: attribute.unique || primaryKey,
        sourceAttributeId: attribute.id,
      },
    ];
  });
}

export function createEntityTables(
  diagram: Diagram,
  diagnostics: LogicalDiagnostic[],
): LogicalTable[] {
  return diagram.entities.map((entity) => {
    const columns = createStoredColumns(diagram, entity, diagnostics);

    const hasPrimaryKey = columns.some((column) => column.primaryKey);

    if (!hasPrimaryKey && entity.kind !== 'weak' && !isIsaSubtype(diagram, entity.id)) {
      diagnostics.push({
        id: `logical:diagnostic:missing-pk:${entity.id}`,
        severity: 'error',
        sourceElementId: entity.id,
        message: `La entidad "${entity.name}" no tiene una clave primaria.`,
      });
    }

    if (entity.kind === 'weak' && !columns.some((column) => column.primaryKey)) {
      diagnostics.push({
        id: `logical:diagnostic:missing-partial-key:${entity.id}`,
        severity: 'error',
        sourceElementId: entity.id,
        message: `La entidad débil "${entity.name}" no tiene una clave parcial.`,
      });
    }

    return {
      id: createEntityTableId(entity.id),
      name: toLogicalName(entity.name),
      columns,
      foreignKeys: [],
      sourceElementId: entity.id,
      sourceType: 'entity',
    };
  });
}
