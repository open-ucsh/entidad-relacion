import { createId } from '@/domain/diagram/lib/id';

import type {
  LogicalForeignKey,
  LogicalRelationCardinality,
  LogicalTable,
} from '@/domain/logical/models';

import { createForeignKeyColumn } from './logical-columns';

export interface CreatedLogicalForeignKey {
  foreignKey: LogicalForeignKey;
  foreignColumns: LogicalTable['columns'];
}

export interface LogicalForeignKeyCardinalities {
  source: LogicalRelationCardinality;
  referenced: LogicalRelationCardinality;
}

const DEFAULT_CARDINALITIES: LogicalForeignKeyCardinalities = {
  source: {
    minimum: 0,
    maximum: 'N',
  },
  referenced: {
    minimum: 1,
    maximum: 1,
  },
};

export function createLogicalForeignKey(
  sourceTable: LogicalTable,
  referencedTable: LogicalTable,
  cardinalities: LogicalForeignKeyCardinalities = DEFAULT_CARDINALITIES,
): CreatedLogicalForeignKey | null {
  if (cardinalities.referenced.maximum !== 1) {
    return null;
  }

  const referencedColumns = referencedTable.columns.filter((column) => column.primaryKey);

  if (referencedColumns.length === 0) {
    return null;
  }

  const usedNames = new Set(sourceTable.columns.map((column) => column.name.trim().toLowerCase()));

  const foreignColumns = referencedColumns.map((column) => ({
    ...createForeignKeyColumn(referencedTable, column, usedNames),
    nullable: cardinalities.referenced.minimum === 0,
    unique: cardinalities.source.maximum === 1 && referencedColumns.length === 1,
  }));

  const foreignKey: LogicalForeignKey = {
    id: createId('logical-foreign-key'),
    columnIds: foreignColumns.map((column) => column.id),
    referencedTableId: referencedTable.id,
    referencedColumnIds: referencedColumns.map((column) => column.id),
    sourceRelationshipId: null,
    sourceCardinality: { ...cardinalities.source },
    referencedCardinality: { ...cardinalities.referenced },
  };

  return {
    foreignKey,
    foreignColumns,
  };
}

export function removeForeignKeysReferencingTable(
  table: LogicalTable,
  referencedTableId: string,
): LogicalTable {
  const removedForeignKeys = table.foreignKeys.filter(
    (foreignKey) => foreignKey.referencedTableId === referencedTableId,
  );

  if (removedForeignKeys.length === 0) {
    return table;
  }

  // Eliminar la referencia conserva las columnas y sus restricciones.
  // Su eliminación debe ser una acción explícita del usuario.
  return {
    ...table,
    foreignKeys: table.foreignKeys.filter(
      (foreignKey) => foreignKey.referencedTableId !== referencedTableId,
    ),
  };
}

export function formatLogicalCardinality(cardinality: LogicalRelationCardinality): string {
  return `${cardinality.minimum}..${cardinality.maximum}`;
}
