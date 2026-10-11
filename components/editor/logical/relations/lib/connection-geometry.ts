export interface Point {
  x: number;
  y: number;
}

export type Side = 'left' | 'right' | 'top' | 'bottom';

export interface TableElements {
  table: HTMLElement;
  column: HTMLElement | null;
}

const CONNECTION_OFFSET = 28;

function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, (character) => `\\${character}`);
}

export function findTableElements(
  container: HTMLElement,
  tableId: string,
  columnId: string | undefined,
): TableElements | null {
  const table = container.querySelector<HTMLElement>(
    `[data-logical-table-id="${escapeSelector(tableId)}"]`,
  );

  if (!table) {
    return null;
  }

  if (!columnId) {
    return {
      table,
      column: null,
    };
  }

  const column = table.querySelector<HTMLElement>(
    `[data-logical-column-id="${escapeSelector(columnId)}"]`,
  );

  return {
    table,
    column,
  };
}

function getElementCenterY(
  table: HTMLElement,
  column: HTMLElement | null,
  containerRect: DOMRect,
  zoom: number,
): number {
  const rect = (column ?? table).getBoundingClientRect();

  return (rect.top - containerRect.top + rect.height / 2) / zoom;
}

export function getSideDirection(side: Side): Point {
  switch (side) {
    case 'left':
      return { x: -1, y: 0 };

    case 'right':
      return { x: 1, y: 0 };

    case 'top':
      return { x: 0, y: -1 };

    case 'bottom':
      return { x: 0, y: 1 };
  }
}

export function getConnectionSides(
  sourceRect: DOMRect,
  targetRect: DOMRect,
): {
  sourceSide: Side;
  targetSide: Side;
} {
  const sourceCenterX = sourceRect.left + sourceRect.width / 2;

  const sourceCenterY = sourceRect.top + sourceRect.height / 2;

  const targetCenterX = targetRect.left + targetRect.width / 2;

  const targetCenterY = targetRect.top + targetRect.height / 2;

  const deltaX = targetCenterX - sourceCenterX;

  const deltaY = targetCenterY - sourceCenterY;

  const horizontalGap = Math.abs(deltaX) - (sourceRect.width + targetRect.width) / 2;

  const verticalGap = Math.abs(deltaY) - (sourceRect.height + targetRect.height) / 2;

  if (horizontalGap >= verticalGap) {
    if (deltaX >= 0) {
      return {
        sourceSide: 'right',
        targetSide: 'left',
      };
    }

    return {
      sourceSide: 'left',
      targetSide: 'right',
    };
  }

  if (deltaY >= 0) {
    return {
      sourceSide: 'bottom',
      targetSide: 'top',
    };
  }

  return {
    sourceSide: 'top',
    targetSide: 'bottom',
  };
}

export function getConnectionPoint(
  elements: TableElements,
  side: Side,
  containerRect: DOMRect,
  zoom: number,
): Point {
  const tableRect = elements.table.getBoundingClientRect();

  if (side === 'left' || side === 'right') {
    return {
      x: ((side === 'left' ? tableRect.left : tableRect.right) - containerRect.left) / zoom,
      y: getElementCenterY(elements.table, elements.column, containerRect, zoom),
    };
  }

  const columnRect = (elements.column ?? elements.table).getBoundingClientRect();

  const columnCenterX = columnRect.left + columnRect.width / 2;

  const minX = tableRect.left + 28 * zoom;

  const maxX = tableRect.right - 28 * zoom;

  return {
    x: (Math.min(Math.max(columnCenterX, minX), maxX) - containerRect.left) / zoom,
    y: ((side === 'top' ? tableRect.top : tableRect.bottom) - containerRect.top) / zoom,
  };
}

function offsetPoint(point: Point, side: Side, distance: number): Point {
  const direction = getSideDirection(side);

  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  };
}

export function createConnectionPath(
  start: Point,
  end: Point,
  startSide: Side,
  endSide: Side,
): string {
  const startOuter = offsetPoint(start, startSide, CONNECTION_OFFSET);

  const endOuter = offsetPoint(end, endSide, CONNECTION_OFFSET);

  const startHorizontal = startSide === 'left' || startSide === 'right';

  const endHorizontal = endSide === 'left' || endSide === 'right';

  if (startHorizontal && endHorizontal) {
    const middleX = (startOuter.x + endOuter.x) / 2;

    return [
      `M ${start.x} ${start.y}`,
      `L ${startOuter.x} ${startOuter.y}`,
      `L ${middleX} ${startOuter.y}`,
      `L ${middleX} ${endOuter.y}`,
      `L ${endOuter.x} ${endOuter.y}`,
      `L ${end.x} ${end.y}`,
    ].join(' ');
  }

  if (!startHorizontal && !endHorizontal) {
    const middleY = (startOuter.y + endOuter.y) / 2;

    return [
      `M ${start.x} ${start.y}`,
      `L ${startOuter.x} ${startOuter.y}`,
      `L ${startOuter.x} ${middleY}`,
      `L ${endOuter.x} ${middleY}`,
      `L ${endOuter.x} ${endOuter.y}`,
      `L ${end.x} ${end.y}`,
    ].join(' ');
  }

  if (startHorizontal) {
    return [
      `M ${start.x} ${start.y}`,
      `L ${startOuter.x} ${startOuter.y}`,
      `L ${endOuter.x} ${startOuter.y}`,
      `L ${endOuter.x} ${endOuter.y}`,
      `L ${end.x} ${end.y}`,
    ].join(' ');
  }

  return [
    `M ${start.x} ${start.y}`,
    `L ${startOuter.x} ${startOuter.y}`,
    `L ${startOuter.x} ${endOuter.y}`,
    `L ${endOuter.x} ${endOuter.y}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
}
