'use client';

import { useDiagramTool } from '@/components/editor/hooks/useDiagramTool';
import { useDiagramStore } from '@/state/diagram/store';

import { TOOL_GROUPS } from './tool-config';
import { ToolbarButton } from './ToolbarButton';

export function Toolbar() {
  const activeTool = useDiagramStore((state) => state.activeTool);
  const { activateTool } = useDiagramTool();

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
