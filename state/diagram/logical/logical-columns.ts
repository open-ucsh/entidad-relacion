import { createId } from '@/domain/diagram/lib/id';

import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';

import { normalizeLogicalName } from './logical-naming';

export function createLogicalColumn(name: string): LogicalColumn {
  return {
    id: createId('logical-column'),
    name,
    primaryKey: false,
    nullable: false,
    unique: false,
    sourceAttributeId: null,
  };
}

export function createForeignKeyColumn(
  referencedTable: LogicalTable,
  referencedColumn: LogicalColumn,
  usedNames: Set<string>,
): LogicalColumn {
  const baseName = `${normalizeLogicalName(referencedTable.name)}_${normalizeLogicalName(
    referencedColumn.name,
  )}`;

  let name = baseName;
  let index = 2;

  while (usedNames.has(name.toLowerCase())) {
    name = `${baseName}_${index}`;
    index += 1;
  }

  usedNames.add(name.toLowerCase());

  return {
    id: createId('logical-column'),
    name,
    primaryKey: false,
    nullable: false,
    unique: false,
    sourceAttributeId: null,
  };
}
