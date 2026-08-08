import type { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  children?: ReactNode | undefined;
}

export function PanelHeader({ title, children }: PanelHeaderProps) {
  return (
    <header className="flex h-15 shrink-0 items-center justify-between border-b border-border px-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">{title}</h2>

      {children}
    </header>
  );
}
