import type { PropsWithChildren } from 'react';

interface PanelHeaderProps extends PropsWithChildren {
  title: string;
}

export function PanelHeader({ title, children }: PanelHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h2>

      {children}
    </header>
  );
}
