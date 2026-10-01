'use client';

import { Database, Table2 } from 'lucide-react';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { PanelHeader } from '@/components/ui';
import { useDiagramStore } from '@/state/diagram/store';

import type { ModelView } from '../logical/ModelViewSwitcher';
import { useLogicalSelectionStore } from '../logical/logical-selection';
import { TOOL_GROUPS } from './tool-config';
import { ToolbarGroup } from './ToolbarGroup';

interface ToolbarProps {
  modelView: ModelView;
}

export function Toolbar({ modelView }: ToolbarProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);

  const tables = useDiagramStore((state) => state.logicalWorkspace.model.tables);

  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);

  const setLogicalSelection = useLogicalSelectionStore((state) => state.setSelection);

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
          {tables.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-3 py-4">
              <p className="text-xs leading-relaxed text-text-muted">
                Elige cómo comenzar tu modelo lógico desde el área de trabajo.
              </p>
            </div>
          ) : (
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
                  Tablas
                </p>

                <div className="space-y-1">
                  {tables.map((table) => (
                    <button
                      key={table.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-hover"
                      onClick={() => {
                        setLogicalSelection({
                          type: 'table',
                          tableId: table.id,
                        });
                      }}
                    >
                      <Table2 size={13} className="shrink-0 text-text-muted" aria-hidden="true" />

                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">
                        {table.name}
                      </span>

                      <span className="shrink-0 text-[10px] text-text-muted">
                        {table.columns.length}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {tables.length > 0 && (
          <footer className="hidden shrink-0 border-t border-border bg-background/60 px-5 py-3.5 lg:block">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
              <Database size={14} className="mt-0.5 shrink-0" aria-hidden="true" />

              <p>Selecciona una tabla para editar sus columnas y relaciones.</p>
            </div>
          </footer>
        )}
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
