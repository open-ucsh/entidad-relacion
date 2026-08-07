import { ToolbarButton } from './ToolbarButton';
import type { TOOL_GROUPS } from './tools';

interface ToolbarGroupProps {
  title: string;
  items: (typeof TOOL_GROUPS)[number]['items'];
}

export function ToolbarGroup({ title, items }: ToolbarGroupProps) {
  return (
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <ToolbarButton key={item.id} icon={item.icon} label={item.label} />
        ))}
      </div>
    </section>
  );
}
