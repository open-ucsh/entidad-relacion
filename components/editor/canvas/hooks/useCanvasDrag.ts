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
  hasMoved: boolean;
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
  onMoveStarted: () => void;
  onMoveCompleted: (movedElementCount: number) => void;
  onMoveCancelled: () => void;
}

export function useCanvasDrag({
  diagram,
  selectedElementIds,
  getSvgPoint,
  moveElements,
  onMoveStarted,
  onMoveCompleted,
  onMoveCancelled,
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

    if (items.length === 0) {
      return;
    }

    dragSessionRef.current = {
      startPoint,
      items,
      hasMoved: false,
    };

    onMoveStarted();
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

    if (dx === 0 && dy === 0) {
      return;
    }

    session.hasMoved = true;

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
    const session = dragSessionRef.current;

    if (!session) {
      return;
    }

    if (session.hasMoved) {
      onMoveCompleted(session.items.length);
    } else {
      onMoveCancelled();
    }

    dragSessionRef.current = null;
  }

  return {
    startDrag,
    drag,
    stopDrag,
  };
}
