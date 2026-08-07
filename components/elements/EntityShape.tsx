import type { Entity } from '@/domain/models';

const WIDTH = 120;
const HEIGHT = 56;

interface EntityShapeProps {
  entity: Entity;
  selected: boolean;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent<SVGGElement>) => void;
}

export function EntityShape({ entity, selected, onClick, onPointerDown }: EntityShapeProps) {
  const x = entity.position.x - WIDTH / 2;
  const y = entity.position.y - HEIGHT / 2;

  return (
    <g
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={selected ? 'cursor-grabbing' : 'cursor-pointer'}
    >
      <rect
        x={x}
        y={y}
        width={WIDTH}
        height={HEIGHT}
        rx={6}
        className="fill-background stroke-border"
        stroke={selected ? 'var(--color-brand-primary: #004574;)' : undefined}
        strokeWidth={selected ? 3 : 1.5}
      />

      <text
        x={entity.position.x}
        y={entity.position.y + 4}
        textAnchor="middle"
        className="fill-text text-xs font-semibold"
      >
        {entity.name}
      </text>
    </g>
  );
}
