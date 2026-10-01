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

export function createLogicalForeignKey(
  sourceTable: LogicalTable,
  referencedTable: LogicalTable,
): CreatedLogicalForeignKey | null {
  const referencedColumns = referencedTable.columns.filter((column) => column.primaryKey);

  if (referencedColumns.length === 0) {
    return null;
  }

  const usedNames = new Set(sourceTable.columns.map((column) => column.name.trim().toLowerCase()));

  const foreignColumns = referencedColumns.map((column) =>
    createForeignKeyColumn(referencedTable, column, usedNames),
  );

  const foreignKey: LogicalForeignKey = {
    id: createId('logical-foreign-key'),

    columnIds: foreignColumns.map((column) => column.id),

    referencedTableId: referencedTable.id,

    referencedColumnIds: referencedColumns.map((column) => column.id),

    sourceRelationshipId: null,

    sourceCardinality: {
      minimum: 0,
      maximum: 'N',
    },

    referencedCardinality: {
      minimum: 1,
      maximum: 1,
    },
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

  const removedColumnIds = new Set(
    removedForeignKeys.flatMap((foreignKey) => foreignKey.columnIds),
  );

  return {
    ...table,

    columns: table.columns.filter((column) => !removedColumnIds.has(column.id)),

    foreignKeys: table.foreignKeys.filter(
      (foreignKey) => foreignKey.referencedTableId !== referencedTableId,
    ),
  };
}

export function formatLogicalCardinality(cardinality: LogicalRelationCardinality): string {
  return `${cardinality.minimum}..${cardinality.maximum}`;
}
