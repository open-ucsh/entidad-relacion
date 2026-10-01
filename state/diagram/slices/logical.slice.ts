import { createLogicalWorkspace } from '@/domain/logical/factories';
import type { LogicalWorkspace } from '@/domain/logical/models';
import { transformDiagramToLogicalModel } from '@/domain/logical/transform';

import { replaceActiveDiagram } from '../diagram-documents';
import type { DiagramStoreSlice, LogicalSlice } from '../diagram-store.types';
import { applyLogicalOperation } from '../logical/logical-operation';
import {
  addColumn,
  addForeignKey,
  addTable,
  moveTable,
  removeColumn,
  removeForeignKey,
  removeTable,
  renameTable,
  replaceTable,
  updateColumn,
  updateForeignKeyCardinality,
} from '../logical/logical-operations';

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
    set((state) => applyLogicalOperation(state, addTable(state.logicalWorkspace, name)));
  },

  removeLogicalTable: (tableId) => {
    set((state) => applyLogicalOperation(state, removeTable(state.logicalWorkspace, tableId)));
  },

  renameLogicalTable: (tableId, name) => {
    set((state) =>
      applyLogicalOperation(state, renameTable(state.logicalWorkspace, tableId, name)),
    );
  },

  moveLogicalTable: (tableId, position, options = {}) => {
    set((state) => {
      const recordHistory = options.recordHistory ?? false;

      if (!recordHistory) {
        return applyLogicalOperation(state, moveTable(state.logicalWorkspace, tableId, position));
      }

      const table = state.logicalWorkspace.model.tables.find(
        (candidate) => candidate.id === tableId,
      );

      if (!table) {
        return state;
      }

      const historyPosition = options.historyPosition;

      if (!historyPosition) {
        return applyLogicalOperation(
          state,
          moveTable(state.logicalWorkspace, tableId, position, {
            recordHistory: true,
          }),
        );
      }

      const workspaceBeforeMove: LogicalWorkspace = {
        ...state.logicalWorkspace,
        positions: {
          ...state.logicalWorkspace.positions,
          [tableId]: historyPosition,
        },
      };

      const stateBeforeMove = {
        ...state,
        logicalWorkspace: workspaceBeforeMove,
      };

      return applyLogicalOperation(
        stateBeforeMove,
        moveTable(state.logicalWorkspace, tableId, position, {
          recordHistory: true,
        }),
      );
    });
  },

  addLogicalColumn: (tableId, name = 'nueva_columna') => {
    set((state) => applyLogicalOperation(state, addColumn(state.logicalWorkspace, tableId, name)));
  },

  updateLogicalColumn: (tableId, columnId, updates) => {
    set((state) =>
      applyLogicalOperation(
        state,
        updateColumn(state.logicalWorkspace, tableId, columnId, updates),
      ),
    );
  },

  removeLogicalColumn: (tableId, columnId) => {
    set((state) =>
      applyLogicalOperation(state, removeColumn(state.logicalWorkspace, tableId, columnId)),
    );
  },

  addLogicalForeignKey: (sourceTableId, referencedTableId, cardinalities) => {
    set((state) =>
      applyLogicalOperation(
        state,
        addForeignKey(state.logicalWorkspace, sourceTableId, referencedTableId, cardinalities),
      ),
    );
  },

  removeLogicalForeignKey: (sourceTableId, foreignKeyId) => {
    set((state) =>
      applyLogicalOperation(
        state,
        removeForeignKey(state.logicalWorkspace, sourceTableId, foreignKeyId),
      ),
    );
  },

  updateLogicalForeignKeyCardinality: (sourceTableId, foreignKeyId, side, cardinality) => {
    set((state) =>
      applyLogicalOperation(
        state,
        updateForeignKeyCardinality(
          state.logicalWorkspace,
          sourceTableId,
          foreignKeyId,
          side,
          cardinality,
        ),
      ),
    );
  },

  replaceLogicalTable: (tableId, nextTable) => {
    set((state) =>
      applyLogicalOperation(state, replaceTable(state.logicalWorkspace, tableId, nextTable)),
    );
  },
});
