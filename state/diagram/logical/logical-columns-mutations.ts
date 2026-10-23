import type { LogicalColumn, LogicalDiagnostic, LogicalTable } from '@/domain/logical/models';

import { createForeignKeyColumn } from './logical-columns';

function getPrimaryKeyIds(table: LogicalTable): string[] {
  return table.columns.filter((column) => column.primaryKey).map((column) => column.id);
}

function sameIds(first: string[], second: string[]): boolean {
  return first.length === second.length && first.every((id, index) => id === second[index]);
}

function getKeyDependencyCycles(tables: LogicalTable[]): Set<string> {
  const tableById = new Map(tables.map((table) => [table.id, table]));
  const visited = new Set<string>();
  const path: string[] = [];
  const cyclicIds = new Set<string>();

  function visit(tableId: string): void {
    const cycleStart = path.indexOf(tableId);

    if (cycleStart !== -1) {
      for (const id of path.slice(cycleStart)) {
        cyclicIds.add(id);
      }

      return;
    }

    if (visited.has(tableId)) {
      return;
    }

    const table = tableById.get(tableId);

    if (!table) {
      return;
    }

    path.push(tableId);

    for (const foreignKey of table.foreignKeys) {
      const contributesToPrimaryKey = foreignKey.columnIds.some((columnId) =>
        table.columns.some((column) => column.id === columnId && column.primaryKey),
      );

      if (contributesToPrimaryKey) {
        visit(foreignKey.referencedTableId);
      }
    }

    path.pop();
    visited.add(tableId);
  }

  for (const table of tables) {
    visit(table.id);
  }

  return cyclicIds;
}

function synchronizeTable(table: LogicalTable, tableById: Map<string, LogicalTable>): LogicalTable {
  let columns = [...table.columns];
  const foreignKeys: LogicalTable['foreignKeys'] = [];

  for (const foreignKey of table.foreignKeys) {
    const referencedTable = tableById.get(foreignKey.referencedTableId);

    const localColumns = foreignKey.columnIds.flatMap((columnId) => {
      const column = columns.find((candidate) => candidate.id === columnId);

      return column ? [column] : [];
    });

    const referencedColumns = referencedTable?.columns.filter((column) => column.primaryKey) ?? [];

    const missingLocalColumns = localColumns.length !== foreignKey.columnIds.length;

    if (!referencedTable || referencedColumns.length === 0 || missingLocalColumns) {
      // La relación ya no es válida. Conservamos las columnas restantes
      // para no eliminar otras claves que puedan depender de ellas.
      continue;
    }

    const nextReferencedIds = referencedColumns.map((column) => column.id);

    if (sameIds(foreignKey.referencedColumnIds, nextReferencedIds)) {
      foreignKeys.push(foreignKey);
      continue;
    }

    const existingPairs = new Map(
      foreignKey.referencedColumnIds.map((referencedId, index) => [
        referencedId,
        foreignKey.columnIds[index],
      ]),
    );

    const identifying =
      localColumns.length > 0 && localColumns.every((column) => column.primaryKey);

    const usedNames = new Set(columns.map((column) => column.name.trim().toLowerCase()));

    const nextColumnIds: string[] = [];

    for (const referencedColumn of referencedColumns) {
      const existingColumnId = existingPairs.get(referencedColumn.id);

      const existingColumn = columns.find((column) => column.id === existingColumnId);

      if (existingColumn) {
        nextColumnIds.push(existingColumn.id);
        continue;
      }

      const createdColumn: LogicalColumn = {
        ...createForeignKeyColumn(referencedTable, referencedColumn, usedNames),
        primaryKey: identifying,
        nullable: identifying ? false : foreignKey.referencedCardinality.minimum === 0,
        unique: foreignKey.sourceCardinality.maximum === 1 && referencedColumns.length === 1,
      };

      columns.push(createdColumn);
      nextColumnIds.push(createdColumn.id);
    }

    const nextColumnIdSet = new Set(nextColumnIds);

    const obsoleteColumnIds = new Set(
      foreignKey.columnIds.filter((columnId) => !nextColumnIdSet.has(columnId)),
    );

    // Si una columna deja de integrar esta FK, se conserva como columna
    // normal. Si la FK era identificadora, deja de integrar la PK salvo
    // que otra FK identificadora todavía la utilice.
    columns = columns.map((column) => {
      if (!obsoleteColumnIds.has(column.id) || !identifying) {
        return column;
      }

      const usedByAnotherForeignKey = table.foreignKeys.some(
        (candidate) => candidate.id !== foreignKey.id && candidate.columnIds.includes(column.id),
      );

      return usedByAnotherForeignKey
        ? column
        : {
            ...column,
            primaryKey: false,
          };
    });

    foreignKeys.push({
      ...foreignKey,
      columnIds: nextColumnIds,
      referencedColumnIds: nextReferencedIds,
    });
  }

  return {
    ...table,
    columns,
    foreignKeys,
  };
}

export function synchronizeLogicalReferences(
  tables: LogicalTable[],
  diagnostics: LogicalDiagnostic[] = [],
): LogicalTable[] {
  const cyclicIds = getKeyDependencyCycles(tables);

  if (cyclicIds.size > 0) {
    const names = tables
      .filter((table) => cyclicIds.has(table.id))
      .map((table) => table.name)
      .join(', ');

    diagnostics.push({
      id: 'logical:validation:primary-key-cycle',
      severity: 'error',
      sourceElementId: null,
      message:
        `Hay una dependencia circular entre claves primarias: ${names}. ` +
        'Cada clave identificadora necesita un origen independiente.',
    });
  }

  let current = tables;

  // Cada vuelta permite propagar un cambio de PK a otro nivel.
  // Las dependencias identificadoras circulares se excluyen.
  for (let pass = 0; pass <= tables.length; pass += 1) {
    const tableById = new Map(current.map((table) => [table.id, table]));

    const next = current.map((table) =>
      cyclicIds.has(table.id) ? table : synchronizeTable(table, tableById),
    );

    const keysChanged = next.some((table, index) => {
      const previous = current[index];

      return (
        previous !== undefined && !sameIds(getPrimaryKeyIds(previous), getPrimaryKeyIds(table))
      );
    });

    current = next;

    if (!keysChanged) {
      break;
    }
  }

  return current;
}

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
  const table = tables.find((candidate) => candidate.id === referencedTableId);

  const columnIsStillPrimary = table?.columns.some(
    (column) => column.id === referencedColumnId && column.primaryKey,
  );

  if (columnIsStillPrimary) {
    return tables;
  }

  return synchronizeLogicalReferences(tables);
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

    return {
      ...table,
      columns: table.columns.filter((column) => column.id !== columnId),
      foreignKeys: table.foreignKeys.filter(
        (foreignKey) => !foreignKey.columnIds.includes(columnId),
      ),
    };
  });
}
