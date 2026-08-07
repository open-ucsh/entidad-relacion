import { Panel, PanelHeader } from '@/components/ui';

export function Inspector() {
  return (
    <aside className="border-l border-border">
      <Panel>
        <PanelHeader title="Propiedades" />

        <div className="flex-1 p-4" />
      </Panel>
    </aside>
  );
}
