'use client';

import { useRef, type PointerEvent } from 'react';

import type { Diagram, Point } from '@/domain/diagram/models';
import { getElementPosition } from '@/domain/diagram/queries/elements';

import { snapDelta } from '../lib/grid';

interface DragItem {
  id: string;
  position: Point;
}

interface DragSession {
  startPoint: Point;
  items: DragItem[];
  hasMoved: boolean;
}

interface ElementPositionUpdate {
  id: string;
  position: Point;
}

interface UseCanvasDragProps {
  diagram: Diagram;
  selectedElementIds: string[];
  getSvgPoint: (event: globalThis.PointerEvent) => Point | null;
  moveElements: (updates: ElementPositionUpdate[]) => void;
  onDrag: (updates: ElementPositionUpdate[]) => void;
  onMoveStarted: () => void;
  onMoveCompleted: (movedElementCount: number) => void;
  onMoveCancelled: () => void;
}

export function useCanvasDrag({
  diagram,
  selectedElementIds,
  getSvgPoint,
  moveElements,
  onDrag,
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

    const rawDx = point.x - session.startPoint.x;
    const rawDy = point.y - session.startPoint.y;

    if (rawDx === 0 && rawDy === 0) {
      return;
    }

    const dx = event.altKey ? rawDx : snapDelta(rawDx);
    const dy = event.altKey ? rawDy : snapDelta(rawDy);

    const updates = session.items.map((item) => ({
      id: item.id,
      position: {
        x: item.position.x + dx,
        y: item.position.y + dy,
      },
    }));

    session.hasMoved = true;
    moveElements(updates);
    onDrag(updates);
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
