import type { Isa } from '@/domain/models';

interface IsaShapeProps {
  isa: Isa;
}

export function IsaShape({ isa }: IsaShapeProps) {
  const { x, y } = isa.position;

  return (
    <g>
      <text x={x} y={y + 9} textAnchor="middle" className="fill-text text-xs">
        ISA
      </text>
    </g>
  );
}
