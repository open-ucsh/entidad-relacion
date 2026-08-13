'use client';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { PanelHeader } from '@/components/ui';
import { useDiagramStore } from '@/state/diagram/store';

import { ToolbarGroup } from './ToolbarGroup';
import { TOOL_GROUPS } from './tool-config';

export function Toolbar() {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const { activateTool } = useDiagramTool();

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
      <PanelHeader title="Elementos" />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-8">
          {TOOL_GROUPS.map((group, i) => (
            <ToolbarGroup
              key={group.title}
              title={group.title}
              items={group.items}
              activeTool={activeTool}
              onToolSelect={activateTool}
              isFirst={i === 0}
            />
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-background/60 px-5 py-3.5">
        <p className="text-xs leading-relaxed text-text-muted">
          Cada herramienta tiene un atajo de teclado — pasa el cursor sobre un botón para verlo.
        </p>
      </footer>
    </aside>
  );
}
