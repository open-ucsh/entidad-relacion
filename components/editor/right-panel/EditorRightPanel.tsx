'use client';

import { History, SlidersHorizontal, Table2, X } from 'lucide-react';

import { HistoryPanel } from '../history/HistoryPanel';
import { Inspector } from '../inspector/Inspector';
import { LogicalInspector } from '../logical/LogicalInspector';
import type { ModelView } from '../logical/ModelViewSwitcher';

export type RightPanelTab = 'inspector' | 'history';

interface EditorRightPanelProps {
  activeTab: RightPanelTab;
  modelView: ModelView;
  onChangeTab: (tab: RightPanelTab) => void;
  onClose: () => void;
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
      aria-pressed={active}
      className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
        active
          ? 'bg-brand-primary/10 text-brand-primary'
          : 'text-text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      <Icon size={15} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function EditorRightPanel({
  activeTab,
  modelView,
  onChangeTab,
  onClose,
}: EditorRightPanelProps) {
  const isLogicalView = modelView === 'logical';

  return (
    <aside
      aria-label={
        activeTab === 'history'
          ? 'Historial del proyecto'
          : isLogicalView
            ? 'Propiedades del modelo lógico'
            : 'Propiedades del diagrama'
      }
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-2">
        <nav aria-label="Secciones del panel" className="flex min-w-0 flex-1 items-center gap-1">
          <TabButton
            active={activeTab === 'inspector'}
            icon={isLogicalView ? Table2 : SlidersHorizontal}
            label="Propiedades"
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

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

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
