'use client';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { PanelHeader } from '@/components/ui';
import { useDiagramStore } from '@/state/diagram/diagram.store';

import { ToolbarGroup } from './ToolbarGroup';
import { TOOL_GROUPS } from './tool-config';

export function Toolbar() {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const { activateTool } = useDiagramTool();

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
      <PanelHeader title="Elementos" />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-7">
          {TOOL_GROUPS.map((group) => (
            <ToolbarGroup
              key={group.title}
              title={group.title}
              items={group.items}
              activeTool={activeTool}
              onToolSelect={activateTool}
            />
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border px-5 py-4">
        <p className="text-xs leading-relaxed text-text-muted">
          Selecciona una herramienta o usa su atajo de teclado.
        </p>
      </footer>
    </aside>
  );
}
