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
      className="group relative flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <Icon size={17} aria-hidden="true" />

      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}
