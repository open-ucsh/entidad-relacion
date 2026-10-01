'use client';

import { Table2 } from 'lucide-react';

import { useDiagramStore } from '@/state/diagram/store';

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

  if (tables.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-background text-text-muted">
          <Table2 size={18} aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-text">Sin modelo lógico</p>

        <p className="mt-1 max-w-52 text-xs leading-relaxed text-text-muted">
          Crea una tabla o genera el modelo desde el diagrama ER.
        </p>

        <button
          type="button"
          className="mt-4 rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white"
          onClick={() => {
            addLogicalTable();
          }}
        >
          Crear tabla
        </button>
      </div>
    );
  }

  if (selection?.type === 'table') {
    const table = tables.find((candidate) => candidate.id === selection.tableId);

    if (table) {
      return (
        <LogicalTableInspector
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
      origin={workspace.origin}
      onSelectTable={(tableId) => {
        setSelection({
          type: 'table',
          tableId,
        });
      }}
      onCreateTable={() => {
        addLogicalTable();
      }}
    />
  );
}
