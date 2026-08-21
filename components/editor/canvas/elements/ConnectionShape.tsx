import type { MouseEvent, PointerEvent } from 'react';

import type { Point } from '@/domain/diagram/models';

interface ConnectionShapeProps {
  from: Point;
  to: Point;
  selected: boolean;
  cardinalityLabel: string | null;
  onClick: (event: MouseEvent<SVGGElement>) => void;
}

const CARDINALITY_OFFSET = 28;

function getCardinalityPosition(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lineLength = Math.hypot(dx, dy);

  if (lineLength === 0) {
    return from;
  }

  const offset = Math.min(CARDINALITY_OFFSET, lineLength / 2);

  return {
    x: from.x + (dx / lineLength) * offset,
    y: from.y + (dy / lineLength) * offset,
  };
}

export function ConnectionShape({
  from,
  to,
  selected,
  cardinalityLabel,
  onClick,
}: ConnectionShapeProps) {
  const labelPosition = getCardinalityPosition(from, to);

  return (
    <g
      onPointerDown={(event: PointerEvent<SVGGElement>) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      className="group cursor-pointer"
    >
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth={24}
        strokeLinecap="round"
        pointerEvents="stroke"
      />

      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={selected ? 'var(--color-brand-primary)' : 'var(--color-border)'}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeLinecap="round"
        className="transition-colors duration-150 group-hover:stroke-brand-primary"
        pointerEvents="none"
      />

      {cardinalityLabel && (
        <g pointerEvents="none">
          <rect
            x={labelPosition.x - 17}
            y={labelPosition.y - 10}
            width={34}
            height={20}
            rx={6}
            className="fill-background stroke-border"
            strokeWidth={1}
          />

          <text
            x={labelPosition.x}
            y={labelPosition.y + 4}
            textAnchor="middle"
            className="fill-text text-xs font-semibold"
          >
            {cardinalityLabel}
          </text>
        </g>
      )}
    </g>
  );
}
