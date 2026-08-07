'use client';

import type { Tool } from '@/domain/models';

import { useCanvasCreate } from '@/components/canvas/hooks/useCanvasCreate';
import { PanelHeader } from '@/components/ui';
import { useDiagramStore } from '@/state/diagram-store';

import { ToolbarGroup } from './ToolbarGroup';
import { TOOL_GROUPS } from './tools';

export function Toolbar() {
  const activeTool = useDiagramStore((state) => state.activeTool);

  const setActiveTool = useDiagramStore((state) => state.setActiveTool);

  const { create } = useCanvasCreate();

  function handleToolSelect(tool: Tool) {
    setActiveTool(tool);

    if (tool === 'entity' || tool === 'relationship' || tool === 'attribute' || tool === 'isa') {
      create(tool);
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border">
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
                onToolSelect={handleToolSelect}
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
    </aside>
  );
}
