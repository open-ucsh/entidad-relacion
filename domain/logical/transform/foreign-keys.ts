import type {
  LogicalColumn,
  LogicalForeignKey,
  LogicalRelationCardinality,
  LogicalTable,
} from '@/domain/logical/models';

import { createForeignColumnId, createForeignKeyId, toLogicalName } from './naming';

interface AddForeignKeyOptions {
  sourceId: string;
  sourceRelationshipId: string | null;
  referencedTable: LogicalTable;
  targetTable: LogicalTable;
  nullable: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  sourceCardinality?: LogicalRelationCardinality;
  referencedCardinality?: LogicalRelationCardinality;
}

export function addForeignKey({
  sourceId,
  sourceRelationshipId,
  referencedTable,
  targetTable,
  nullable,
  primaryKey = false,
  unique = false,
  sourceCardinality = {
    minimum: 0,
    maximum: 'N',
  },
  referencedCardinality,
}: AddForeignKeyOptions): boolean {
  const referencedColumns = referencedTable.columns.filter((column) => column.primaryKey);

  if (referencedColumns.length === 0) {
    return false;
  }

  const foreignColumns: LogicalColumn[] = referencedColumns.map((column) => ({
    id: createForeignColumnId(sourceId, column.id),
    name: `${toLogicalName(referencedTable.name)}_${toLogicalName(column.name)}`,
    primaryKey,
    nullable: primaryKey ? false : nullable,
    unique,
    sourceAttributeId: null,
  }));

  const existingColumnIds = new Set(targetTable.columns.map((column) => column.id));

  for (const column of foreignColumns) {
    if (!existingColumnIds.has(column.id)) {
      targetTable.columns.push(column);
    }
  }

  const foreignKey: LogicalForeignKey = {
    id: createForeignKeyId(sourceId, referencedTable.id),
    columnIds: foreignColumns.map((column) => column.id),
    referencedTableId: referencedTable.id,
    referencedColumnIds: referencedColumns.map((column) => column.id),
    sourceRelationshipId,
    sourceCardinality,
    referencedCardinality: referencedCardinality ?? {
      minimum: nullable ? 0 : 1,
      maximum: 1,
    },
  };

  if (!targetTable.foreignKeys.some((item) => item.id === foreignKey.id)) {
    targetTable.foreignKeys.push(foreignKey);
  }

  return true;
}
