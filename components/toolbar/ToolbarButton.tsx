import type { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
}

export function ToolbarButton({ icon: Icon, label }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="
        group
        flex
        h-28
        w-full
        flex-col
        items-center
        justify-center
        gap-3
        rounded-xl
        border
        border-border
        bg-background
        px-3
        transition-all
        duration-150
        hover:border-brand-primary/25
        hover:bg-surface-hover
        hover:shadow-sm
        active:scale-[0.98]
      "
    >
      <Icon
        size={22}
        strokeWidth={1.7}
        className="
          text-text-muted
          transition-colors
          group-hover:text-brand-primary
        "
      />

      <span className="text-center text-xs font-medium leading-tight text-text">{label}</span>
    </button>
  );
}
