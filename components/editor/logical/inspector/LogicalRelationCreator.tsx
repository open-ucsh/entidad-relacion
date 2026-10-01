'use client';

import { ArrowRight, Link2, Plus } from 'lucide-react';
import { useState } from 'react';

import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

import {
  CARDINALITY_OPTIONS,
  getCardinality,
  getCardinalityValue,
  type CardinalityValue,
} from '../table/relations/cardinality';

interface LogicalRelationCreatorProps {
  table: LogicalTable;
  tables: LogicalTable[];
  onCreate: (
    referencedTableId: string,
    cardinalities: {
      source: LogicalRelationCardinality;
      referenced: LogicalRelationCardinality;
    },
  ) => void;
}

const DEFAULT_SOURCE_CARDINALITY: LogicalRelationCardinality = {
  minimum: 0,
  maximum: 'N',
};

const DEFAULT_REFERENCED_CARDINALITY: LogicalRelationCardinality = {
  minimum: 1,
  maximum: 1,
};

export function LogicalRelationCreator({ table, tables, onCreate }: LogicalRelationCreatorProps) {
  const [referencedTableId, setReferencedTableId] = useState('');

  const [sourceCardinality, setSourceCardinality] = useState<LogicalRelationCardinality>(
    DEFAULT_SOURCE_CARDINALITY,
  );

  const [referencedCardinality, setReferencedCardinality] = useState<LogicalRelationCardinality>(
    DEFAULT_REFERENCED_CARDINALITY,
  );

  const availableTables = tables.filter(
    (candidate) =>
      candidate.id !== table.id && candidate.columns.some((column) => column.primaryKey),
  );

  if (availableTables.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="text-xs leading-relaxed text-text-muted">
          Para crear una relación necesitas otra tabla con una clave primaria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-3 flex items-center gap-2">
        <Link2 size={13} className="text-brand-primary" aria-hidden="true" />

        <p className="text-xs font-semibold text-text">Nueva relación</p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Tabla relacionada
        </span>

        <select
          value={referencedTableId}
          className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-xs text-text outline-none transition-colors focus:border-brand-primary"
          onChange={(event) => {
            setReferencedTableId(event.target.value);
          }}
        >
          <option value="">Seleccionar tabla…</option>

          {availableTables.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Cardinalidad
        </p>

        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block truncate text-[10px] font-medium text-text-muted">
              {table.name}
            </span>

            <select
              aria-label={`Cardinalidad de ${table.name}`}
              value={getCardinalityValue(sourceCardinality)}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-text outline-none focus:border-brand-primary"
              onChange={(event) => {
                setSourceCardinality(getCardinality(event.target.value as CardinalityValue));
              }}
            >
              {CARDINALITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <ArrowRight size={13} className="mb-2.5 shrink-0 text-text-muted" aria-hidden="true" />

          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block truncate text-[10px] font-medium text-text-muted">
              {tables.find((candidate) => candidate.id === referencedTableId)?.name ?? 'Destino'}
            </span>

            <select
              aria-label="Cardinalidad de la tabla relacionada"
              value={getCardinalityValue(referencedCardinality)}
              className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-text outline-none focus:border-brand-primary"
              onChange={(event) => {
                setReferencedCardinality(getCardinality(event.target.value as CardinalityValue));
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
      </div>

      <button
        type="button"
        disabled={!referencedTableId}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          if (!referencedTableId) {
            return;
          }

          onCreate(referencedTableId, {
            source: sourceCardinality,
            referenced: referencedCardinality,
          });

          setReferencedTableId('');
          setSourceCardinality(DEFAULT_SOURCE_CARDINALITY);
          setReferencedCardinality(DEFAULT_REFERENCED_CARDINALITY);
        }}
      >
        <Plus size={13} aria-hidden="true" />
        Crear relación
      </button>
    </div>
  );
}
