import type {
  LogicalDiagnostic,
  LogicalModel,
  LogicalTable,
  LogicalWorkspace,
} from '@/domain/logical/models';
import { synchronizeLogicalReferences } from './logical-columns-mutations';

function validateLogicalTables(tables: LogicalTable[]): LogicalDiagnostic[] {
  const diagnostics: LogicalDiagnostic[] = [];
  const tableNames = new Set<string>();

  function report(
    table: LogicalTable,
    code: string,
    message: string,
    severity: LogicalDiagnostic['severity'] = 'error',
  ): void {
    diagnostics.push({
      id: `logical:validation:${table.id}:${code}`,
      severity,
      sourceElementId: table.sourceElementId,
      message,
    });
  }

  for (const table of tables) {
    const tableName = table.name.trim().toLowerCase();

    if (!tableName) {
      report(table, 'empty-name', 'Hay una tabla sin nombre.');
    } else if (tableNames.has(tableName)) {
      report(table, 'duplicate-name', `El nombre de tabla "${table.name}" está repetido.`);
    }

    tableNames.add(tableName);

    if (!table.columns.some((column) => column.primaryKey)) {
      report(table, 'missing-pk', `La tabla "${table.name}" no tiene clave primaria.`);
    }

    const columnNames = new Set<string>();

    for (const column of table.columns) {
      const columnName = column.name.trim().toLowerCase();

      if (!columnName) {
        report(
          table,
          `empty-column:${column.id}`,
          `La tabla "${table.name}" tiene una columna sin nombre.`,
        );
      } else if (columnNames.has(columnName)) {
        report(
          table,
          `duplicate-column:${column.id}`,
          `La columna "${column.name}" está repetida en "${table.name}".`,
        );
      }

      columnNames.add(columnName);

      if (column.primaryKey && column.nullable) {
        report(
          table,
          `nullable-pk:${column.id}`,
          `La clave primaria "${table.name}.${column.name}" no admite NULL.`,
        );
      }
    }

    for (const foreignKey of table.foreignKeys) {
      const code = `fk:${foreignKey.id}`;

      const referencedTable = tables.find(
        (candidate) => candidate.id === foreignKey.referencedTableId,
      );

      if (!referencedTable) {
        report(
          table,
          `${code}:missing-table`,
          `Una clave foránea de "${table.name}" apunta a una tabla inexistente.`,
        );

        continue;
      }

      const columns = foreignKey.columnIds.flatMap((columnId) => {
        const column = table.columns.find((candidate) => candidate.id === columnId);

        return column ? [column] : [];
      });

      const referencedColumns = foreignKey.referencedColumnIds.flatMap((columnId) => {
        const column = referencedTable.columns.find((candidate) => candidate.id === columnId);

        return column ? [column] : [];
      });

      const invalidMapping =
        foreignKey.columnIds.length === 0 ||
        foreignKey.columnIds.length !== foreignKey.referencedColumnIds.length ||
        new Set(foreignKey.columnIds).size !== foreignKey.columnIds.length ||
        new Set(foreignKey.referencedColumnIds).size !== foreignKey.referencedColumnIds.length ||
        columns.length !== foreignKey.columnIds.length ||
        referencedColumns.length !== foreignKey.referencedColumnIds.length;

      if (invalidMapping) {
        report(
          table,
          `${code}:invalid-columns`,
          `La relación entre "${table.name}" y "${referencedTable.name}" tiene columnas faltantes o un emparejamiento inválido.`,
        );

        continue;
      }

      const primaryColumns = referencedTable.columns.filter((column) => column.primaryKey);

      if (
        referencedColumns.length !== primaryColumns.length ||
        referencedColumns.some((column) => !column.primaryKey)
      ) {
        report(
          table,
          `${code}:incomplete-key`,
          `La FK de "${table.name}" debe referenciar la clave primaria completa de "${referencedTable.name}".`,
        );
      }

      if (foreignKey.referencedCardinality.maximum !== 1) {
        report(
          table,
          `${code}:referenced-many`,
          `La FK de "${table.name}" apunta a una fila de "${referencedTable.name}". Una relación N:M necesita una tabla intermedia.`,
        );
      }

      const optional = foreignKey.referencedCardinality.minimum === 0;

      if (columns.some((column) => column.nullable !== optional)) {
        report(
          table,
          `${code}:nullable`,
          `La opcionalidad de la relación entre "${table.name}" y "${referencedTable.name}" no coincide con sus columnas.`,
        );
      }

      if (foreignKey.sourceCardinality.maximum === 1) {
        if (columns.length > 1) {
          const primaryIds = table.columns
            .filter((column) => column.primaryKey)
            .map((column) => column.id);

          const foreignKeyIsPrimaryKey =
            primaryIds.length === columns.length &&
            columns.every((column) => primaryIds.includes(column.id));

          if (!foreignKeyIsPrimaryKey) {
            report(
              table,
              `${code}:composite-unique`,
              `La relación 1:1 entre "${table.name}" y "${referencedTable.name}" necesita una restricción UNIQUE conjunta que el editor todavía no representa.`,
              'warning',
            );
          }
        } else {
          const column = columns[0];

          const isSinglePrimaryKey =
            column?.primaryKey &&
            table.columns.filter((candidate) => candidate.primaryKey).length === 1;

          if (column && !column.unique && !isSinglePrimaryKey) {
            report(
              table,
              `${code}:missing-unique`,
              `La relación 1:1 de "${table.name}" necesita UNIQUE en "${column.name}".`,
            );
          }
        }
      }
    }
  }

  return diagnostics;
}

function createManualLogicalWorkspace(
  workspace: LogicalWorkspace,
  model: LogicalModel,
): LogicalWorkspace {
  const sourceIds = new Set<string>();

  for (const table of model.tables) {
    sourceIds.add(table.sourceElementId);

    for (const column of table.columns) {
      if (column.sourceAttributeId) {
        sourceIds.add(column.sourceAttributeId);
      }
    }

    for (const foreignKey of table.foreignKeys) {
      if (foreignKey.sourceRelationshipId) {
        sourceIds.add(foreignKey.sourceRelationshipId);
      }
    }
  }

  const transformationDiagnostics = model.diagnostics.filter(
    (diagnostic) =>
      !diagnostic.id.startsWith('logical:validation:') &&
      (diagnostic.sourceElementId === null || sourceIds.has(diagnostic.sourceElementId)),
  );

  return {
    ...workspace,
    origin: 'manual',
    model: {
      ...model,
      diagnostics: [...transformationDiagnostics, ...validateLogicalTables(model.tables)],
    },
  };
}

export function replaceLogicalTables(
  workspace: LogicalWorkspace,
  tables: LogicalTable[],
): LogicalWorkspace {
  const referenceDiagnostics: LogicalDiagnostic[] = [];

  const synchronizedTables = synchronizeLogicalReferences(tables, referenceDiagnostics);

  const nextWorkspace = createManualLogicalWorkspace(workspace, {
    ...workspace.model,
    tables: synchronizedTables,
  });

  return {
    ...nextWorkspace,
    model: {
      ...nextWorkspace.model,
      diagnostics: [...nextWorkspace.model.diagnostics, ...referenceDiagnostics],
    },
  };
}
