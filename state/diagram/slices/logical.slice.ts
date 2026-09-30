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
        .map((table) => ({
          ...table,
          foreignKeys: table.foreignKeys.filter(
            (foreignKey) => foreignKey.referencedTableId !== tableId,
          ),
        }));

      const positions = Object.fromEntries(
        Object.entries(state.logicalWorkspace.positions).filter(([id]) => id !== tableId),
      );

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
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
                    columns: table.columns.map((column) =>
                      column.id === columnId
                        ? {
                            ...column,
                            ...updates,
                          }
                        : column,
                    ),
                  }
                : table,
            ),
          },
        },
      }),
    );
  },

  removeLogicalColumn: (tableId, columnId) => {
    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            ...state.logicalWorkspace.model,
            diagnostics: [],
            tables: state.logicalWorkspace.model.tables.map((table) => {
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
            }),
          },
        },
      }),
    );
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

      const alreadyExists = sourceTable.foreignKeys.some(
        (foreignKey) => foreignKey.referencedTableId === referencedTableId,
      );

      if (alreadyExists) {
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
