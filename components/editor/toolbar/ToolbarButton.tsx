import type { DragEvent } from 'react';

import type { LucideIcon } from 'lucide-react';

import type { Tool } from '@/domain/diagram/models';

import { isDraggableEditorTool, setDraggedEditorTool } from '@/components/editor/editor-tool-drag';

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
      title={`${label} (${shortcut})`}
      className={`group relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-150 active:opacity-90 ${
        active
          ? 'border-brand-primary bg-brand-primary/10'
          : 'border-border bg-background hover:border-brand-primary/25 hover:bg-surface-hover hover:shadow-sm'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <span
        className={`absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded px-1 text-xs font-semibold leading-none transition-opacity duration-150 ${
          active
            ? 'bg-brand-primary text-white opacity-100'
            : 'bg-surface text-text-muted opacity-0 group-hover:opacity-100'
        }`}
      >
        {shortcut}
      </span>

      <Icon
        size={20}
        strokeWidth={1.6}
        className={
          active
            ? 'text-brand-primary'
            : 'text-text-muted transition-colors group-hover:text-brand-primary'
        }
      />

      <span
        className={`px-1 text-center text-xs font-medium leading-tight ${
          active ? 'text-brand-primary' : 'text-text'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
