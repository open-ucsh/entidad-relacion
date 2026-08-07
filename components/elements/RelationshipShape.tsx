import type { Relationship } from '@/domain/models';

const WIDTH = 120;
const HEIGHT = 60;

interface RelationshipShapeProps {
  relationship: Relationship;
}

export function RelationshipShape({ relationship }: RelationshipShapeProps) {
  const { x, y } = relationship.position;

  const points = [
    `${String(x)},${String(y - HEIGHT / 2)}`,
    `${String(x + WIDTH / 2)},${String(y)}`,
    `${String(x)},${String(y + HEIGHT / 2)}`,
    `${String(x - WIDTH / 2)},${String(y)}`,
  ].join(' ');

  return (
    <g>
      <polygon points={points} className="fill-background stroke-border" />

      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
        {relationship.name}
      </text>
    </g>
  );
}
