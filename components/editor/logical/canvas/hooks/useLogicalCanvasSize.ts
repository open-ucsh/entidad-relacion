'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

import type { LogicalViewportSize } from '../lib/logical-camera';

const INITIAL_VIEWPORT_SIZE: LogicalViewportSize = {
  width: 1,
  height: 1,
};

export function useLogicalCanvasSize(viewportRef: RefObject<HTMLElement | null>) {
  const [viewportSize, setViewportSize] = useState<LogicalViewportSize>(INITIAL_VIEWPORT_SIZE);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function updateViewportSize() {
      const currentViewport = viewportRef.current;

      if (!currentViewport) {
        return;
      }

      const rect = currentViewport.getBoundingClientRect();

      setViewportSize({
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
      });
    }

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [viewportRef]);

  return viewportSize;
}
