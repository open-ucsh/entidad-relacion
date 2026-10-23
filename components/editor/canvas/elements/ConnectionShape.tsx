import type { MouseEvent, PointerEvent } from 'react';

import type { Point } from '@/domain/diagram/models';

interface ConnectionShapeProps {
  from: Point;
  to: Point;
  selected: boolean;
  insertionTarget?: boolean;
  cardinalityLabel: string | null;
  cardinalityEnd: 'from' | 'to';
  onClick: (event: MouseEvent<SVGGElement>) => void;
}

const CARDINALITY_OFFSET = 28;
const LABEL_NORMAL_OFFSET = 16;
const LABEL_HEIGHT = 22;

function getCardinalityPosition(from: Point, to: Point, cardinalityEnd: 'from' | 'to'): Point {
  const anchor = cardinalityEnd === 'from' ? from : to;
  const opposite = cardinalityEnd === 'from' ? to : from;

  const dx = opposite.x - anchor.x;
  const dy = opposite.y - anchor.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return {
      x: anchor.x,
      y: anchor.y - LABEL_NORMAL_OFFSET,
    };
  }

  const offset = Math.min(CARDINALITY_OFFSET, length / 2);

  // Mantiene la etiqueta al mismo lado aunque se invierta la conexión.
  const direction = dx < 0 || (dx === 0 && dy < 0) ? -1 : 1;
  const normalX = (-dy / length) * direction;
  const normalY = (dx / length) * direction;

  return {
    x: anchor.x + (dx / length) * offset + normalX * LABEL_NORMAL_OFFSET,
    y: anchor.y + (dy / length) * offset + normalY * LABEL_NORMAL_OFFSET,
  };
}

export function ConnectionShape({
  from,
  to,
  selected,
  insertionTarget = false,
  cardinalityLabel,
  cardinalityEnd,
  onClick,
}: ConnectionShapeProps) {
  const labelPosition = getCardinalityPosition(from, to, cardinalityEnd);
  const labelWidth = Math.max(42, (cardinalityLabel?.length ?? 0) * 7 + 12);

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
        data-export-exclude
      />

      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={insertionTarget || selected ? 'var(--color-brand-primary)' : 'var(--color-border)'}
        strokeWidth={insertionTarget ? 4 : selected ? 2.5 : 1.5}
        strokeDasharray={insertionTarget ? '8 6' : undefined}
        strokeLinecap="round"
        className="transition-colors duration-150 group-hover:stroke-brand-primary"
        pointerEvents="none"
        data-connection-insertion-target={insertionTarget ? 'true' : undefined}
        data-export-reset-connection
      />

      {cardinalityLabel && (
        <g pointerEvents="none">
          <rect
            x={labelPosition.x - labelWidth / 2}
            y={labelPosition.y - LABEL_HEIGHT / 2}
            width={labelWidth}
            height={LABEL_HEIGHT}
            rx={6}
            className="fill-background stroke-border"
            strokeWidth={1}
          />

          <text
            x={labelPosition.x}
            y={labelPosition.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-text text-xs font-semibold"
          >
            {cardinalityLabel}
          </text>
        </g>
      )}
    </g>
  );
}
