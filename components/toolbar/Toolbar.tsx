'use client';

import { useDiagramStore } from '@/state/diagram-store';
import { useToolSelect } from '@/components/editor/hooks/useToolSelect';

import { ToolbarGroup } from './ToolbarGroup';
import { TOOL_GROUPS } from './tools';

export function Toolbar() {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const { selectTool } = useToolSelect();

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border">
      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-8">
          {TOOL_GROUPS.map((group, index) => (
            <div key={group.title}>
              {index > 0 && <div className="mb-8 border-t border-border" />}

              <ToolbarGroup
                title={group.title}
                items={group.items}
                activeTool={activeTool}
                onToolSelect={selectTool}
              />
            </div>
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
