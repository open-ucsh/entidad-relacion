'use client';

import { Table2 } from 'lucide-react';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { useDiagramStore } from '@/state/diagram/store';

import { useLogicalSelectionStore } from '../logical/logical-selection';
import type { ModelView } from '../logical/ModelViewSwitcher';
import { TOOL_GROUPS } from './tool-config';
import { ToolbarButton } from './ToolbarButton';

interface ToolbarProps {
  modelView: ModelView;
  onInspectTable?: () => void;
}

export function Toolbar({ modelView, onInspectTable }: ToolbarProps) {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const tables = useDiagramStore((state) => state.logicalWorkspace.model.tables);
  const addLogicalTable = useDiagramStore((state) => state.addLogicalTable);
  const setLogicalSelection = useLogicalSelectionStore((state) => state.setSelection);
  const { activateTool } = useDiagramTool();

  if (modelView === 'logical') {
    return (
      <nav
        aria-label="Herramientas del modelo lógico"
        className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 shadow-sm"
      >
        {tables.length === 0 ? (
          <p className="px-2 py-1 text-xs leading-5 text-text-muted">
            Elige cómo comenzar desde el área de trabajo.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                addLogicalTable();
              }}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-brand-primary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Table2 size={18} aria-hidden="true" />
              Nueva tabla
            </button>

            <details className="relative shrink-0">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg bg-surface px-3 text-sm font-medium text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
                Tablas
                <span className="text-xs text-text-muted">{tables.length}</span>
              </summary>

              <div className="absolute bottom-full right-0 z-40 mb-3 max-h-64 w-60 overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-lg lg:bottom-auto lg:top-full lg:mb-0 lg:mt-3">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={(event) => {
                      setLogicalSelection({
                        type: 'table',
                        tableId: table.id,
                      });

                      event.currentTarget.closest('details')?.removeAttribute('open');

                      onInspectTable?.();
                    }}
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <Table2 size={15} aria-hidden="true" className="shrink-0 text-text-muted" />

                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">
                      {table.name}
                    </span>

                    <span className="shrink-0 text-xs text-text-muted">{table.columns.length}</span>
                  </button>
                ))}
              </div>
            </details>
          </>
        )}
      </nav>
    );
  }

  const tools = TOOL_GROUPS.flatMap((group) => group.items);

  const orderedTools = [
    ...tools.filter((tool) => tool.id === 'select'),
    ...tools.filter((tool) => tool.id !== 'select'),
  ];

  return (
    <nav
      aria-label="Herramientas del diagrama"
      className="flex items-center gap-1 rounded-xl border border-border bg-background p-2 shadow-sm"
    >
      {orderedTools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          tool={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          active={activeTool === tool.id}
          onClick={() => {
            activateTool(tool.id);
          }}
        />
      ))}
    </nav>
  );
}
