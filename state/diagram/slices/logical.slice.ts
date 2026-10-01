import { createId } from '@/domain/diagram/lib/id';
import { createLogicalWorkspace } from '@/domain/logical/factories';
import type {
  LogicalColumn,
  LogicalForeignKey,
  LogicalRelationCardinality,
  LogicalTable,
  LogicalTablePosition,
  LogicalWorkspace,
} from '@/domain/logical/models';
import { transformDiagramToLogicalModel } from '@/domain/logical/transform';

import { appendDiagramActivity } from '../diagram-activity';
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
  usedNames: Set<string>,
): LogicalColumn {
  const baseName = `${normalizeLogicalName(
    referencedTable.name,
  )}_${normalizeLogicalName(referencedColumn.name)}`;

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

function formatCardinality(cardinality: LogicalRelationCardinality): string {
  return `${cardinality.minimum}..${cardinality.maximum}`;
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

      const diagram = appendDiagramActivity(
        state.diagram,
        'element-created',
        `Creó la tabla ${table.name}`,
      );

      return replaceActiveDiagram(state, diagram, {
        logicalWorkspace,
      });
    });
  },

  removeLogicalTable: (tableId) => {
    set((state) => {
      const removedTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === tableId,
      );

      if (!removedTable) {
        return state;
      }

      const tables = state.logicalWorkspace.model.tables
        .filter((table) => table.id !== tableId)
        .map((table) => removeForeignKeysReferencingTable(table, tableId));

      const positions = Object.fromEntries(
        Object.entries(state.logicalWorkspace.positions).filter(([id]) => id !== tableId),
      );

      const diagram = appendDiagramActivity(
        state.diagram,
        'elements-removed',
        `Eliminó la tabla ${removedTable.name}`,
      );

      return replaceActiveDiagram(state, diagram, {
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

    set((state) => {
      const currentTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === tableId,
      );

      if (!currentTable || currentTable.name === trimmedName) {
        return state;
      }

      const diagram = appendDiagramActivity(
        state.diagram,
        'element-renamed',
        `Renombró la tabla ${currentTable.name} a ${trimmedName}`,
      );

      return replaceActiveDiagram(state, diagram, {
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
      });
    });
  },

  moveLogicalTable: (tableId, position, options = {}) => {
    set((state) => {
      const recordHistory = options.recordHistory ?? false;

      if (!recordHistory) {
        return replaceActiveDiagram(state, state.diagram, {
          logicalWorkspace: {
            ...state.logicalWorkspace,
            positions: {
              ...state.logicalWorkspace.positions,
              [tableId]: position,
            },
          },
          recordHistory: false,
        });
      }

      const historyPosition = options.historyPosition;

      const table = state.logicalWorkspace.model.tables.find(
        (candidate) => candidate.id === tableId,
      );

      if (!table) {
        return state;
      }

      const diagram = appendDiagramActivity(
        state.diagram,
        'elements-moved',
        `Movió la tabla ${table.name}`,
      );

      if (!historyPosition) {
        return replaceActiveDiagram(state, diagram, {
          logicalWorkspace: {
            ...state.logicalWorkspace,
            positions: {
              ...state.logicalWorkspace.positions,
              [tableId]: position,
            },
          },
        });
      }

      const logicalWorkspaceBeforeMove: LogicalWorkspace = {
        ...state.logicalWorkspace,
        positions: {
          ...state.logicalWorkspace.positions,
          [tableId]: historyPosition,
        },
      };

      const currentWorkspace = state.logicalWorkspace;

      return replaceActiveDiagram(
        {
          ...state,
          logicalWorkspace: logicalWorkspaceBeforeMove,
        },
        diagram,
        {
          logicalWorkspace: {
            ...currentWorkspace,
            positions: {
              ...currentWorkspace.positions,
              [tableId]: position,
            },
          },
        },
      );
    });
  },

  addLogicalColumn: (tableId, name = 'nueva_columna') => {
    set((state) => {
      const table = state.logicalWorkspace.model.tables.find(
        (candidate) => candidate.id === tableId,
      );

      if (!table) {
        return state;
      }

      const column = createLogicalColumn(name);

      const diagram = appendDiagramActivity(
        state.diagram,
        'element-created',
        `Creó la columna ${column.name} en ${table.name}`,
      );

      return replaceActiveDiagram(state, diagram, {
        logicalWorkspace: {
          ...state.logicalWorkspace,
          origin: 'manual',
          model: {
            ...state.logicalWorkspace.model,
            diagnostics: [],
            tables: state.logicalWorkspace.model.tables.map((candidate) =>
              candidate.id === tableId
                ? {
                    ...candidate,
                    columns: [...candidate.columns, column],
                  }
                : candidate,
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

      const nextPrimaryKey = updates.primaryKey ?? currentColumn.primaryKey;

      const nextColumn: LogicalColumn = {
        ...currentColumn,
        ...updates,
        primaryKey: nextPrimaryKey,
        nullable: nextPrimaryKey ? false : (updates.nullable ?? currentColumn.nullable),
      };

      const hasChanged =
        nextColumn.name !== currentColumn.name ||
        nextColumn.primaryKey !== currentColumn.primaryKey ||
        nextColumn.nullable !== currentColumn.nullable ||
        nextColumn.unique !== currentColumn.unique;

      if (!hasChanged) {
        return state;
      }

      let activityDetails: string | null = null;

      if (updates.name !== undefined && updates.name !== currentColumn.name) {
        activityDetails = `Renombró la columna ${currentColumn.name} a ${updates.name} en ${currentTable.name}`;
      } else if (
        updates.primaryKey !== undefined &&
        updates.primaryKey !== currentColumn.primaryKey
      ) {
        activityDetails = updates.primaryKey
          ? `Marcó ${currentColumn.name} como clave primaria en ${currentTable.name}`
          : `Quitó la clave primaria de ${currentColumn.name} en ${currentTable.name}`;
      } else if (updates.unique !== undefined && updates.unique !== currentColumn.unique) {
        activityDetails = updates.unique
          ? `Marcó ${currentColumn.name} como UNIQUE en ${currentTable.name}`
          : `Quitó UNIQUE de ${currentColumn.name} en ${currentTable.name}`;
      } else if (updates.nullable !== undefined && updates.nullable !== currentColumn.nullable) {
        activityDetails = updates.nullable
          ? `Permitió NULL en ${currentColumn.name} de ${currentTable.name}`
          : `Deshabilitó NULL en ${currentColumn.name} de ${currentTable.name}`;
      }

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

      const diagram = activityDetails
        ? appendDiagramActivity(state.diagram, 'element-updated', activityDetails)
        : state.diagram;

      return replaceActiveDiagram(state, diagram, {
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

      const diagram = appendDiagramActivity(
        state.diagram,
        'elements-removed',
        `Eliminó la columna ${removedColumn.name} de ${sourceTable.name}`,
      );

      return replaceActiveDiagram(state, diagram, {
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

      const usedNames = new Set(
        sourceTable.columns.map((column) => column.name.trim().toLowerCase()),
      );

      const foreignColumns = referencedColumns.map((column) =>
        createForeignKeyColumn(referencedTable, column, usedNames),
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

      const diagram = appendDiagramActivity(
        state.diagram,
        'connection-created',
        `Creó una relación de ${sourceTable.name} con ${referencedTable.name}`,
      );

      return replaceActiveDiagram(state, diagram, {
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

      const referencedTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === foreignKey.referencedTableId,
      );

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

      const diagram = appendDiagramActivity(
        state.diagram,
        'connection-updated',
        `Eliminó la relación de ${sourceTable.name} con ${referencedTable?.name ?? 'tabla'}`,
      );

      return replaceActiveDiagram(state, diagram, {
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
    set((state) => {
      const sourceTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === sourceTableId,
      );

      const foreignKey = sourceTable?.foreignKeys.find(
        (candidate) => candidate.id === foreignKeyId,
      );

      if (!sourceTable || !foreignKey) {
        return state;
      }

      const currentCardinality =
        side === 'source' ? foreignKey.sourceCardinality : foreignKey.referencedCardinality;

      if (
        currentCardinality.minimum === cardinality.minimum &&
        currentCardinality.maximum === cardinality.maximum
      ) {
        return state;
      }

      const referencedTable = state.logicalWorkspace.model.tables.find(
        (table) => table.id === foreignKey.referencedTableId,
      );

      const diagram = appendDiagramActivity(
        state.diagram,
        'connection-updated',
        `Cambió la cardinalidad ${
          side === 'source' ? sourceTable.name : (referencedTable?.name ?? 'referenciada')
        } de ${formatCardinality(currentCardinality)} a ${formatCardinality(cardinality)}`,
      );

      return replaceActiveDiagram(state, diagram, {
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
                foreignKeys: table.foreignKeys.map((candidate) => {
                  if (candidate.id !== foreignKeyId) {
                    return candidate;
                  }

                  return side === 'source'
                    ? {
                        ...candidate,
                        sourceCardinality: cardinality,
                      }
                    : {
                        ...candidate,
                        referencedCardinality: cardinality,
                      };
                }),
              };
            }),
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
