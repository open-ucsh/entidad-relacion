import type { DragEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

import { isDraggableEditorTool, setDraggedEditorTool } from '@/components/editor/editor-tool-drag';
import type { Tool } from '@/domain/diagram/models';

interface ToolbarButtonProps {
  tool: Tool;
  icon: LucideIcon;
  label: string;
  shortcut: string;
  active: boolean;
  onClick: () => void;
}

export function ToolbarButton({
  tool,
  icon: Icon,
  label,
  shortcut,
  active,
  onClick,
}: ToolbarButtonProps) {
  const draggable = isDraggableEditorTool(tool);

  function handleDragStart(event: DragEvent<HTMLButtonElement>) {
    setDraggedEditorTool(event.dataTransfer, tool);
  }

  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onClick={onClick}
      aria-label={`${label} (${shortcut})`}
      aria-pressed={active}
      className={`group relative flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
        active
          ? 'bg-brand-primary/10 text-brand-primary'
          : 'text-text-muted hover:bg-surface-hover hover:text-brand-primary'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <Icon size={21} strokeWidth={1.7} aria-hidden="true" />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}

        <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-text-muted">
          {shortcut}
        </span>
      </span>
    </button>
  );
}
