'use client';

import { useState, type PointerEvent } from 'react';

import type { Diagram } from '@/domain/models';
import { getElementPosition } from '@/domain/queries/elements';

interface DragItem {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

interface DragState {
  anchorId: string;
  anchorPosition: {
    x: number;
    y: number;
  };
  items: DragItem[];
}

interface UseCanvasDragProps {
  diagram: Diagram;
  selectedElementIds: string[];
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

export function useCanvasDrag({
  diagram,
  selectedElementIds,
  getSvgPoint,
  updateElement,
}: UseCanvasDragProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);

  function startDrag(event: PointerEvent, id: string) {
    event.stopPropagation();

    const anchorPosition = getElementPosition(diagram, id);

    if (!anchorPosition) {
      return;
    }

    const point = getSvgPoint(event.nativeEvent);

    if (!point) {
      return;
    }

    const idsToMove = selectedElementIds.includes(id) ? selectedElementIds : [id];

    const items = idsToMove.flatMap((selectedId) => {
      const position = getElementPosition(diagram, selectedId);

      return position
        ? [
            {
              id: selectedId,
              position,
            },
          ]
        : [];
    });

    setDragState({
      anchorId: id,
      anchorPosition,
      items,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent) {
    if (!dragState) {
      return;
    }

    const point = getSvgPoint(event.nativeEvent);

    if (!point) {
      return;
    }

    const dx = point.x - dragState.anchorPosition.x;
    const dy = point.y - dragState.anchorPosition.y;

    for (const item of dragState.items) {
      updateElement(item.id, {
        position: {
          x: item.position.x + dx,
          y: item.position.y + dy,
        },
      });
    }
  }

  function stopDrag() {
    setDragState(null);
  }

  return {
    startDrag,
    drag,
    stopDrag,
    draggingIds: dragState?.items.map((item) => item.id) ?? [],
  };
}
