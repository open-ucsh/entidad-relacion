import type { Tool } from '@/domain/models';

import { ToolbarButton } from './ToolbarButton';
import type { TOOL_GROUPS } from './tools';

interface ToolbarGroupProps {
  title: string;
  items: (typeof TOOL_GROUPS)[number]['items'];
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

export function ToolbarGroup({ title, items, activeTool, onToolSelect }: ToolbarGroupProps) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
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
