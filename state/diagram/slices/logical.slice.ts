import { createId } from '@/domain/diagram/lib/id';
import { createLogicalWorkspace } from '@/domain/logical/factories';
import type {
  LogicalColumn,
  LogicalForeignKey,
  LogicalTable,
  LogicalTablePosition,
  LogicalWorkspace,
} from '@/domain/logical/models';
import { transformDiagramToLogicalModel } from '@/domain/logical/transform';

import { replaceActiveDiagram } from '../diagram-documents';
import type { DiagramStoreSlice, LogicalSlice } from '../diagram-store.types';

const NEW_TABLE_OFFSET = 32;
const NEW_TABLE_WRAP = 5;

function createLogicalTable(name: string): LogicalTable {
  const id = createId('logical-table');

  return {
    id,
    name,
    columns: [],
    foreignKeys: [],
    sourceElementId: id,
    sourceType: 'entity',
  };
}

function createLogicalColumn(name: string): LogicalColumn {
  return {
    id: createId('logical-column'),
    name,
    primaryKey: false,
    nullable: false,
    unique: false,
    sourceAttributeId: null,
  };
}

function normalizeLogicalName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function createForeignKeyColumn(
  referencedTable: LogicalTable,
  referencedColumn: LogicalColumn,
): LogicalColumn {
  return {
    id: createId('logical-column'),
    name: `${normalizeLogicalName(referencedTable.name)}_${normalizeLogicalName(
      referencedColumn.name,
    )}`,
    primaryKey: false,
    nullable: false,
    unique: false,
    sourceAttributeId: null,
  };
}

function removeForeignKeysReferencingTable(
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

function getNewTablePosition(workspace: LogicalWorkspace): LogicalTablePosition {
  const index = workspace.model.tables.length;

  return {
    x: 40 + (index % NEW_TABLE_WRAP) * (288 + NEW_TABLE_OFFSET),
    y: 40 + Math.floor(index / NEW_TABLE_WRAP) * (220 + NEW_TABLE_OFFSET),
  };
}

export const createLogicalSlice: DiagramStoreSlice<LogicalSlice> = (set) => ({
  generateLogicalModel: () => {
    set((state) => {
      const model = transformDiagramToLogicalModel(state.diagram);

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: createLogicalWorkspace('generated', model),
      });
    });
  },

  createManualLogicalModel: () => {
    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: createLogicalWorkspace('manual'),
      }),
    );
  },

  addLogicalTable: (name = 'nueva_tabla') => {
    set((state) => {
      const table = createLogicalTable(name);
      const position = getNewTablePosition(state.logicalWorkspace);

      const logicalWorkspace: LogicalWorkspace = {
        origin: 'manual',
        model: {
          ...state.logicalWorkspace.model,
          diagnostics: [],
          tables: [...state.logicalWorkspace.model.tables, table],
        },
        positions: {
          ...state.logicalWorkspace.positions,
          [table.id]: position,
        },
      };

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace,
      });
    });
  },

  removeLogicalTable: (tableId) => {
    set((state) => {
      const tables = state.logicalWorkspace.model.tables
        .filter((table) => table.id !== tableId)
        .map((table) => removeForeignKeysReferencingTable(table, tableId));

      const positions = Object.fromEntries(
        Object.entries(state.logicalWorkspace.positions).filter(([id]) => id !== tableId),
      );

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            tables,
            diagnostics: [],
          },
          positions,
        },
      });
    });
  },

  renameLogicalTable: (tableId, name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            ...state.logicalWorkspace.model,
            diagnostics: [],
            tables: state.logicalWorkspace.model.tables.map((table) =>
              table.id === tableId
                ? {
                    ...table,
                    name: trimmedName,
                  }
                : table,
            ),
          },
        },
      }),
    );
  },

  moveLogicalTable: (tableId, position) => {
    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          positions: {
            ...state.logicalWorkspace.positions,
            [tableId]: position,
          },
        },
        recordHistory: false,
      }),
    );
  },

  addLogicalColumn: (tableId, name = 'nueva_columna') => {
    set((state) => {
      const column = createLogicalColumn(name);

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            ...state.logicalWorkspace.model,
            diagnostics: [],
            tables: state.logicalWorkspace.model.tables.map((table) =>
              table.id === tableId
                ? {
                    ...table,
                    columns: [...table.columns, column],
                  }
                : table,
            ),
          },
        },
      });
    });
  },

  updateLogicalColumn: (tableId, columnId, updates) => {
    set((state) => {
      const currentTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === tableId,
      );

      const currentColumn = currentTable?.columns.find((column) => column.id === columnId);

      if (!currentTable || !currentColumn) {
        return state;
      }

      const nextColumn = {
        ...currentColumn,
        ...updates,
      };

      const primaryKeyRemoved = currentColumn.primaryKey && !nextColumn.primaryKey;

      let tables = state.logicalWorkspace.model.tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              columns: table.columns.map((column) =>
                column.id === columnId ? nextColumn : column,
              ),
            }
          : table,
      );

      if (primaryKeyRemoved) {
        tables = tables.map((table) => {
          const affectedForeignKeys = table.foreignKeys.filter(
            (foreignKey) =>
              foreignKey.referencedTableId === tableId &&
              foreignKey.referencedColumnIds.includes(columnId),
          );

          if (affectedForeignKeys.length === 0) {
            return table;
          }

          const foreignColumnIds = new Set(
            affectedForeignKeys.flatMap((foreignKey) => foreignKey.columnIds),
          );

          const affectedForeignKeyIds = new Set(
            affectedForeignKeys.map((foreignKey) => foreignKey.id),
          );

          return {
            ...table,
            columns: table.columns.filter((column) => !foreignColumnIds.has(column.id)),
            foreignKeys: table.foreignKeys.filter(
              (foreignKey) => !affectedForeignKeyIds.has(foreignKey.id),
            ),
          };
        });
      }

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            tables,
            diagnostics: [],
          },
        },
      });
    });
  },

  removeLogicalColumn: (tableId, columnId) => {
    set((state) => {
      const sourceTable = state.logicalWorkspace.model.tables.find((table) => table.id === tableId);

      const removedColumn = sourceTable?.columns.find((column) => column.id === columnId);

      if (!sourceTable || !removedColumn) {
        return state;
      }

      let tables = state.logicalWorkspace.model.tables.map((table) => {
        if (table.id !== tableId) {
          return table;
        }

        const removedForeignKeys = table.foreignKeys.filter((foreignKey) =>
          foreignKey.columnIds.includes(columnId),
        );

        const removedForeignKeyIds = new Set(removedForeignKeys.map((foreignKey) => foreignKey.id));

        const foreignColumnIds = new Set(
          removedForeignKeys.flatMap((foreignKey) => foreignKey.columnIds),
        );

        foreignColumnIds.add(columnId);

        return {
          ...table,
          columns: table.columns.filter((column) => !foreignColumnIds.has(column.id)),
          foreignKeys: table.foreignKeys.filter(
            (foreignKey) => !removedForeignKeyIds.has(foreignKey.id),
          ),
        };
      });

      if (removedColumn.primaryKey) {
        tables = tables.map((table) => {
          const affectedForeignKeys = table.foreignKeys.filter(
            (foreignKey) =>
              foreignKey.referencedTableId === tableId &&
              foreignKey.referencedColumnIds.includes(columnId),
          );

          if (affectedForeignKeys.length === 0) {
            return table;
          }

          const affectedForeignKeyIds = new Set(
            affectedForeignKeys.map((foreignKey) => foreignKey.id),
          );

          const foreignColumnIds = new Set(
            affectedForeignKeys.flatMap((foreignKey) => foreignKey.columnIds),
          );

          return {
            ...table,
            columns: table.columns.filter((column) => !foreignColumnIds.has(column.id)),
            foreignKeys: table.foreignKeys.filter(
              (foreignKey) => !affectedForeignKeyIds.has(foreignKey.id),
            ),
          };
        });
      }

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            tables,
            diagnostics: [],
          },
        },
      });
    });
  },

  addLogicalForeignKey: (sourceTableId, referencedTableId) => {
    if (sourceTableId === referencedTableId) {
      return;
    }

    set((state) => {
      const sourceTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === sourceTableId,
      );

      const referencedTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === referencedTableId,
      );

      if (!sourceTable || !referencedTable) {
        return state;
      }

      const referencedColumns = referencedTable.columns.filter((column) => column.primaryKey);

      if (referencedColumns.length === 0) {
        return state;
      }

      const foreignColumns = referencedColumns.map((column) =>
        createForeignKeyColumn(referencedTable, column),
      );

      const foreignKey: LogicalForeignKey = {
        id: createId('logical-foreign-key'),
        columnIds: foreignColumns.map((column) => column.id),
        referencedTableId,
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

      const tables = state.logicalWorkspace.model.tables.map((table) => {
        if (table.id !== sourceTableId) {
          return table;
        }

        return {
          ...table,
          columns: [...table.columns, ...foreignColumns],
          foreignKeys: [...table.foreignKeys, foreignKey],
        };
      });

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            tables,
            diagnostics: [],
          },
        },
      });
    });
  },

  removeLogicalForeignKey: (sourceTableId, foreignKeyId) => {
    set((state) => {
      const sourceTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === sourceTableId,
      );

      if (!sourceTable) {
        return state;
      }

      const foreignKey = sourceTable.foreignKeys.find((item) => item.id === foreignKeyId);

      if (!foreignKey) {
        return state;
      }

      const foreignColumnIds = new Set(foreignKey.columnIds);

      const tables = state.logicalWorkspace.model.tables.map((table) => {
        if (table.id !== sourceTableId) {
          return table;
        }

        return {
          ...table,
          columns: table.columns.filter((column) => !foreignColumnIds.has(column.id)),
          foreignKeys: table.foreignKeys.filter((item) => item.id !== foreignKeyId),
        };
      });

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            tables,
            diagnostics: [],
          },
        },
      });
    });
  },

  updateLogicalForeignKeyCardinality: (sourceTableId, foreignKeyId, side, cardinality) => {
    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            ...state.logicalWorkspace.model,
            diagnostics: [],
            tables: state.logicalWorkspace.model.tables.map((table) => {
              if (table.id !== sourceTableId) {
                return table;
              }

              return {
                ...table,
                foreignKeys: table.foreignKeys.map((foreignKey) => {
                  if (foreignKey.id !== foreignKeyId) {
                    return foreignKey;
                  }

                  return side === 'source'
                    ? {
                        ...foreignKey,
                        sourceCardinality: cardinality,
                      }
                    : {
                        ...foreignKey,
                        referencedCardinality: cardinality,
                      };
                }),
              };
            }),
          },
        },
      }),
    );
  },

  replaceLogicalTable: (tableId, nextTable) => {
    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            ...state.logicalWorkspace.model,
            diagnostics: [],
            tables: state.logicalWorkspace.model.tables.map((table) =>
              table.id === tableId ? nextTable : table,
            ),
          },
        },
      }),
    );
  },
});
