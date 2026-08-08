import type { Tool } from '@/domain/diagram/models';

import { ToolbarButton } from './ToolbarButton';
import type { ToolbarTool } from './tool-config';

interface ToolbarGroupProps {
  title: string;
  items: ToolbarTool[];
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

export function ToolbarGroup({ title, items, activeTool, onToolSelect }: ToolbarGroupProps) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            shortcut={item.shortcut}
            active={activeTool === item.id}
            onClick={() => {
              onToolSelect(item.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}
