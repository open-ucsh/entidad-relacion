'use client';

import type { ReactNode } from 'react';

interface CanvasInteractionProps {
  children: ReactNode;
}

export function CanvasInteraction({ children }: CanvasInteractionProps) {
  return <g>{children}</g>;
}
