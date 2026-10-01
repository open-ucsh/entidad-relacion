'use client';

import { History, SlidersHorizontal, Table2 } from 'lucide-react';

import type { ModelView } from '../logical/ModelViewSwitcher';
import { HistoryPanel } from '../history/HistoryPanel';
import { Inspector } from '../inspector/Inspector';
import { LogicalInspector } from '../logical/LogicalInspector';

export type RightPanelTab = 'inspector' | 'history';

interface EditorRightPanelProps {
  activeTab: RightPanelTab;
  modelView: ModelView;
  onChangeTab: (tab: RightPanelTab) => void;
}

interface TabButtonProps {
  active: boolean;
  icon: typeof SlidersHorizontal;
  label: string;
  onClick: () => void;
}

function TabButton({ active, icon: Icon, label, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-colors ${
        active ? 'text-brand-primary' : 'text-text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      <Icon size={15} aria-hidden="true" />

      <span className="truncate">{label}</span>

      {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand-primary" />}
    </button>
  );
}

export function EditorRightPanel({ activeTab, modelView, onChangeTab }: EditorRightPanelProps) {
  const isLogicalView = modelView === 'logical';

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col border-l border-border bg-surface">
      <nav
        aria-label="Panel derecho"
        className="flex shrink-0 border-b border-border bg-background"
      >
        <TabButton
          active={activeTab === 'inspector'}
          icon={isLogicalView ? Table2 : SlidersHorizontal}
          label={isLogicalView ? 'Modelo lógico' : 'Propiedades'}
          onClick={() => {
            onChangeTab('inspector');
          }}
        />

        <TabButton
          active={activeTab === 'history'}
          icon={History}
          label="Historial"
          onClick={() => {
            onChangeTab('history');
          }}
        />
      </nav>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {activeTab === 'inspector' ? (
          isLogicalView ? (
            <LogicalInspector />
          ) : (
            <Inspector showPanelHeader={false} />
          )
        ) : (
          <HistoryPanel
            onSelectTarget={() => {
              onChangeTab('inspector');
            }}
          />
        )}
      </div>
    </aside>
  );
}
