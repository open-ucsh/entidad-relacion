'use client';

import type { PointerEvent, ReactNode } from 'react';

interface CanvasInteractionProps {
  children: ReactNode;
  onBackgroundClick: () => void;
}

export function CanvasInteraction({ children, onBackgroundClick }: CanvasInteractionProps) {
  function handleBackgroundClick(event: PointerEvent<SVGGElement>) {
    event.stopPropagation();
    onBackgroundClick();
  }

  return <g onPointerDown={handleBackgroundClick}>{children}</g>;
}
