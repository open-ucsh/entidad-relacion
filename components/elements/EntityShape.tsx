import type { Entity } from '@/domain/models';

const WIDTH = 120;
const HEIGHT = 56;

interface EntityShapeProps {
  entity: Entity;
}

export function EntityShape({ entity }: EntityShapeProps) {
  const x = entity.position.x - WIDTH / 2;
  const y = entity.position.y - HEIGHT / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={WIDTH}
        height={HEIGHT}
        rx={6}
        className="fill-background stroke-border"
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
