'use client';

import { ArrowRight, Network, Plus, Table2 } from 'lucide-react';

interface LogicalCanvasEmptyStateProps {
  canGenerateFromEr: boolean;
  onCreateTable: () => void;
  onGenerateFromEr: () => void;
}

export function LogicalCanvasEmptyState({
  canGenerateFromEr,
  onCreateTable,
  onGenerateFromEr,
}: LogicalCanvasEmptyStateProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <Table2 size={20} aria-hidden="true" />
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-base font-semibold text-text">Modelo lógico</h2>

          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-text-muted">
            Convierte tu modelo entidad-relación en tablas o comienza un modelo lógico desde cero.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {canGenerateFromEr && (
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-3 text-left transition-colors hover:bg-brand-primary/10"
              onClick={onGenerateFromEr}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Network size={16} aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-text">
                  Generar desde modelo ER
                </span>

                <span className="mt-0.5 block text-[11px] leading-relaxed text-text-muted">
                  Transforma las entidades, atributos y relaciones actuales.
                </span>
              </span>

              <ArrowRight
                size={14}
                className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          )}

          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-surface-hover"
            onClick={onCreateTable}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-text">
              <Plus size={16} aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-text">Crear modelo vacío</span>

              <span className="mt-0.5 block text-[11px] leading-relaxed text-text-muted">
                Empieza manualmente creando tu primera tabla.
              </span>
            </span>

            <ArrowRight
              size={14}
              className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>

        {!canGenerateFromEr && (
          <p className="mt-4 text-center text-[10px] leading-relaxed text-text-muted">
            Cuando tu modelo ER tenga entidades o relaciones también podrás generarlo
            automáticamente.
          </p>
        )}
      </div>
    </div>
  );
}
