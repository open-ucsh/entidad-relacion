import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';

export function replaceLogicalColumn(
  tables: LogicalTable[],
  tableId: string,
  columnId: string,
  column: LogicalColumn,
): LogicalTable[] {
  return tables.map((table) =>
    table.id === tableId
      ? {
          ...table,
          columns: table.columns.map((candidate) =>
            candidate.id === columnId ? column : candidate,
          ),
        }
      : table,
  );
}

export function removeReferencesToPrimaryKeyColumn(
  tables: LogicalTable[],
  referencedTableId: string,
  referencedColumnId: string,
): LogicalTable[] {
  return tables.map((table) => {
    const affectedForeignKeys = table.foreignKeys.filter(
      (foreignKey) =>
        foreignKey.referencedTableId === referencedTableId &&
        foreignKey.referencedColumnIds.includes(referencedColumnId),
    );

    if (affectedForeignKeys.length === 0) {
      return table;
    }

    const foreignKeyIds = new Set(affectedForeignKeys.map((foreignKey) => foreignKey.id));

    const columnIds = new Set(affectedForeignKeys.flatMap((foreignKey) => foreignKey.columnIds));

    return {
      ...table,

      columns: table.columns.filter((column) => !columnIds.has(column.id)),

      foreignKeys: table.foreignKeys.filter((foreignKey) => !foreignKeyIds.has(foreignKey.id)),
    };
  });
}

export function removeLogicalColumnFromTables(
  tables: LogicalTable[],
  tableId: string,
  columnId: string,
): LogicalTable[] {
  return tables.map((table) => {
    if (table.id !== tableId) {
      return table;
    }

    const removedForeignKeys = table.foreignKeys.filter((foreignKey) =>
      foreignKey.columnIds.includes(columnId),
    );

    const removedForeignKeyIds = new Set(removedForeignKeys.map((foreignKey) => foreignKey.id));

    const removedColumnIds = new Set(
      removedForeignKeys.flatMap((foreignKey) => foreignKey.columnIds),
    );

    removedColumnIds.add(columnId);

    return {
      ...table,

      columns: table.columns.filter((column) => !removedColumnIds.has(column.id)),

      foreignKeys: table.foreignKeys.filter(
        (foreignKey) => !removedForeignKeyIds.has(foreignKey.id),
      ),
    };
  });
}
