'use client';

import { History, SlidersHorizontal, X } from 'lucide-react';

import { HistoryPanel } from '../history/HistoryPanel';
import { Inspector } from '../inspector/Inspector';

export type RightPanelTab = 'inspector' | 'history';

interface EditorRightPanelProps {
  activeTab: RightPanelTab;
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

export function EditorRightPanel({ activeTab, onChangeTab, onClose }: EditorRightPanelProps) {
  return (
    <aside
      aria-label={activeTab === 'inspector' ? 'Propiedades del diagrama' : 'Historial del proyecto'}
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-2">
        <nav aria-label="Secciones del panel" className="flex min-w-0 flex-1 items-center gap-1">
          <TabButton
            active={activeTab === 'inspector'}
            icon={SlidersHorizontal}
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
          <Inspector showPanelHeader={false} />
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
