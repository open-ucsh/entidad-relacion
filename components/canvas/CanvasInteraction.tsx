'use client';

import type { ReactNode, PointerEvent } from 'react';

interface CanvasInteractionProps {
  children: ReactNode;
  onBackgroundClick: () => void;
}

export function CanvasInteraction({ children, onBackgroundClick }: CanvasInteractionProps) {
  function handleBackgroundClick(event: PointerEvent<SVGRectElement>) {
    event.stopPropagation();

    onBackgroundClick();
  }

  return (
    <>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="transparent"
        onClick={handleBackgroundClick}
      />

      {children}
    </>
  );
}
