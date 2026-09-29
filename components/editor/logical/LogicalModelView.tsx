'use client';

import { AlertTriangle, Database, Info, Plus, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

import type { Diagram } from '@/domain/diagram/models';
import { useDiagramStore } from '@/state/diagram/store';

import { LogicalRelationsLayer } from './LogicalRelationsLayer';
import { LogicalTableCard } from './LogicalTableCard';

interface LogicalModelViewProps {
  diagram: Diagram;
}

export function LogicalModelView({}: LogicalModelViewProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const workspace = useDiagramStore((state) => state.logicalWorkspace);

  const generateLogicalModel = useDiagramStore((state) => state.generateLogicalModel);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const model = workspace.model;

  return (
    <main className="h-full min-h-0 overflow-auto bg-surface">
      <div
        className="min-h-full px-8 pb-16 pt-24"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {workspace.origin === 'generated'
                  ? 'Generado desde el modelo ER'
                  : 'Modelo lógico manual'}
              </p>
            </div>

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
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
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
          ) : (
            <div ref={canvasRef} className="relative">
              <LogicalRelationsLayer tables={model.tables} containerRef={canvasRef} />

              <div className="relative z-20 grid grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] items-start gap-x-24 gap-y-28">
                {model.tables.map((table) => (
                  <LogicalTableCard key={table.id} table={table} />
                ))}
              </div>
            </div>
          )}

          {model.diagnostics.length > 0 && (
            <section className="mt-10 rounded-xl border border-border bg-background shadow-sm">
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
      </div>
    </main>
  );
}
