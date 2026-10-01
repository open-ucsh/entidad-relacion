'use client';

import { ArrowLeft, ArrowRight, KeyRound, Link2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

import { ConfirmDialog } from '../../feedback/ConfirmDialog';
import {
  CARDINALITY_OPTIONS,
  getCardinality,
  getCardinalityValue,
  type CardinalityValue,
} from '../table/relations/cardinality';

interface LogicalRelationInspectorProps {
  sourceTable: LogicalTable;
  referencedTable: LogicalTable;
  foreignKey: LogicalTable['foreignKeys'][number];
  onBack: () => void;
  onSelectTable: (tableId: string) => void;
  onUpdateCardinality: (
    side: 'source' | 'referenced',
    cardinality: LogicalRelationCardinality,
  ) => void;
  onRemove: () => void;
}

export function LogicalRelationInspector({
  sourceTable,
  referencedTable,
  foreignKey,
  onBack,
  onSelectTable,
  onUpdateCardinality,
  onRemove,
}: LogicalRelationInspectorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pairs = foreignKey.columnIds.map((columnId, index) => ({
    source: sourceTable.columns.find((column) => column.id === columnId),
    referenced: referencedTable.columns.find(
      (column) => column.id === foreignKey.referencedColumnIds[index],
    ),
  }));

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
            <Link2 size={15} className="text-brand-primary" aria-hidden="true" />

            <h2 className="text-sm font-semibold text-text">Relación</h2>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-2.5 py-2 text-xs font-semibold text-text transition-colors hover:border-brand-primary/40"
              onClick={() => {
                onSelectTable(sourceTable.id);
              }}
            >
              {sourceTable.name}
            </button>

            <ArrowRight size={14} className="shrink-0 text-text-muted" aria-hidden="true" />

            <button
              type="button"
              className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-2.5 py-2 text-xs font-semibold text-text transition-colors hover:border-brand-primary/40"
              onClick={() => {
                onSelectTable(referencedTable.id);
              }}
            >
              {referencedTable.name}
            </button>
          </div>
        </header>

        <section className="border-b border-border p-3">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Cardinalidad
          </p>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text">{sourceTable.name}</span>

              <select
                value={getCardinalityValue(foreignKey.sourceCardinality)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-text outline-none focus:border-brand-primary"
                onChange={(event) => {
                  onUpdateCardinality(
                    'source',
                    getCardinality(event.target.value as CardinalityValue),
                  );
                }}
              >
                {CARDINALITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text">
                {referencedTable.name}
              </span>

              <select
                value={getCardinalityValue(foreignKey.referencedCardinality)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-text outline-none focus:border-brand-primary"
                onChange={(event) => {
                  onUpdateCardinality(
                    'referenced',
                    getCardinality(event.target.value as CardinalityValue),
                  );
                }}
              >
                {CARDINALITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="border-b border-border p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Columnas
          </p>

          <div className="space-y-1.5">
            {pairs.map((pair, index) => (
              <div
                key={`${foreignKey.id}:${index}`}
                className="rounded-lg border border-border bg-background p-2.5"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate font-medium text-text">
                    {pair.source?.name ?? 'Columna eliminada'}
                  </span>

                  <ArrowRight size={12} className="shrink-0 text-text-muted" aria-hidden="true" />

                  <span className="flex min-w-0 flex-1 items-center justify-end gap-1 truncate font-medium text-text">
                    <KeyRound size={11} className="shrink-0 text-amber-600" aria-hidden="true" />

                    <span className="truncate">{pair.referenced?.name ?? 'Columna eliminada'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
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
            Eliminar relación
          </button>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Eliminar relación"
        description={`Se eliminará la relación entre "${sourceTable.name}" y "${referencedTable.name}", junto con las columnas foráneas generadas por ella.`}
        confirmLabel="Eliminar relación"
        onCancel={() => {
          setConfirmDelete(false);
        }}
        onConfirm={() => {
          setConfirmDelete(false);
          onRemove();
        }}
      />
    </>
  );
}
