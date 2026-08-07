import type { Isa } from '@/domain/models';

const SIZE = 46;

interface IsaShapeProps {
  isa: Isa;
  selected: boolean;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent<SVGGElement>) => void;
}

export function IsaShape({ isa, selected, onClick, onPointerDown }: IsaShapeProps) {
  const { x, y } = isa.position;

  const points = [
    `${String(x)},${String(y - SIZE / 2)}`,
    `${String(x + SIZE / 2)},${String(y + SIZE / 2)}`,
    `${String(x - SIZE / 2)},${String(y + SIZE / 2)}`,
  ].join(' ');

  return (
    <g
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={selected ? 'cursor-grabbing' : 'cursor-pointer'}
    >
      <polygon
        points={points}
        className="fill-background stroke-border"
        stroke={selected ? 'var(--color-brand-primary: #004574;)' : undefined}
        strokeWidth={selected ? 3 : 1.5}
      />

      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs">
        ISA
      </text>
    </g>
  );
}
