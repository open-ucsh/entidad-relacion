'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

import type { LogicalRelationCardinality, LogicalTable } from '@/domain/logical/models';

interface LogicalRelationsLayerProps {
  tables: LogicalTable[];
  containerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
}

interface Point {
  x: number;
  y: number;
}

type Side = 'left' | 'right' | 'top' | 'bottom';

interface RelationLine {
  id: string;
  start: Point;
  end: Point;
  startSide: Side;
  endSide: Side;
  sourceCardinality: LogicalRelationCardinality;
  referencedCardinality: LogicalRelationCardinality;
}

interface TableElements {
  table: HTMLElement;
  column: HTMLElement | null;
}

const MARK_GAP = 7;
const MARK_SIZE = 6;
const MARK_SPACING = 10;
const CONNECTION_OFFSET = 28;

function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, (character) => `\\${character}`);
}

function findTableElements(
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

function getSideDirection(side: Side): Point {
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

function getConnectionSides(
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

function getConnectionPoint(
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

function createPath(start: Point, end: Point, startSide: Side, endSide: Side): string {
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

function CardinalityMark({
  point,
  side,
  cardinality,
}: {
  point: Point;
  side: Side;
  cardinality: LogicalRelationCardinality;
}) {
  const direction = getSideDirection(side);

  const perpendicular = {
    x: -direction.y,
    y: direction.x,
  };

  const getPoint = (distance: number): Point => ({
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  });

  const renderOne = (distance: number, key: string) => {
    const center = getPoint(distance);

    return (
      <line
        key={key}
        x1={center.x - perpendicular.x * MARK_SIZE}
        y1={center.y - perpendicular.y * MARK_SIZE}
        x2={center.x + perpendicular.x * MARK_SIZE}
        y2={center.y + perpendicular.y * MARK_SIZE}
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    );
  };

  const maximumMark =
    cardinality.maximum === 'N'
      ? (() => {
          const base = getPoint(MARK_GAP);

          const end = getPoint(MARK_GAP + MARK_SPACING);

          return (
            <g
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line
                x1={base.x}
                y1={base.y}
                x2={end.x + perpendicular.x * MARK_SIZE}
                y2={end.y + perpendicular.y * MARK_SIZE}
              />

              <line x1={base.x} y1={base.y} x2={end.x} y2={end.y} />

              <line
                x1={base.x}
                y1={base.y}
                x2={end.x - perpendicular.x * MARK_SIZE}
                y2={end.y - perpendicular.y * MARK_SIZE}
              />
            </g>
          );
        })()
      : renderOne(MARK_GAP, 'maximum-one');

  const minimumDistance = MARK_GAP + MARK_SPACING;

  const minimumMark =
    cardinality.minimum === 0 ? (
      <circle
        cx={getPoint(minimumDistance).x}
        cy={getPoint(minimumDistance).y}
        r={3.25}
        fill="var(--color-background)"
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
      />
    ) : (
      renderOne(minimumDistance, 'minimum-one')
    );

  return (
    <g>
      {maximumMark}
      {minimumMark}
    </g>
  );
}

export function LogicalRelationsLayer({ tables, containerRef, zoom }: LogicalRelationsLayerProps) {
  const [lines, setLines] = useState<RelationLine[]>([]);

  const calculateLines = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();

    const nextLines: RelationLine[] = [];

    for (const sourceTable of tables) {
      for (const foreignKey of sourceTable.foreignKeys) {
        const referencedTable = tables.find((table) => table.id === foreignKey.referencedTableId);

        if (!referencedTable) {
          continue;
        }

        const sourceElements = findTableElements(
          container,
          sourceTable.id,
          foreignKey.columnIds[0],
        );

        const referencedElements = findTableElements(
          container,
          referencedTable.id,
          foreignKey.referencedColumnIds[0],
        );

        if (!sourceElements || !referencedElements) {
          continue;
        }

        const sourceRect = sourceElements.table.getBoundingClientRect();

        const targetRect = referencedElements.table.getBoundingClientRect();

        const { sourceSide, targetSide } = getConnectionSides(sourceRect, targetRect);

        nextLines.push({
          id: foreignKey.id,
          start: getConnectionPoint(sourceElements, sourceSide, containerRect, zoom),
          end: getConnectionPoint(referencedElements, targetSide, containerRect, zoom),
          startSide: sourceSide,
          endSide: targetSide,
          sourceCardinality: foreignKey.sourceCardinality,
          referencedCardinality: foreignKey.referencedCardinality,
        });
      }
    }

    setLines(nextLines);
  }, [containerRef, tables, zoom]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(calculateLines);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [calculateLines]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateLines();
    });

    resizeObserver.observe(container);

    const tableElements = container.querySelectorAll<HTMLElement>('[data-logical-table-id]');

    for (const table of tableElements) {
      resizeObserver.observe(table);
    }

    window.addEventListener('resize', calculateLines);

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener('resize', calculateLines);
    };
  }, [calculateLines, containerRef, tables]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {lines.map((line) => (
        <g key={line.id}>
          <path
            d={createPath(line.start, line.end, line.startSide, line.endSide)}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <CardinalityMark
            point={line.start}
            side={line.startSide}
            cardinality={line.sourceCardinality}
          />

          <CardinalityMark
            point={line.end}
            side={line.endSide}
            cardinality={line.referencedCardinality}
          />
        </g>
      ))}
    </svg>
  );
}
