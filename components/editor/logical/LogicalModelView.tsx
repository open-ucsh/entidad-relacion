'use client';

import { AlertTriangle, Database, Info, Plus, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import type { LogicalTablePosition } from '@/domain/logical/models';
import { useDiagramStore } from '@/state/diagram/store';

import { LogicalRelationsLayer } from './LogicalRelationsLayer';
import { LogicalTableCard } from './LogicalTableCard';

interface LogicalModelViewProps {
  diagram: Diagram;
}

const DEFAULT_POSITION: LogicalTablePosition = {
  x: 48,
  y: 48,
};

const MIN_CANVAS_WIDTH = 1200;
const MIN_CANVAS_HEIGHT = 800;
const TABLE_WIDTH = 288;
const TABLE_ESTIMATED_HEIGHT = 360;
const CANVAS_PADDING = 200;
const TOOLBAR_HEIGHT = 64;

export function LogicalModelView({ diagram }: LogicalModelViewProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const generateLogicalModel = useDiagramStore((state) => state.generateLogicalModel);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const model = workspace.model;

  const positionedTables = model.tables.map((table) => ({
    table,
    position: workspace.positions[table.id] ?? DEFAULT_POSITION,
  }));

  const canvasWidth = Math.max(
    MIN_CANVAS_WIDTH,
    ...positionedTables.map(({ position }) => position.x + TABLE_WIDTH + CANVAS_PADDING),
  );

  const canvasHeight = Math.max(
    MIN_CANVAS_HEIGHT,
    ...positionedTables.map(({ position }) => position.y + TABLE_ESTIMATED_HEIGHT + CANVAS_PADDING),
  );

  const errorCount = model.diagnostics.filter(
    (diagnostic) => diagnostic.severity === 'error',
  ).length;

  const warningCount = model.diagnostics.length - errorCount;

  const hasConceptualModel = diagram.entities.length > 0 || diagram.relationships.length > 0;

  return (
    <main className="relative h-full min-h-0 overflow-auto bg-surface">
      <div
        className="relative min-h-full"
        style={{
          minWidth: canvasWidth,
          minHeight: canvasHeight + TOOLBAR_HEIGHT,
          backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <header className="sticky left-0 top-0 z-40 flex h-16 min-w-full items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="mr-2 hidden items-center gap-2 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface">
                <Database size={15} className="text-brand-primary" aria-hidden="true" />
              </span>

              <div>
                <p className="text-xs font-semibold text-text">Modelo lógico</p>

                <p className="text-[10px] text-text-muted">
                  {model.tables.length === 1 ? '1 tabla' : `${model.tables.length} tablas`}
                </p>
              </div>
            </div>

            <span className="mx-1 hidden h-6 w-px bg-border sm:block" />

            <button
              type="button"
              onClick={() => {
                addLogicalTable();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
            >
              <Plus size={14} aria-hidden="true" />
              Nueva tabla
            </button>

            <button
              type="button"
              disabled={!hasConceptualModel}
              onClick={generateLogicalModel}
              title={
                hasConceptualModel ? 'Regenerar desde el modelo ER' : 'Crea primero un modelo ER'
              }
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Generar desde ER
            </button>
          </div>

          {model.diagnostics.length > 0 && (
            <div className="flex items-center gap-2">
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-600">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {errorCount}
                </span>
              )}

              {warningCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-600">
                  <Info size={12} aria-hidden="true" />
                  {warningCount}
                </span>
              )}
            </div>
          )}
        </header>

        {model.tables.length === 0 ? (
          <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-8">
            <div className="flex max-w-md flex-col items-center text-center">
              <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                <Database size={23} className="text-brand-primary" aria-hidden="true" />
              </span>

              <h2 className="text-base font-semibold text-text">Construye tu modelo lógico</h2>

              <p className="mt-2 text-sm leading-6 text-text-muted">
                Crea las tablas manualmente o transforma tu modelo entidad-relación.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addLogicalTable();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
                >
                  <Plus size={15} aria-hidden="true" />
                  Crear tabla
                </button>

                <button
                  type="button"
                  disabled={!hasConceptualModel}
                  onClick={generateLogicalModel}
                  className="flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Generar desde ER
                </button>
              </div>

              {!hasConceptualModel && (
                <p className="mt-3 text-xs text-text-muted">
                  También puedes comenzar completamente desde cero creando una tabla.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="absolute left-0"
            style={{
              top: TOOLBAR_HEIGHT,
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
            <LogicalRelationsLayer
              tables={model.tables}
              positions={workspace.positions}
              containerRef={canvasRef}
            />

            {positionedTables.map(({ table, position }) => (
              <LogicalTableCard key={table.id} table={table} position={position} />
            ))}
          </div>
        )}

        {model.diagnostics.length > 0 && (
          <section className="fixed bottom-5 right-5 z-50 max-h-72 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-xs font-semibold text-text">Diagnóstico</h2>

                <p className="mt-0.5 text-[10px] text-text-muted">Transformación ER → lógico</p>
              </div>

              <span className="rounded-md bg-surface px-2 py-1 text-[10px] font-medium text-text-muted">
                {model.diagnostics.length}
              </span>
            </header>

            <div className="max-h-56 divide-y divide-border overflow-y-auto">
              {model.diagnostics.map((diagnostic) => {
                const Icon = diagnostic.severity === 'error' ? AlertTriangle : Info;

                return (
                  <div key={diagnostic.id} className="flex items-start gap-3 px-4 py-3">
                    <Icon
                      size={14}
                      className={
                        diagnostic.severity === 'error'
                          ? 'mt-0.5 shrink-0 text-red-600'
                          : 'mt-0.5 shrink-0 text-amber-600'
                      }
                      aria-hidden="true"
                    />

                    <p className="text-xs leading-5 text-text-muted">{diagnostic.message}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
