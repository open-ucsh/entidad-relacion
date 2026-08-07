import type { Relationship } from '@/domain/models';

const WIDTH = 120;
const HEIGHT = 60;

interface RelationshipShapeProps {
  relationship: Relationship;
  selected: boolean;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent<SVGGElement>) => void;
}

export function RelationshipShape({
  relationship,
  selected,
  onClick,
  onPointerDown,
}: RelationshipShapeProps) {
  const { x, y } = relationship.position;

  const points = [
    `${String(x)},${String(y - HEIGHT / 2)}`,
    `${String(x + WIDTH / 2)},${String(y)}`,
    `${String(x)},${String(y + HEIGHT / 2)}`,
    `${String(x - WIDTH / 2)},${String(y)}`,
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

      <text x={x} y={y + 4} textAnchor="middle" className="fill-text text-xs font-semibold">
        {relationship.name}
      </text>
    </g>
  );
}
