import type { MouseEvent, PointerEvent } from 'react';
import type { Entity } from '@/domain/models';

const WIDTH = 120;
const HEIGHT = 56;

const DIAMOND_MARGIN_X = 14;
const DIAMOND_MARGIN_Y = 10;

interface EntityShapeProps {
  entity: Entity;
  selected: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: (event: PointerEvent) => void;
}

export function EntityShape({
  entity,
  selected,
  onClick,
  onDoubleClick,
  onPointerDown,
}: EntityShapeProps) {
  const x = entity.position.x - WIDTH / 2;
  const y = entity.position.y - HEIGHT / 2;

  const isWeak = entity.kind === 'weak';
  const isAssociative = entity.kind === 'associative';

  const diamondWidth = WIDTH - DIAMOND_MARGIN_X * 2;
  const diamondHeight = HEIGHT - DIAMOND_MARGIN_Y * 2;

  const diamondPoints = [
    `${entity.position.x},${entity.position.y - diamondHeight / 2}`,
    `${entity.position.x + diamondWidth / 2},${entity.position.y}`,
    `${entity.position.x},${entity.position.y + diamondHeight / 2}`,
    `${entity.position.x - diamondWidth / 2},${entity.position.y}`,
  ].join(' ');

  return (
    <g
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onDoubleClick();
      }}
      className={selected ? 'cursor-grabbing' : 'cursor-pointer'}
    >
      {isWeak && (
        <rect
          x={x + 4}
          y={y + 4}
          width={WIDTH}
          height={HEIGHT}
          rx={6}
          className="fill-background stroke-border"
          strokeWidth={selected ? 3 : 1.5}
        />
      )}

      <rect
        x={x}
        y={y}
        width={WIDTH}
        height={HEIGHT}
        rx={isAssociative ? 0 : 6}
        className="fill-background stroke-border"
        stroke={selected ? 'var(--color-brand-primary)' : undefined}
        strokeWidth={selected ? 3 : 1.5}
      />

      {isAssociative && (
        <polygon
          points={diamondPoints}
          className="fill-background stroke-border"
          strokeWidth={selected ? 2 : 1}
        />
      )}

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
