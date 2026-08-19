import type { PointerEvent } from 'react';

interface ConnectionHandleProps {
  x: number;
  y: number;
  onPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export const CONNECTION_HANDLE_OFFSET = 12;
const HANDLE_RADIUS = 6;
const HIT_AREA_RADIUS = 14;

export function ConnectionHandle({ x, y, onPointerDown }: ConnectionHandleProps) {
  return (
    <g
      data-export-exclude
      className="group cursor-crosshair"
      style={{
        opacity: 1,
        pointerEvents: 'auto',
        transition: 'opacity 120ms ease',
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onPointerDown(event);
      }}
    >
      <circle cx={x} cy={y} r={HIT_AREA_RADIUS} fill="transparent" />

      <circle
        cx={x}
        cy={y}
        r={HANDLE_RADIUS}
        fill="var(--color-background)"
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
        className="transition-all duration-150 group-hover:r-[8]"
      />

      <path
        d={`M ${x - 3} ${y} H ${x + 3} M ${x} ${y - 3} V ${y + 3}`}
        stroke="var(--color-brand-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="transition-all duration-150 group-hover:stroke-brand-primary-hover"
        pointerEvents="none"
      />
    </g>
  );
}
