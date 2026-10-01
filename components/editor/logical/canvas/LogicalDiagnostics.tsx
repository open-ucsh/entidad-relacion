'use client';

import { AlertTriangle, Info } from 'lucide-react';

import type { LogicalDiagnostic } from '@/domain/logical/models';

interface LogicalDiagnosticsProps {
  diagnostics: LogicalDiagnostic[];
}

export function LogicalDiagnostics({ diagnostics }: LogicalDiagnosticsProps) {
  if (diagnostics.length === 0) {
    return null;
  }

  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length;

  const warningCount = diagnostics.length - errorCount;

  return (
    <section className="absolute bottom-5 right-5 z-40 max-h-72 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold text-text">Diagnóstico</h2>

          <p className="mt-0.5 text-[10px] text-text-muted">Transformación ER → lógico</p>
        </div>

        <div className="flex items-center gap-1.5">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-600">
              <AlertTriangle size={11} aria-hidden="true" />
              {errorCount}
            </span>
          )}

          {warningCount > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600">
              <Info size={11} aria-hidden="true" />
              {warningCount}
            </span>
          )}
        </div>
      </header>

      <div className="max-h-56 divide-y divide-border overflow-y-auto">
        {diagnostics.map((diagnostic) => {
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
  );
}
