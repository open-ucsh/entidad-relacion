'use client';

import { ArrowLeft, Link2, Plus, Table2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type {
  LogicalColumn,
  LogicalRelationCardinality,
  LogicalTable,
} from '@/domain/logical/models';

import { ConfirmDialog } from '../../feedback/ConfirmDialog';
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
  const [name, setName] = useState(table.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const foreignKeyColumnIds = new Set(
    table.foreignKeys.flatMap((foreignKey) => foreignKey.columnIds),
  );

  const incomingRelations = tables.flatMap((sourceTable) =>
    sourceTable.foreignKeys
      .filter((foreignKey) => foreignKey.referencedTableId === table.id)
      .map((foreignKey) => ({
        sourceTable,
        foreignKey,
      })),
  );

  function commitName() {
    const nextName = name.trim();

    if (!nextName) {
      setName(table.name);
      return;
    }

    if (nextName !== table.name) {
      onRename(nextName);
    }
  }

  const relationCount = table.foreignKeys.length + incomingRelations.length;

  return (
    <>
      <div className="h-full overflow-y-auto">
        <header className="border-b border-border p-3">
          <button
            type="button"
            className="mb-3 flex items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-text-muted transition-colors hover:text-text"
            onClick={onBack}
          >
            <ArrowLeft size={13} aria-hidden="true" />
            Modelo lógico
          </button>

          <div className="flex items-center gap-2">
            <Table2 size={15} className="shrink-0 text-brand-primary" aria-hidden="true" />

            <input
              value={name}
              aria-label="Nombre de la tabla"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-text outline-none"
              onChange={(event) => {
                setName(event.target.value);
              }}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }

                if (event.key === 'Escape') {
                  setName(table.name);
                  event.currentTarget.blur();
                }
              }}
            />
          </div>

          <p className="mt-1 pl-6 text-[11px] text-text-muted">
            {table.columns.length} columnas · {relationCount} relaciones
          </p>
        </header>

        <section className="border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Columnas
            </p>

            <button
              type="button"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10"
              onClick={onAddColumn}
            >
              <Plus size={12} aria-hidden="true" />
              Añadir
            </button>
          </div>

          {table.columns.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center">
              <p className="text-xs text-text-muted">Esta tabla todavía no tiene columnas.</p>

              <button
                type="button"
                className="mt-2 text-xs font-semibold text-brand-primary"
                onClick={onAddColumn}
              >
                Añadir primera columna
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {table.columns.map((column) => (
                <LogicalInspectorColumn
                  key={`${column.id}:${column.name}`}
                  column={column}
                  isForeignKey={foreignKeyColumnIds.has(column.id)}
                  onUpdate={(updates) => {
                    onUpdateColumn(column.id, updates);
                  }}
                  onRemove={() => {
                    onRemoveColumn(column.id);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="border-b border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <Link2 size={13} className="text-text-muted" aria-hidden="true" />

            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Relaciones
            </p>
          </div>

          {relationCount > 0 && (
            <div className="mb-3 space-y-1.5">
              {table.foreignKeys.map((foreignKey) => {
                const referencedTable = tables.find(
                  (candidate) => candidate.id === foreignKey.referencedTableId,
                );

                return (
                  <button
                    key={foreignKey.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-brand-primary/40 hover:bg-surface-hover"
                    onClick={() => {
                      onSelectRelation(table.id, foreignKey.id);
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-text">
                        {table.name} → {referencedTable?.name ?? 'Tabla eliminada'}
                      </span>

                      <span className="mt-0.5 block text-[10px] text-text-muted">
                        {foreignKey.sourceCardinality.minimum}..
                        {foreignKey.sourceCardinality.maximum}
                        {' → '}
                        {foreignKey.referencedCardinality.minimum}..
                        {foreignKey.referencedCardinality.maximum}
                      </span>
                    </span>

                    <span className="text-xs text-text-muted">›</span>
                  </button>
                );
              })}

              {incomingRelations.map(({ sourceTable, foreignKey }) => (
                <button
                  key={`${sourceTable.id}:${foreignKey.id}`}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-brand-primary/40 hover:bg-surface-hover"
                  onClick={() => {
                    onSelectRelation(sourceTable.id, foreignKey.id);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-text">
                      {sourceTable.name} → {table.name}
                    </span>

                    <span className="mt-0.5 block text-[10px] text-text-muted">
                      {foreignKey.sourceCardinality.minimum}..
                      {foreignKey.sourceCardinality.maximum}
                      {' → '}
                      {foreignKey.referencedCardinality.minimum}..
                      {foreignKey.referencedCardinality.maximum}
                    </span>
                  </span>

                  <span className="text-xs text-text-muted">›</span>
                </button>
              ))}
            </div>
          )}

          <LogicalRelationCreator table={table} tables={tables} onCreate={onCreateRelation} />
        </section>

        <section className="p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/25 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/10"
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            <Trash2 size={13} aria-hidden="true" />
            Eliminar tabla
          </button>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`Eliminar "${table.name}"`}
        description={
          relationCount > 0
            ? `La tabla tiene ${table.columns.length} columnas y ${relationCount} relaciones. Al eliminarla también se eliminarán las relaciones asociadas.`
            : `La tabla tiene ${table.columns.length} columnas. Esta acción eliminará la tabla del modelo lógico.`
        }
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
