'use client';

import { Link, Unlink } from 'lucide-react';

import type { LogicalTable } from '@/domain/logical/models';

import {
  CARDINALITY_OPTIONS,
  getCardinality,
  getCardinalityValue,
  type CardinalityValue,
} from './cardinality';

interface LogicalRelationItemProps {
  table: LogicalTable;
  referencedTable: LogicalTable | undefined;
  foreignKey: LogicalTable['foreignKeys'][number];
  onRemove: (tableId: string, foreignKeyId: string) => void;
  onUpdateCardinality: (
    tableId: string,
    foreignKeyId: string,
    side: 'source' | 'referenced',
    cardinality: ReturnType<typeof getCardinality>,
  ) => void;
}

export function LogicalRelationItem({
  table,
  referencedTable,
  foreignKey,
  onRemove,
  onUpdateCardinality,
}: LogicalRelationItemProps) {
  return (
    <div className="rounded-md border border-border bg-surface/40 p-2">
      <div className="flex min-w-0 items-center gap-2">
        <Link size={11} className="shrink-0 text-brand-primary" aria-hidden="true" />

        <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">
          {referencedTable?.name ?? 'Tabla eliminada'}
        </span>

        <button
          type="button"
          aria-label={`Eliminar relación con ${referencedTable?.name ?? 'tabla'}`}
          title="Eliminar relación"
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-600"
          onClick={() => {
            onRemove(table.id, foreignKey.id);
          }}
        >
          <Unlink size={11} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <select
          aria-label={`Cardinalidad de ${table.name}`}
          value={getCardinalityValue(foreignKey.sourceCardinality)}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-1.5 py-1 text-[10px] text-text outline-none focus:border-brand-primary"
          onChange={(event) => {
            onUpdateCardinality(
              table.id,
              foreignKey.id,
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

        <span className="shrink-0 text-[10px] text-text-muted">→</span>

        <select
          aria-label={`Cardinalidad de ${referencedTable?.name ?? 'tabla referenciada'}`}
          value={getCardinalityValue(foreignKey.referencedCardinality)}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-1.5 py-1 text-[10px] text-text outline-none focus:border-brand-primary"
          onChange={(event) => {
            onUpdateCardinality(
              table.id,
              foreignKey.id,
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
      </div>
    </div>
  );
}
