import type {
  LogicalColumn,
  LogicalRelationCardinality,
  LogicalTable,
  LogicalTablePosition,
  LogicalWorkspace,
} from '@/domain/logical/models';

import { createLogicalColumn } from './logical-columns';
import {
  removeLogicalColumnFromTables,
  removeReferencesToPrimaryKeyColumn,
  replaceLogicalColumn,
} from './logical-columns-mutations';
import {
  createLogicalForeignKey,
  formatLogicalCardinality,
  removeForeignKeysReferencingTable,
  type LogicalForeignKeyCardinalities,
} from './logical-foreign-keys';
import { createLogicalTable, getNewLogicalTablePosition } from './logical-tables';
import type { LogicalOperationResult } from './logical-operation';
import { replaceLogicalTables } from './logical-workspace';

export function addTable(workspace: LogicalWorkspace, name: string): LogicalOperationResult {
  const table = createLogicalTable(name);
  const position = getNewLogicalTablePosition(workspace);

  return {
    workspace: {
      ...replaceLogicalTables(workspace, [...workspace.model.tables, table]),
      positions: {
        ...workspace.positions,
        [table.id]: position,
      },
    },
    activity: {
      type: 'element-created',
      details: `Creó la tabla ${table.name}`,
    },
  };
}

export function removeTable(
  workspace: LogicalWorkspace,
  tableId: string,
): LogicalOperationResult | null {
  const removedTable = workspace.model.tables.find((table) => table.id === tableId);

  if (!removedTable) {
    return null;
  }

  const tables = workspace.model.tables
    .filter((table) => table.id !== tableId)
    .map((table) => removeForeignKeysReferencingTable(table, tableId));

  const positions = Object.fromEntries(
    Object.entries(workspace.positions).filter(([id]) => id !== tableId),
  );

  return {
    workspace: {
      ...replaceLogicalTables(workspace, tables),
      positions,
    },
    activity: {
      type: 'elements-removed',
      details: `Eliminó la tabla ${removedTable.name}`,
    },
  };
}

export function renameTable(
  workspace: LogicalWorkspace,
  tableId: string,
  name: string,
): LogicalOperationResult | null {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return null;
  }

  const currentTable = workspace.model.tables.find((table) => table.id === tableId);

  if (!currentTable || currentTable.name === trimmedName) {
    return null;
  }

  const tables = workspace.model.tables.map((table) =>
    table.id === tableId
      ? {
          ...table,
          name: trimmedName,
        }
      : table,
  );

  return {
    workspace: replaceLogicalTables(workspace, tables),
    activity: {
      type: 'element-renamed',
      details: `Renombró la tabla ${currentTable.name} a ${trimmedName}`,
    },
  };
}

export function moveTable(
  workspace: LogicalWorkspace,
  tableId: string,
  position: LogicalTablePosition,
  options: {
    recordHistory?: boolean;
  } = {},
): LogicalOperationResult | null {
  const table = workspace.model.tables.find((candidate) => candidate.id === tableId);

  if (!table) {
    return null;
  }

  return {
    workspace: {
      ...workspace,
      positions: {
        ...workspace.positions,
        [tableId]: position,
      },
    },
    ...(options.recordHistory
      ? {
          activity: {
            type: 'elements-moved' as const,
            details: `Movió la tabla ${table.name}`,
          },
        }
      : {}),
    recordHistory: options.recordHistory ?? false,
  };
}

export function addColumn(
  workspace: LogicalWorkspace,
  tableId: string,
  name: string,
): LogicalOperationResult | null {
  const table = workspace.model.tables.find((candidate) => candidate.id === tableId);

  if (!table) {
    return null;
  }

  const column = createLogicalColumn(name);

  const tables = workspace.model.tables.map((candidate) =>
    candidate.id === tableId
      ? {
          ...candidate,
          columns: [...candidate.columns, column],
        }
      : candidate,
  );

  return {
    workspace: replaceLogicalTables(workspace, tables),
    activity: {
      type: 'element-created',
      details: `Creó la columna ${column.name} en ${table.name}`,
    },
  };
}

function createUpdatedColumn(
  currentColumn: LogicalColumn,
  updates: Partial<LogicalColumn>,
): LogicalColumn {
  const primaryKey = updates.primaryKey ?? currentColumn.primaryKey;

  return {
    ...currentColumn,
    ...updates,
    primaryKey,
    nullable: primaryKey ? false : (updates.nullable ?? currentColumn.nullable),
  };
}

function hasColumnChanged(current: LogicalColumn, next: LogicalColumn): boolean {
  return (
    next.name !== current.name ||
    next.primaryKey !== current.primaryKey ||
    next.nullable !== current.nullable ||
    next.unique !== current.unique
  );
}

function getColumnUpdateActivity(
  table: LogicalTable,
  current: LogicalColumn,
  updates: Partial<LogicalColumn>,
): string | null {
  if (updates.name !== undefined && updates.name !== current.name) {
    return `Renombró la columna ${current.name} a ${updates.name} en ${table.name}`;
  }

  if (updates.primaryKey !== undefined && updates.primaryKey !== current.primaryKey) {
    return updates.primaryKey
      ? `Marcó ${current.name} como clave primaria en ${table.name}`
      : `Quitó la clave primaria de ${current.name} en ${table.name}`;
  }

  if (updates.unique !== undefined && updates.unique !== current.unique) {
    return updates.unique
      ? `Marcó ${current.name} como UNIQUE en ${table.name}`
      : `Quitó UNIQUE de ${current.name} en ${table.name}`;
  }

  if (updates.nullable !== undefined && updates.nullable !== current.nullable) {
    return updates.nullable
      ? `Permitió NULL en ${current.name} de ${table.name}`
      : `Deshabilitó NULL en ${current.name} de ${table.name}`;
  }

  return null;
}

export function updateColumn(
  workspace: LogicalWorkspace,
  tableId: string,
  columnId: string,
  updates: Partial<LogicalColumn>,
): LogicalOperationResult | null {
  const table = workspace.model.tables.find((candidate) => candidate.id === tableId);

  const currentColumn = table?.columns.find((column) => column.id === columnId);

  if (!table || !currentColumn) {
    return null;
  }

  const nextColumn = createUpdatedColumn(currentColumn, updates);

  if (!hasColumnChanged(currentColumn, nextColumn)) {
    return null;
  }

  let tables = replaceLogicalColumn(workspace.model.tables, tableId, columnId, nextColumn);

  if (currentColumn.primaryKey && !nextColumn.primaryKey) {
    tables = removeReferencesToPrimaryKeyColumn(tables, tableId, columnId);
  }

  const details = getColumnUpdateActivity(table, currentColumn, updates);

  return {
    workspace: replaceLogicalTables(workspace, tables),
    ...(details
      ? {
          activity: {
            type: 'element-updated' as const,
            details,
          },
        }
      : {}),
  };
}

export function removeColumn(
  workspace: LogicalWorkspace,
  tableId: string,
  columnId: string,
): LogicalOperationResult | null {
  const sourceTable = workspace.model.tables.find((table) => table.id === tableId);

  const removedColumn = sourceTable?.columns.find((column) => column.id === columnId);

  if (!sourceTable || !removedColumn) {
    return null;
  }

  let tables = removeLogicalColumnFromTables(workspace.model.tables, tableId, columnId);

  if (removedColumn.primaryKey) {
    tables = removeReferencesToPrimaryKeyColumn(tables, tableId, columnId);
  }

  return {
    workspace: replaceLogicalTables(workspace, tables),
    activity: {
      type: 'elements-removed',
      details: `Eliminó la columna ${removedColumn.name} de ${sourceTable.name}`,
    },
  };
}

export function addForeignKey(
  workspace: LogicalWorkspace,
  sourceTableId: string,
  referencedTableId: string,
  cardinalities?: LogicalForeignKeyCardinalities,
): LogicalOperationResult | null {
  if (sourceTableId === referencedTableId) {
    return null;
  }

  const sourceTable = workspace.model.tables.find((table) => table.id === sourceTableId);

  const referencedTable = workspace.model.tables.find((table) => table.id === referencedTableId);

  if (!sourceTable || !referencedTable) {
    return null;
  }

  const created = createLogicalForeignKey(sourceTable, referencedTable, cardinalities);

  if (!created) {
    return null;
  }

  const tables = workspace.model.tables.map((table) =>
    table.id === sourceTableId
      ? {
          ...table,
          columns: [...table.columns, ...created.foreignColumns],
          foreignKeys: [...table.foreignKeys, created.foreignKey],
        }
      : table,
  );

  return {
    workspace: replaceLogicalTables(workspace, tables),
    activity: {
      type: 'connection-created',
      details: `Creó una relación de ${sourceTable.name} con ${referencedTable.name}`,
    },
  };
}

export function removeForeignKey(
  workspace: LogicalWorkspace,
  sourceTableId: string,
  foreignKeyId: string,
): LogicalOperationResult | null {
  const sourceTable = workspace.model.tables.find((table) => table.id === sourceTableId);

  const foreignKey = sourceTable?.foreignKeys.find((candidate) => candidate.id === foreignKeyId);

  if (!sourceTable || !foreignKey) {
    return null;
  }

  const referencedTable = workspace.model.tables.find(
    (table) => table.id === foreignKey.referencedTableId,
  );

  // Quitar una relación conserva sus columnas, incluidas las que
  // forman parte de la PK o participan en otras relaciones.
  const tables = workspace.model.tables.map((table) =>
    table.id === sourceTableId
      ? {
          ...table,
          foreignKeys: table.foreignKeys.filter((candidate) => candidate.id !== foreignKeyId),
        }
      : table,
  );

  return {
    workspace: replaceLogicalTables(workspace, tables),
    activity: {
      type: 'connection-updated',
      details: `Eliminó la relación de ${sourceTable.name} con ${referencedTable?.name ?? 'tabla'}`,
    },
  };
}
export function updateForeignKeyCardinality(
  workspace: LogicalWorkspace,
  sourceTableId: string,
  foreignKeyId: string,
  side: 'source' | 'referenced',
  cardinality: LogicalRelationCardinality,
): LogicalOperationResult | null {
  const sourceTable = workspace.model.tables.find((table) => table.id === sourceTableId);

  const foreignKey = sourceTable?.foreignKeys.find((candidate) => candidate.id === foreignKeyId);

  if (!sourceTable || !foreignKey) {
    return null;
  }

  if (side === 'referenced' && cardinality.maximum !== 1) {
    return null;
  }

  const foreignColumns = sourceTable.columns.filter((column) =>
    foreignKey.columnIds.includes(column.id),
  );

  if (foreignColumns.length !== foreignKey.columnIds.length) {
    return null;
  }

  // Una columna de la PK nunca puede convertirse en opcional.
  if (
    side === 'referenced' &&
    cardinality.minimum === 0 &&
    foreignColumns.some((column) => column.primaryKey)
  ) {
    return null;
  }

  const currentCardinality =
    side === 'source' ? foreignKey.sourceCardinality : foreignKey.referencedCardinality;

  if (
    currentCardinality.minimum === cardinality.minimum &&
    currentCardinality.maximum === cardinality.maximum
  ) {
    return null;
  }

  const nextForeignKey = {
    ...foreignKey,
    sourceCardinality: side === 'source' ? { ...cardinality } : foreignKey.sourceCardinality,
    referencedCardinality:
      side === 'referenced' ? { ...cardinality } : foreignKey.referencedCardinality,
  };

  const foreignColumnIds = new Set(foreignKey.columnIds);

  const tables = workspace.model.tables.map((table) => {
    if (table.id !== sourceTableId) {
      return table;
    }

    return {
      ...table,
      columns: table.columns.map((column) => {
        if (!foreignColumnIds.has(column.id)) {
          return column;
        }

        return {
          ...column,
          nullable: column.primaryKey ? false : nextForeignKey.referencedCardinality.minimum === 0,
          unique:
            side === 'source'
              ? nextForeignKey.sourceCardinality.maximum === 1 && foreignKey.columnIds.length === 1
              : column.unique,
        };
      }),
      foreignKeys: table.foreignKeys.map((candidate) =>
        candidate.id === foreignKeyId ? nextForeignKey : candidate,
      ),
    };
  });

  const referencedTable = workspace.model.tables.find(
    (table) => table.id === foreignKey.referencedTableId,
  );

  const tableName =
    side === 'source' ? sourceTable.name : (referencedTable?.name ?? 'referenciada');

  return {
    workspace: replaceLogicalTables(workspace, tables),
    activity: {
      type: 'connection-updated',
      details:
        `Cambió la cardinalidad ${tableName} de ` +
        `${formatLogicalCardinality(currentCardinality)} a ` +
        formatLogicalCardinality(cardinality),
    },
  };
}

export function replaceTable(
  workspace: LogicalWorkspace,
  tableId: string,
  nextTable: LogicalTable,
): LogicalOperationResult {
  return {
    workspace: replaceLogicalTables(
      workspace,
      workspace.model.tables.map((table) => (table.id === tableId ? nextTable : table)),
    ),
  };
}
