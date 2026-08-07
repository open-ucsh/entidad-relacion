'use client';

import { useDiagramStore } from '@/state/diagram-store';

import { Panel, PanelHeader } from '@/components/ui';

import { ToolbarGroup } from './ToolbarGroup';
import { TOOL_GROUPS } from './tools';

export function Toolbar() {
  const activeTool = useDiagramStore((state) => state.activeTool);

  return (
    <aside className="h-full border-r border-border bg-surface">
      <Panel>
        <PanelHeader title="Herramientas" />

        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-8">
            {TOOL_GROUPS.map((group, index) => (
              <div key={group.title}>
                {index > 0 && <div className="mb-8 border-t border-border" />}

                <ToolbarGroup
                  title={group.title}
                  items={group.items}
                  activeTool={activeTool}
                  onToolSelect={(tool) => {
                    useDiagramStore.getState().setActiveTool(tool);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <footer className="shrink-0 border-t border-border px-5 py-4">
          <p className="text-xs leading-relaxed text-text-muted">
            Selecciona una herramienta para comenzar.
          </p>
        </footer>
      </Panel>
    </aside>
  );
}
