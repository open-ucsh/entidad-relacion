'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { ComponentType } from 'react';

type PanelSide = 'left' | 'right';

interface EditorSidePanelToggleProps {
  side: PanelSide;
  isOpen: boolean;
  panelName?: string;
  onToggle: () => void;
}

const ICONS: Record<PanelSide, Record<'open' | 'closed', ComponentType<{ size?: number }>>> = {
  left: {
    open: ChevronLeft,
    closed: ChevronRight,
  },
  right: {
    open: ChevronRight,
    closed: ChevronLeft,
  },
};

export function EditorSidePanelToggle({
  side,
  isOpen,
  panelName,
  onToggle,
}: EditorSidePanelToggleProps) {
  const Icon = ICONS[side][isOpen ? 'open' : 'closed'];
  const defaultPanelName = side === 'left' ? 'herramientas' : 'inspector';
  const resolvedPanelName = panelName ?? defaultPanelName;
  const label = `${isOpen ? 'Ocultar' : 'Mostrar'} ${resolvedPanelName}`;

  const positionClassName =
    side === 'left'
      ? isOpen
        ? 'left-60 rounded-r-md'
        : 'left-0 rounded-r-md'
      : isOpen
        ? 'right-80 rounded-l-md'
        : 'right-0 rounded-l-md';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={`absolute top-1/2 z-30 flex h-10 w-7 -translate-y-1/2 items-center justify-center border border-border bg-background text-text-muted shadow-sm transition-all duration-200 hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${positionClassName}`}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
