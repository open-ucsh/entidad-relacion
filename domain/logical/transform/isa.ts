import type { Diagram } from '@/domain/diagram/models';
import { getIsaHierarchy } from '@/domain/diagram/queries/isa';
import type { LogicalDiagnostic, LogicalTable } from '@/domain/logical/models';

import { addForeignKey } from './foreign-keys';
import { createEntityTableId } from './naming';

export function transformIsaHierarchies(
  diagram: Diagram,
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[],
): void {
  for (const isa of diagram.isas) {
    const hierarchy = getIsaHierarchy(diagram, isa);

    if (!hierarchy.supertype) {
      diagnostics.push({
        id: `logical:diagnostic:isa-supertype:${isa.id}`,
        severity: 'error',
        sourceElementId: isa.id,
        message: 'La jerarquía ISA no tiene un supertipo definido.',
      });

      continue;
    }

    if (hierarchy.subtypes.length === 0) {
      diagnostics.push({
        id: `logical:diagnostic:isa-subtypes:${isa.id}`,
        severity: 'error',
        sourceElementId: isa.id,
        message: `La jerarquía ISA de "${hierarchy.supertype.name}" no tiene subtipos.`,
      });

      continue;
    }

    const supertypeTable = tables.find(
      (table) => table.id === createEntityTableId(hierarchy.supertype?.id ?? ''),
    );

    if (!supertypeTable) {
      continue;
    }

    for (const subtype of hierarchy.subtypes) {
      const subtypeTable = tables.find((table) => table.id === createEntityTableId(subtype.id));

      if (!subtypeTable) {
        continue;
      }

      const inheritedKeyAdded = addForeignKey({
        sourceId: `isa:${isa.id}:${subtype.id}`,
        sourceRelationshipId: null,
        referencedTable: supertypeTable,
        targetTable: subtypeTable,
        nullable: false,
        primaryKey: true,

        sourceCardinality: {
          minimum: 1,
          maximum: 1,
        },

        referencedCardinality: {
          minimum: 1,
          maximum: 1,
        },
      });

      if (!inheritedKeyAdded) {
        diagnostics.push({
          id: `logical:diagnostic:isa-key:${isa.id}:${subtype.id}`,
          severity: 'error',
          sourceElementId: isa.id,
          message: `No se puede transformar la jerarquía ISA porque "${hierarchy.supertype.name}" no tiene clave primaria.`,
        });
      }
    }
  }
}
