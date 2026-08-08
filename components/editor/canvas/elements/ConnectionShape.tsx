import type { MouseEvent, PointerEvent } from 'react';

import type { Point } from '@/domain/diagram/models';

interface ConnectionShapeProps {
  from: Point;
  to: Point;
  selected: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
}

export function ConnectionShape({ from, to, selected, onClick }: ConnectionShapeProps) {
  const stroke = selected ? 'var(--color-brand-primary)' : 'var(--color-border)';
  const strokeWidth = selected ? 3 : 1.5;

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
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
}
