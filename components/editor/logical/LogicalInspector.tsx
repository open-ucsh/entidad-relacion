'use client';

import { useDiagramStore } from '@/state/diagram/store';
import { LogicalColumnProperties } from './LogicalColumnProperties';

import { LogicalModelSummary } from './inspector/LogicalModelSummary';
import { LogicalRelationInspector } from './inspector/LogicalRelationInspector';
import { LogicalTableInspector } from './inspector/LogicalTableInspector';
import { useLogicalSelectionStore } from './logical-selection';

export function LogicalInspector() {
  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);
  const removeLogicalTable = useDiagramStore((state) => state.removeLogicalTable);
  const renameLogicalTable = useDiagramStore((state) => state.renameLogicalTable);

  const addLogicalColumn = useDiagramStore((state) => state.addLogicalColumn);
  const updateLogicalColumn = useDiagramStore((state) => state.updateLogicalColumn);
  const removeLogicalColumn = useDiagramStore((state) => state.removeLogicalColumn);

  const addLogicalForeignKey = useDiagramStore((state) => state.addLogicalForeignKey);
  const removeLogicalForeignKey = useDiagramStore((state) => state.removeLogicalForeignKey);

  const updateLogicalForeignKeyCardinality = useDiagramStore(
    (state) => state.updateLogicalForeignKeyCardinality,
  );

  const selection = useLogicalSelectionStore((state) => state.selection);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  const tables = workspace.model.tables;

  function handleCreateTable() {
    const previousIds = new Set(
      useDiagramStore.getState().logicalWorkspace.model.tables.map((table) => table.id),
    );

    addLogicalTable();

    const createdTable = useDiagramStore
      .getState()
      .logicalWorkspace.model.tables.find((table) => !previousIds.has(table.id));

    if (createdTable) {
      setSelection({
        type: 'table',
        tableId: createdTable.id,
      });
    }
  }

  if (selection?.type === 'table') {
    const table = tables.find((candidate) => candidate.id === selection.tableId);

    if (table) {
      const column = table.columns.find((candidate) => candidate.id === selection.columnId);

      if (column) {
        return (
          <LogicalColumnProperties
            key={`${table.id}:${column.id}`}
            table={table}
            column={column}
            tables={tables}
          />
        );
      }

      return (
        <LogicalTableInspector
          key={table.id}
          table={table}
          tables={tables}
          onBack={() => {
            setSelection(null);
          }}
          onRename={(name) => {
            renameLogicalTable(table.id, name);
          }}
          onAddColumn={() => {
            addLogicalColumn(table.id);
          }}
          onUpdateColumn={(columnId, updates) => {
            updateLogicalColumn(table.id, columnId, updates);
          }}
          onRemoveColumn={(columnId) => {
            removeLogicalColumn(table.id, columnId);
          }}
          onCreateRelation={(referencedTableId, cardinalities) => {
            addLogicalForeignKey(table.id, referencedTableId, cardinalities);
          }}
          onSelectRelation={(sourceTableId, foreignKeyId) => {
            setSelection({
              type: 'relation',
              sourceTableId,
              foreignKeyId,
            });
          }}
          onRemoveTable={() => {
            setSelection(null);
            removeLogicalTable(table.id);
          }}
        />
      );
    }
  }

  if (selection?.type === 'relation') {
    const sourceTable = tables.find((table) => table.id === selection.sourceTableId);

    const foreignKey = sourceTable?.foreignKeys.find(
      (candidate) => candidate.id === selection.foreignKeyId,
    );

    const referencedTable = foreignKey
      ? tables.find((table) => table.id === foreignKey.referencedTableId)
      : undefined;

    if (sourceTable && foreignKey && referencedTable) {
      return (
        <LogicalRelationInspector
          key={`${sourceTable.id}:${foreignKey.id}`}
          sourceTable={sourceTable}
          referencedTable={referencedTable}
          foreignKey={foreignKey}
          onBack={() => {
            setSelection(null);
          }}
          onSelectTable={(tableId) => {
            setSelection({
              type: 'table',
              tableId,
            });
          }}
          onUpdateCardinality={(side, cardinality) => {
            updateLogicalForeignKeyCardinality(sourceTable.id, foreignKey.id, side, cardinality);
          }}
          onRemove={() => {
            setSelection(null);
            removeLogicalForeignKey(sourceTable.id, foreignKey.id);
          }}
        />
      );
    }
  }

  return (
    <LogicalModelSummary
      tables={tables}
      onSelectTable={(tableId) => {
        setSelection({
          type: 'table',
          tableId,
        });
      }}
      onCreateTable={handleCreateTable}
    />
  );
}
