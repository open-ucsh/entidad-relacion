'use client';

import type { ReactNode } from 'react';

interface CanvasInteractionProps {
  children: ReactNode;
  onBackgroundClick: () => void;
}

export function CanvasInteraction({ children, onBackgroundClick }: CanvasInteractionProps) {
  return <g onClick={onBackgroundClick}>{children}</g>;
}
