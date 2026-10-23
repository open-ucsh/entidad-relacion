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

interface CardinalityFieldProps {
  tableName: string;
  cardinality: LogicalRelationCardinality;
  onChange: (cardinality: LogicalRelationCardinality) => void;
  singleOnly?: boolean;
  requiredOnly?: boolean;
}

function formatCardinality(cardinality: LogicalRelationCardinality): string {
  return `${cardinality.minimum}..${cardinality.maximum}`;
}

function getCardinalityDescription(cardinality: LogicalRelationCardinality): string {
  if (cardinality.minimum === 0 && cardinality.maximum === 1) {
    return 'Cero o uno';
  }

  if (cardinality.minimum === 1 && cardinality.maximum === 1) {
    return 'Exactamente uno';
  }

  if (cardinality.minimum === 0 && cardinality.maximum === 'N') {
    return 'Cero o muchos';
  }

  return 'Uno o muchos';
}

function CardinalityField({
  tableName,
  cardinality,
  onChange,
  singleOnly = false,
  requiredOnly = false,
}: CardinalityFieldProps) {
  return (
    <label className="block rounded-lg border border-border bg-background p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-semibold text-text">{tableName}</span>

        <span className="shrink-0 rounded-md bg-brand-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand-primary">
          {formatCardinality(cardinality)}
        </span>
      </div>

      <select
        value={getCardinalityValue(cardinality)}
        className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-xs text-text outline-none transition-colors focus:border-brand-primary"
        onChange={(event) => {
          const value = getCardinality(event.target.value as CardinalityValue);

          if ((singleOnly && value.maximum !== 1) || (requiredOnly && value.minimum === 0)) {
            return;
          }

          onChange(value);
        }}
      >
        {CARDINALITY_OPTIONS.map((option) => {
          const value = getCardinality(option.value);

          const disabled =
            (singleOnly && value.maximum !== 1) || (requiredOnly && value.minimum === 0);

          return (
            <option key={option.value} value={option.value} disabled={disabled}>
              {option.label}
            </option>
          );
        })}
      </select>

      <p className="mt-1.5 text-[10px] text-text-muted">{getCardinalityDescription(cardinality)}</p>

      {singleOnly && (
        <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
          Una clave foránea referencia como máximo una fila.
        </p>
      )}

      {requiredOnly && (
        <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
          Esta relación es obligatoria porque sus columnas forman parte de la clave primaria.
        </p>
      )}
    </label>
  );
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

  const foreignKeyContainsPrimaryKey = sourceTable.columns.some(
    (column) => column.primaryKey && foreignKey.columnIds.includes(column.id),
  );

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
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Cardinalidad
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
              Define cuántos registros pueden participar en cada extremo de la relación.
            </p>
          </div>

          <div className="space-y-2">
            <CardinalityField
              tableName={sourceTable.name}
              cardinality={foreignKey.sourceCardinality}
              onChange={(cardinality) => {
                onUpdateCardinality('source', cardinality);
              }}
            />

            <div className="flex justify-center">
              <ArrowRight size={13} className="rotate-90 text-text-muted" aria-hidden="true" />
            </div>

            <CardinalityField
              tableName={referencedTable.name}
              cardinality={foreignKey.referencedCardinality}
              singleOnly
              requiredOnly={foreignKeyContainsPrimaryKey}
              onChange={(cardinality) => {
                onUpdateCardinality('referenced', cardinality);
              }}
            />
          </div>
        </section>

        <section className="border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Clave foránea
            </p>

            <span className="text-[10px] text-text-muted">
              {pairs.length} {pairs.length === 1 ? 'columna' : 'columnas'}
            </span>
          </div>

          <div className="space-y-1.5">
            {pairs.map((pair, index) => (
              <div
                key={foreignKey.columnIds[index]}
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
        description={`Se eliminará la relación entre "${sourceTable.name}" y "${referencedTable.name}". Las columnas y sus restricciones se conservarán.`}
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
