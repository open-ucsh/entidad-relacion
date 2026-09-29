'use client';

import { Database, RefreshCw, Table2 } from 'lucide-react';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { PanelHeader } from '@/components/ui';
import { useDiagramStore } from '@/state/diagram/store';

import type { ModelView } from '../logical/ModelViewSwitcher';
import { TOOL_GROUPS } from './tool-config';
import { ToolbarGroup } from './ToolbarGroup';

interface ToolbarProps {
  modelView: ModelView;
}

export function Toolbar({ modelView }: ToolbarProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const generateLogicalModel = useDiagramStore((state) => state.generateLogicalModel);

  const { activateTool } = useDiagramTool();

  if (modelView === 'logical') {
    return (
      <aside className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
        <PanelHeader title="Modelo lógico" />

        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          <div className="space-y-6">
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Elementos
              </p>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-left text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
                onClick={() => {
                  addLogicalTable();
                }}
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <Table2 size={16} aria-hidden="true" />
                </span>

                <span>Nueva tabla</span>
              </button>
            </section>

            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Transformación
              </p>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-left text-sm font-medium text-text shadow-sm transition-colors hover:bg-surface-hover"
                onClick={generateLogicalModel}
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
                  <RefreshCw size={16} aria-hidden="true" />
                </span>

                <span>Generar desde ER</span>
              </button>
            </section>
          </div>
        </div>

        <footer className="hidden shrink-0 border-t border-border bg-background/60 px-5 py-3.5 lg:block">
          <div className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
            <Database size={14} className="mt-0.5 shrink-0" aria-hidden="true" />

            <p>Arrastra las tablas desde su encabezado para organizar el modelo.</p>
          </div>
        </footer>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
      <PanelHeader title="Elementos" />

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
        style={{
          scrollbarWidth: 'thin',
        }}
      >
        <div className="space-y-6 sm:space-y-8">
          {TOOL_GROUPS.map((group, index) => (
            <ToolbarGroup
              key={group.title}
              title={group.title}
              items={group.items}
              activeTool={activeTool}
              onToolSelect={activateTool}
              isFirst={index === 0}
            />
          ))}
        </div>
      </div>

      <footer className="hidden shrink-0 border-t border-border bg-background/60 px-5 py-3.5 lg:block">
        <p className="text-xs leading-relaxed text-text-muted">
          Cada herramienta tiene un atajo de teclado — pasa el cursor sobre un botón para verlo.
        </p>
      </footer>
    </aside>
  );
}
