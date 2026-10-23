'use client';

import { ArrowLeft, Link2, Plus, Table2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type {
  LogicalColumn,
  LogicalRelationCardinality,
  LogicalTable,
} from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { ConfirmDialog } from '../../feedback/ConfirmDialog';
import { useLogicalSelectionStore } from '../logical-selection';
import { LogicalRelationCreator } from './LogicalRelationCreator';

interface LogicalTableInspectorProps {
  table: LogicalTable;
  tables: LogicalTable[];
  onBack: () => void;
  onRename: (name: string) => void;
  onAddColumn: () => void;
  onUpdateColumn: (columnId: string, updates: Partial<LogicalColumn>) => void;
  onRemoveColumn: (columnId: string) => void;
  onCreateRelation: (
    referencedTableId: string,
    cardinalities: {
      source: LogicalRelationCardinality;
      referenced: LogicalRelationCardinality;
    },
  ) => void;
  onSelectRelation: (sourceTableId: string, foreignKeyId: string) => void;
  onRemoveTable: () => void;
}

export function LogicalTableInspector({
  table,
  tables,
  onBack,
  onRename,
  onAddColumn,
  onCreateRelation,
  onSelectRelation,
  onRemoveTable,
}: LogicalTableInspectorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selection = useLogicalSelectionStore((state) => state.selection);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  const showRelations =
    selection?.type === 'table' &&
    selection.tableId === table.id &&
    selection.section === 'relations';

  const relations = tables.flatMap((sourceTable) =>
    sourceTable.foreignKeys
      .filter(
        (foreignKey) => sourceTable.id === table.id || foreignKey.referencedTableId === table.id,
      )
      .map((foreignKey) => ({
        sourceTable,
        foreignKey,
        target: tables.find((candidate) => candidate.id === foreignKey.referencedTableId),
      })),
  );

  function addColumn() {
    const previousIds = new Set(table.columns.map((column) => column.id));
    onAddColumn();

    const created = useDiagramStore
      .getState()
      .logicalWorkspace.model.tables.find((candidate) => candidate.id === table.id)
      ?.columns.find((column) => !previousIds.has(column.id));

    if (created) {
      setSelection({ type: 'table', tableId: table.id, columnId: created.id });
    }
  }

  return (
    <>
      <div className="h-full overflow-y-auto overscroll-contain p-4">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <Table2 size={18} aria-hidden="true" />
          </span>
          <h2 className="flex-1 text-sm font-semibold text-text">
            {showRelations ? 'Relaciones' : 'Tabla'}
          </h2>
          <button
            type="button"
            onClick={onBack}
            aria-label="Todas las tablas"
            title="Todas las tablas"
            className="flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(true);
            }}
            aria-label={`Eliminar tabla ${table.name}`}
            title="Eliminar tabla"
            className="flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-text-muted">Nombre</span>
          <input
            key={`${table.id}:${table.name}`}
            defaultValue={table.name}
            maxLength={80}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            onBlur={(event) => {
              const name = event.currentTarget.value.trim();

              if (!name) {
                event.currentTarget.value = table.name;
              } else if (name !== table.name) {
                onRename(name);
              }
            }}
            onKeyDown={(event) => {
              event.stopPropagation();

              if (event.key === 'Enter') {
                event.preventDefault();
                event.currentTarget.blur();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                event.currentTarget.value = table.name;
                event.currentTarget.blur();
              }
            }}
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={addColumn}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border text-xs text-brand-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Plus size={14} aria-hidden="true" />
            Columna
          </button>
          <button
            type="button"
            aria-expanded={showRelations}
            onClick={() => {
              setSelection(
                showRelations
                  ? { type: 'table', tableId: table.id }
                  : { type: 'table', tableId: table.id, section: 'relations' },
              );
            }}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border text-xs text-brand-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Link2 size={14} aria-hidden="true" />
            Relaciones
          </button>
        </div>

        {showRelations && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {relations.map(({ sourceTable, foreignKey, target }) => (
              <button
                key={`${sourceTable.id}:${foreignKey.id}`}
                type="button"
                onClick={() => {
                  onSelectRelation(sourceTable.id, foreignKey.id);
                }}
                className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-brand-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <Link2 size={13} className="shrink-0" aria-hidden="true" />
                <span className="wrap-anywhere">
                  {sourceTable.name} → {target?.name ?? '?'}
                </span>
              </button>
            ))}
            <LogicalRelationCreator
              key={table.id}
              table={table}
              tables={tables}
              onCreate={onCreateRelation}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`Eliminar "${table.name}"`}
        description="Se eliminarán esta tabla y sus relaciones. Las columnas de otras tablas se conservarán."
        confirmLabel="Eliminar tabla"
        onCancel={() => {
          setConfirmDelete(false);
        }}
        onConfirm={() => {
          setConfirmDelete(false);
          onRemoveTable();
        }}
      />
    </>
  );
}
