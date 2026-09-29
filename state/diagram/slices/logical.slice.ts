import { createId } from '@/domain/diagram/lib/id';
import { createLogicalWorkspace } from '@/domain/logical/factories';
import type { LogicalColumn, LogicalTable } from '@/domain/logical/models';
import { transformDiagramToLogicalModel } from '@/domain/logical/transform';

import { replaceActiveDiagram } from '../diagram-documents';
import type { DiagramStoreSlice, LogicalSlice } from '../diagram-store.types';

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

      const logicalWorkspace = {
        origin: 'manual' as const,
        model: {
          ...state.logicalWorkspace.model,
          diagnostics: [],
          tables: [...state.logicalWorkspace.model.tables, table],
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

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
          origin: 'manual',
          model: {
            tables,
            diagnostics: [],
          },
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

  addLogicalColumn: (tableId, name = 'nueva_columna') => {
    set((state) => {
      const column = createLogicalColumn(name);

      return replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
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

  replaceLogicalTable: (tableId, nextTable) => {
    set((state) =>
      replaceActiveDiagram(state, state.diagram, {
        logicalWorkspace: {
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
