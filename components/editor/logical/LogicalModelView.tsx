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
  x: 40,
  y: 40,
};

const MIN_CANVAS_WIDTH = 1200;
const MIN_CANVAS_HEIGHT = 800;
const TABLE_WIDTH = 288;
const TABLE_ESTIMATED_HEIGHT = 320;
const CANVAS_PADDING = 160;

export function LogicalModelView({}: LogicalModelViewProps) {
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

  return (
    <main className="h-full min-h-0 overflow-auto bg-surface">
      <div
        className="relative min-h-full"
        style={{
          minWidth: canvasWidth,
          minHeight: canvasHeight,
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="sticky left-0 top-0 z-40 flex min-w-full items-center justify-between gap-4 border-b border-border bg-surface/95 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                addLogicalTable();
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text shadow-sm transition-colors hover:bg-surface-hover"
            >
              <Plus size={14} aria-hidden="true" />
              Nueva tabla
            </button>

            <button
              type="button"
              onClick={generateLogicalModel}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Generar desde ER
            </button>
          </div>
        </div>

        {model.tables.length === 0 ? (
          <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-8">
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                <Database size={24} className="text-brand-primary" aria-hidden="true" />
              </span>

              <h2 className="text-lg font-semibold text-text">El modelo lógico está vacío</h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
                Puedes crear las tablas manualmente o generar automáticamente el modelo desde el
                diagrama ER.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addLogicalTable();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-text shadow-sm"
                >
                  <Plus size={15} aria-hidden="true" />
                  Crear tabla
                </button>

                <button
                  type="button"
                  onClick={generateLogicalModel}
                  className="flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Generar desde ER
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="absolute left-0 top-16"
            style={{
              width: canvasWidth,
              height: Math.max(MIN_CANVAS_HEIGHT, canvasHeight - 64),
            }}
          >
            <LogicalRelationsLayer tables={model.tables} containerRef={canvasRef} />

            {positionedTables.map(({ table, position }) => (
              <LogicalTableCard key={table.id} table={table} position={position} />
            ))}
          </div>
        )}

        {model.diagnostics.length > 0 && (
          <section className="fixed bottom-6 right-6 z-50 max-h-72 w-96 overflow-auto rounded-xl border border-border bg-background shadow-lg">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-text">Diagnóstico de transformación</h2>
            </header>

            <div className="divide-y divide-border">
              {model.diagnostics.map((diagnostic) => {
                const Icon = diagnostic.severity === 'error' ? AlertTriangle : Info;

                return (
                  <div key={diagnostic.id} className="flex items-start gap-3 px-4 py-3">
                    <Icon
                      size={16}
                      className={
                        diagnostic.severity === 'error'
                          ? 'mt-0.5 shrink-0 text-red-600'
                          : 'mt-0.5 shrink-0 text-amber-600'
                      }
                      aria-hidden="true"
                    />

                    <p className="text-sm leading-5 text-text-muted">{diagnostic.message}</p>
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
