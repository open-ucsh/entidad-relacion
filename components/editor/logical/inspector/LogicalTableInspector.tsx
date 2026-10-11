'use client';

import { ArrowLeft, KeyRound, Link2, Plus, Table2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type {
  LogicalColumn,
  LogicalRelationCardinality,
  LogicalTable,
} from '@/domain/logical/models';

import { ConfirmDialog } from '../../feedback/ConfirmDialog';
import { useLogicalSelectionStore } from '../logical-selection';
import { LogicalInspectorColumn } from './LogicalInspectorColumn';
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
  onUpdateColumn,
  onRemoveColumn,
  onCreateRelation,
  onSelectRelation,
  onRemoveTable,
}: LogicalTableInspectorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const cancelNameRef = useRef(false);

  const selection = useLogicalSelectionStore((state) => state.selection);
  const setSelection = useLogicalSelectionStore((state) => state.setSelection);

  const selectedColumnId =
    selection?.type === 'table' && selection.tableId === table.id ? selection.columnId : undefined;

  const selectedColumn =
    table.columns.find((column) => column.id === selectedColumnId) ?? table.columns[0];

  const foreignKeyColumnIds = new Set(
    table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds),
  );

  const outgoingRelations = table.foreignKeys.map((foreignKey) => ({
    sourceTable: table,
    foreignKey,
    referencedTable: tables.find((candidate) => candidate.id === foreignKey.referencedTableId),
  }));

  const incomingRelations = tables.flatMap((sourceTable) =>
    sourceTable.foreignKeys
      .filter(
        (foreignKey) => foreignKey.referencedTableId === table.id && sourceTable.id !== table.id,
      )
      .map((foreignKey) => ({
        sourceTable,
        foreignKey,
        referencedTable: table,
      })),
  );

  const relations = [...outgoingRelations, ...incomingRelations];

  function commitName(value: string) {
    if (cancelNameRef.current) {
      cancelNameRef.current = false;
      return;
    }

    const nextName = value.trim();

    if (!nextName) {
      if (nameRef.current) {
        nameRef.current.value = table.name;
      }
      return;
    }

    if (nextName !== table.name) {
      onRename(nextName);
    }
  }

  return (
    <>
      <div className="min-h-0 overflow-y-auto p-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex min-h-8 items-center gap-2 rounded-md text-xs text-text-muted hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Todas las tablas{' '}
        </button>

        <div className="mb-5 flex items-start gap-3">
          <Table2 size={22} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" />

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text wrap-anywhere">{table.name}</h2>
            <p className="mt-1 text-xs text-text-muted">Tabla seleccionada</p>
          </div>
        </div>

        <label className="mb-5 block">
          <span className="mb-2 block text-xs font-semibold text-text">Nombre</span>

          <input
            key={`${table.id}:${table.name}`}
            ref={nameRef}
            defaultValue={table.name}
            maxLength={80}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-text outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            onBlur={(event) => {
              commitName(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              event.stopPropagation();

              if (event.key === 'Enter') {
                event.preventDefault();
                event.currentTarget.blur();
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                cancelNameRef.current = true;
                event.currentTarget.value = table.name;
                event.currentTarget.blur();
              }
            }}
          />
        </label>

        <section>
          <h3 className="mb-2 text-xs font-semibold text-text">
            Columnas ({table.columns.length})
          </h3>

          <div className="space-y-1">
            {table.columns.map((column) => (
              <button
                key={column.id}
                type="button"
                aria-pressed={selectedColumn?.id === column.id}
                onClick={() => {
                  setSelection({
                    type: 'table',
                    tableId: table.id,
                    columnId: column.id,
                  });
                }}
                className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
                  selectedColumn?.id === column.id
                    ? 'border-brand-primary/25 bg-brand-primary/5'
                    : 'border-transparent hover:bg-surface'
                }`}
              >
                <span className="flex w-5 shrink-0 justify-center">
                  {column.primaryKey ? (
                    <KeyRound size={13} className="text-amber-600" aria-hidden="true" />
                  ) : foreignKeyColumnIds.has(column.id) ? (
                    <Link2 size={13} className="text-brand-primary" aria-hidden="true" />
                  ) : (
                    <span className="size-1 rounded-full bg-border" aria-hidden="true" />
                  )}
                </span>

                <span className="min-w-0 flex-1 text-xs text-text wrap-anywhere">
                  {column.name}
                </span>

                {column.primaryKey && (
                  <span className="rounded-md bg-amber-500/10 px-1.5 py-1 text-[9px] font-semibold text-amber-700">
                    PK
                  </span>
                )}

                {foreignKeyColumnIds.has(column.id) && (
                  <span className="rounded-md bg-brand-primary/10 px-1.5 py-1 text-[9px] font-semibold text-brand-primary">
                    FK
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddColumn}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-medium text-brand-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          >
            <Plus size={14} aria-hidden="true" />
            Agregar columna
          </button>
        </section>

        {selectedColumn && (
          <div className="mt-5 border-t border-border pt-4">
            <LogicalInspectorColumn
              key={`${table.id}:${selectedColumn.id}:${selectedColumn.name}`}
              column={selectedColumn}
              isForeignKey={foreignKeyColumnIds.has(selectedColumn.id)}
              onUpdate={(updates) => {
                onUpdateColumn(selectedColumn.id, updates);
              }}
              onRemove={() => {
                onRemoveColumn(selectedColumn.id);
              }}
            />
          </div>
        )}

        <details className="mt-5 border-t border-border pt-3">
          <summary className="cursor-pointer rounded-md py-2 text-xs font-semibold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40">
            Relaciones ({relations.length})
          </summary>

          <div className="mt-2 space-y-2">
            {relations.map(({ sourceTable, foreignKey, referencedTable }) => (
              <button
                key={`${sourceTable.id}:${foreignKey.id}`}
                type="button"
                onClick={() => {
                  onSelectRelation(sourceTable.id, foreignKey.id);
                }}
                className="block w-full rounded-lg border border-border p-2.5 text-left hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              >
                <span className="block text-xs font-medium text-text wrap-anywhere">
                  {sourceTable.name} → {referencedTable?.name ?? 'Tabla eliminada'}
                </span>

                <span className="mt-1 block text-[10px] text-text-muted">
                  {foreignKey.sourceCardinality.minimum}..
                  {foreignKey.sourceCardinality.maximum}
                  {' → '}
                  {foreignKey.referencedCardinality.minimum}..
                  {foreignKey.referencedCardinality.maximum}
                </span>
              </button>
            ))}

            <LogicalRelationCreator table={table} tables={tables} onCreate={onCreateRelation} />
          </div>
        </details>

        <button
          type="button"
          onClick={() => {
            setConfirmDelete(true);
          }}
          className="mt-4 flex min-h-9 items-center gap-2 rounded-md px-2 text-xs text-red-600 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
        >
          <Trash2 size={13} aria-hidden="true" />
          Eliminar tabla
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`Eliminar "${table.name}"`}
        description={`Se eliminarán la tabla, sus ${table.columns.length} columnas y sus ${relations.length} relaciones asociadas.`}
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
