import type { Isa } from '@/domain/models';

const SIZE = 46;

interface IsaShapeProps {
  isa: Isa;
}

export function IsaShape({ isa }: IsaShapeProps) {
  const { x, y } = isa.position;

  const points = [
    `${String(x)},${String(y - SIZE / 2)}`,
    `${String(x + SIZE / 2)},${String(y + SIZE / 2)}`,
    `${String(x - SIZE / 2)},${String(y + SIZE / 2)}`,
  ].join(' ');

  return (
    <g>
      <polygon points={points} className="fill-background stroke-border" />

      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs">
        ISA
      </text>
    </g>
  );
}
