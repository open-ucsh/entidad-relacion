'use client';

import { useRef, type PointerEvent } from 'react';

import type { Diagram, Point } from '@/domain/diagram/models';
import { getElementPosition } from '@/domain/diagram/queries/elements';

interface DragItem {
  id: string;
  position: Point;
}

interface DragSession {
  startPoint: Point;
  items: DragItem[];
}

interface UseCanvasDragProps {
  diagram: Diagram;
  selectedElementIds: string[];
  getSvgPoint: (event: globalThis.PointerEvent) => Point | null;
  moveElements: (
    updates: Array<{
      id: string;
      position: Point;
    }>,
  ) => void;
}

export function useCanvasDrag({
  diagram,
  selectedElementIds,
  getSvgPoint,
  moveElements,
}: UseCanvasDragProps) {
  const dragSessionRef = useRef<DragSession | null>(null);

  function startDrag(event: PointerEvent, id: string) {
    event.stopPropagation();

    const startPoint = getSvgPoint(event.nativeEvent);

    if (!startPoint) {
      return;
    }

    const idsToMove = selectedElementIds.includes(id) ? selectedElementIds : [id];

    const items = idsToMove.flatMap((elementId) => {
      const position = getElementPosition(diagram, elementId);

      return position ? [{ id: elementId, position }] : [];
    });

    dragSessionRef.current = {
      startPoint,
      items,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent) {
    const session = dragSessionRef.current;

    if (!session) {
      return;
    }

    const point = getSvgPoint(event.nativeEvent);

    if (!point) {
      return;
    }

    const dx = point.x - session.startPoint.x;
    const dy = point.y - session.startPoint.y;

    moveElements(
      session.items.map((item) => ({
        id: item.id,
        position: {
          x: item.position.x + dx,
          y: item.position.y + dy,
        },
      })),
    );
  }

  function stopDrag() {
    dragSessionRef.current = null;
  }

  return {
    startDrag,
    drag,
    stopDrag,
  };
}
