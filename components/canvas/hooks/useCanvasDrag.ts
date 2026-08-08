import { useState, type PointerEvent } from 'react';

import type { Diagram } from '@/domain/models';
import { getElementPosition } from '@/domain/queries';

interface DragOffset {
  x: number;
  y: number;
}

interface UseCanvasDragProps {
  diagram: Diagram;
  getSvgPoint: (event: globalThis.PointerEvent) => {
    x: number;
    y: number;
  } | null;
  updateElement: (
    id: string,
    updates: {
      position: {
        x: number;
        y: number;
      };
    },
  ) => void;
}

export function useCanvasDrag({ diagram, getSvgPoint, updateElement }: UseCanvasDragProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset | null>(null);

  function startDrag(event: PointerEvent<SVGGElement>, id: string) {
    event.stopPropagation();

    const position = getElementPosition(diagram, id);

    if (!position) {
      return;
    }

    const point = getSvgPoint(event.nativeEvent);

    if (!point) {
      return;
    }

    setDraggingId(id);

    setDragOffset({
      x: point.x - position.x,
      y: point.y - position.y,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent<SVGSVGElement>) {
    if (!draggingId || !dragOffset) {
      return;
    }

    const point = getSvgPoint(event.nativeEvent);

    if (!point) {
      return;
    }

    updateElement(draggingId, {
      position: {
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y,
      },
    });
  }

  function stopDrag() {
    setDraggingId(null);
    setDragOffset(null);
  }

  return {
    startDrag,
    drag,
    stopDrag,
    draggingId,
  };
}
