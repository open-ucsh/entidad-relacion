'use client';

import {
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from 'react';

import type { LogicalCamera } from '../lib/logical-camera';

interface PanStart {
  x: number;
  y: number;
}

interface UseLogicalCanvasPanOptions {
  setCamera: Dispatch<SetStateAction<LogicalCamera>>;
}

export function useLogicalCanvasPan({ setCamera }: UseLogicalCanvasPanOptions) {
  const panStartRef = useRef<PanStart | null>(null);

  const [isPanning, setIsPanning] = useState(false);

  function startPan(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (
      target.closest('[data-logical-table-id], button, input, select, textarea, [role="button"]')
    ) {
      return;
    }

    const isTouch = event.pointerType === 'touch';

    const isMousePan = event.button === 0 || event.button === 1;

    if (!isTouch && !isMousePan) {
      return;
    }

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    setIsPanning(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pan(event: ReactPointerEvent<HTMLElement>) {
    const start = panStartRef.current;

    if (!start) {
      return;
    }

    const dx = event.clientX - start.x;

    const dy = event.clientY - start.y;

    setCamera((current) => ({
      ...current,
      x: current.x + dx,
      y: current.y + dy,
    }));

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function stopPan(event: ReactPointerEvent<HTMLElement>) {
    panStartRef.current = null;
    setIsPanning(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    isPanning,
    startPan,
    pan,
    stopPan,
  };
}
