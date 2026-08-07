import type { Relationship } from '@/domain/models';

const WIDTH = 120;
const HEIGHT = 60;

interface RelationshipShapeProps {
  relationship: Relationship;
  selected: boolean;
  onClick: () => void;
}

export function RelationshipShape({ relationship, selected, onClick }: RelationshipShapeProps) {
  const { x, y } = relationship.position;

  const points = [
    `${String(x)},${String(y - HEIGHT / 2)}`,
    `${String(x + WIDTH / 2)},${String(y)}`,
    `${String(x)},${String(y + HEIGHT / 2)}`,
    `${String(x - WIDTH / 2)},${String(y)}`,
  ].join(' ');

  return (
    <g
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="cursor-pointer"
    >
      <polygon
        points={points}
        className="fill-background stroke-border"
        stroke={selected ? 'var(--color-brand-primary: #004574;)' : undefined}
        strokeWidth={selected ? 3 : 1.5}
      />

      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
        {relationship.name}
      </text>
    </g>
  );
}
