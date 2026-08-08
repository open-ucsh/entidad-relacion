import type { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  active: boolean;
  onClick: () => void;
}

export function ToolbarButton({
  icon: Icon,
  label,
  shortcut,
  active,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label} (${shortcut})`}
      className={`group relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-150 active:scale-[0.98] ${
        active
          ? 'border-brand-primary bg-brand-primary/10'
          : 'border-border bg-background hover:border-brand-primary/25 hover:bg-surface-hover hover:shadow-sm'
      }`}
    >
      <span
        className={`absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded px-1 text-[10px] font-semibold leading-none ${
          active
            ? 'bg-brand-primary text-white'
            : 'bg-surface text-text-muted group-hover:text-brand-primary'
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
