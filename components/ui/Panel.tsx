import type { PropsWithChildren } from 'react';

export function Panel({ children }: PropsWithChildren) {
  return <section className="flex h-full flex-col bg-surface">{children}</section>;
}
