import type { LucideIcon } from 'lucide-react';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (() => void) | undefined;
  disabled?: boolean | undefined;
}

export function HeaderIconButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}
