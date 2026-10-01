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

function createForeignColumnBaseName(
  referencedTable: LogicalTable,
  referencedColumn: LogicalColumn,
): string {
  return `${toLogicalName(referencedTable.name)}_${toLogicalName(referencedColumn.name)}`;
}

function createUniqueColumnName(baseName: string, usedNames: Set<string>): string {
  let name = baseName;
  let index = 2;

  while (usedNames.has(name.toLowerCase())) {
    name = `${baseName}_${index}`;
    index += 1;
  }

  usedNames.add(name.toLowerCase());

  return name;
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
  referencedCardinality = {
    minimum: nullable ? 0 : 1,
    maximum: 1,
  },
}: AddForeignKeyOptions): boolean {
  const referencedColumns = referencedTable.columns.filter((column) => column.primaryKey);

  if (referencedColumns.length === 0) {
    return false;
  }

  const usedNames = new Set(targetTable.columns.map((column) => column.name.trim().toLowerCase()));

  const foreignColumns: LogicalColumn[] = referencedColumns.map((column) => {
    const baseName = createForeignColumnBaseName(referencedTable, column);

    return {
      id: createForeignColumnId(sourceId, column.id),
      name: createUniqueColumnName(baseName, usedNames),
      primaryKey,
      nullable: primaryKey ? false : nullable,
      unique,
      sourceAttributeId: null,
    };
  });

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
    referencedCardinality,
  };

  if (!targetTable.foreignKeys.some((item) => item.id === foreignKey.id)) {
    targetTable.foreignKeys.push(foreignKey);
  }

  return true;
}
