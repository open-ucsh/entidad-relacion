import type { PointerEvent } from 'react';

interface ConnectionHandleProps {
  x: number;
  y: number;
  onPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export function ConnectionHandle({ x, y, onPointerDown }: ConnectionHandleProps) {
  return (
    <g
      className="cursor-crosshair"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onPointerDown(event);
      }}
    >
      <circle cx={x} cy={y} r={10} fill="transparent" />

      <path
        d={`M ${x - 3} ${y} H ${x + 3} M ${x} ${y - 3} V ${y + 3}`}
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        pointerEvents="none"
      />
    </g>
  );
}
