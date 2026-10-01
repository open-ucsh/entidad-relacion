import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

import type { LogicalTablePosition } from '@/domain/logical/models';

interface DragState {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startTableX: number;
  startTableY: number;
  moved: boolean;
}

interface UseLogicalTableDragOptions {
  tableId: string;
  position: LogicalTablePosition;
  zoom: number;
  moveTable: (
    tableId: string,
    position: LogicalTablePosition,
    options?: {
      recordHistory?: boolean;
      historyPosition?: LogicalTablePosition;
    },
  ) => void;
}

export function useLogicalTableDrag({
  tableId,
  position,
  zoom,
  moveTable,
}: UseLogicalTableDragOptions) {
  const dragRef = useRef<DragState | null>(null);

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startTableX: position.x,
      startTableY: position.y,
      moved: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = (event.clientX - drag.startPointerX) / zoom;

    const deltaY = (event.clientY - drag.startPointerY) / zoom;

    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
      drag.moved = true;
    }

    moveTable(
      tableId,
      {
        x: Math.max(0, drag.startTableX + deltaX),
        y: Math.max(0, drag.startTableY + deltaY),
      },
      {
        recordHistory: false,
      },
    );
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag.moved) {
      return;
    }

    const deltaX = (event.clientX - drag.startPointerX) / zoom;

    const deltaY = (event.clientY - drag.startPointerY) / zoom;

    const finalPosition = {
      x: Math.max(0, drag.startTableX + deltaX),
      y: Math.max(0, drag.startTableY + deltaY),
    };

    moveTable(tableId, finalPosition, {
      recordHistory: true,
      historyPosition: {
        x: drag.startTableX,
        y: drag.startTableY,
      },
    });
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
  };
}
