import type { Diagram } from '@/domain/diagram/models';
import type { LogicalDiagnostic, LogicalTable } from '@/domain/logical/models';
import { getEntityAttributes } from '@/domain/logical/queries/ownership';

import { addForeignKey } from './foreign-keys';
import {
  createAttributeColumnId,
  createEntityTableId,
  createMultivaluedTableId,
  toLogicalName,
} from './naming';

export function transformMultivaluedAttributes(
  diagram: Diagram,
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[],
): void {
  for (const entity of diagram.entities) {
    const entityTable = tables.find((table) => table.id === createEntityTableId(entity.id));

    if (!entityTable) {
      continue;
    }

    const attributes = getEntityAttributes(diagram, entity.id).filter(
      (attribute) => attribute.multivalued && !attribute.derived,
    );

    for (const attribute of attributes) {
      const table: LogicalTable = {
        id: createMultivaluedTableId(attribute.id),
        name: `${toLogicalName(entity.name)}_${toLogicalName(attribute.name)}`,
        columns: [
          {
            id: createAttributeColumnId(attribute.id),
            name: toLogicalName(attribute.name),
            primaryKey: true,
            nullable: false,
            unique: false,
            sourceAttributeId: attribute.id,
          },
        ],
        foreignKeys: [],
        sourceElementId: attribute.id,
        sourceType: 'attribute',
      };

      const added = addForeignKey({
        sourceId: `multivalued:${attribute.id}`,
        sourceRelationshipId: null,
        referencedTable: entityTable,
        targetTable: table,
        nullable: false,
        primaryKey: true,
      });

      if (!added) {
        diagnostics.push({
          id: `logical:diagnostic:multivalued-owner:${attribute.id}`,
          severity: 'error',
          sourceElementId: attribute.id,
          message: `No se puede transformar el atributo multivaluado "${attribute.name}" porque "${entity.name}" no tiene una clave primaria.`,
        });
      }

      tables.push(table);
    }
  }
}
