import { Panel, PanelHeader } from '@/components/ui';

import { ToolbarGroup } from './ToolbarGroup';
import { TOOL_GROUPS } from './tools';

export function Toolbar() {
  return (
    <aside className="h-full overflow-hidden border-r border-border">
      <Panel>
        <PanelHeader title="Herramientas" />

        <div
          className="flex-1 overflow-y-auto px-5 py-5"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          <div className="space-y-8">
            {TOOL_GROUPS.map((group, index) => (
              <div key={group.title}>
                {index > 0 && <div className="mb-8 border-t border-border" />}

                <ToolbarGroup title={group.title} items={group.items} />
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </aside>
  );
}
