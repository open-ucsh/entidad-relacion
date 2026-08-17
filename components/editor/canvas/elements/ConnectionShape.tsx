import type { MouseEvent, PointerEvent } from 'react';

import type { Point } from '@/domain/diagram/models';

interface ConnectionShapeProps {
  from: Point;
  to: Point;
  selected: boolean;
  cardinalityLabel: string | null;
  onClick: (event: MouseEvent<SVGGElement>) => void;
}

const CARDINALITY_OFFSET = 88;

function getCardinalityPosition(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);

  if (distance === 0) {
    return from;
  }

  return {
    x: from.x + (dx / distance) * CARDINALITY_OFFSET,
    y: from.y + (dy / distance) * CARDINALITY_OFFSET,
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
      className="cursor-pointer"
    >
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="var(--color-border)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {selected && (
        <line
          data-export-exclude
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="var(--color-brand-primary)"
          strokeWidth={3}
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}

      {cardinalityLabel && (
        <g pointerEvents="none">
          <rect
            x={labelPosition.x - 15}
            y={labelPosition.y - 10}
            width="30"
            height="20"
            rx="4"
            className="fill-background stroke-border"
            strokeWidth="1"
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
