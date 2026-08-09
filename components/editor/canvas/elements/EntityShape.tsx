import type { MouseEvent, PointerEvent } from 'react';

import type { Entity } from '@/domain/diagram/models';

import { ConnectionHandle } from './ConnectionHandle';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const WIDTH = 120;
const HEIGHT = 56;
const DIAMOND_MARGIN_X = 14;
const DIAMOND_MARGIN_Y = 10;

interface EntityShapeProps {
  entity: Entity;
  selected: boolean;
  showConnectionHandle: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: ((event: PointerEvent<SVGGElement>) => void) | undefined;
  onConnectionPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export function EntityShape({
  entity,
  selected,
  showConnectionHandle,
  onClick,
  onDoubleClick,
  onPointerDown,
  onConnectionPointerDown,
}: EntityShapeProps) {
  const { x: centerX, y: centerY } = entity.position;
  const x = centerX - WIDTH / 2;
  const y = centerY - HEIGHT / 2;

  const isWeak = entity.kind === 'weak';
  const isAssociative = entity.kind === 'associative';

  const diamondWidth = WIDTH - DIAMOND_MARGIN_X * 2;
  const diamondHeight = HEIGHT - DIAMOND_MARGIN_Y * 2;

  const diamondPoints = [
    `${centerX},${centerY - diamondHeight / 2}`,
    `${centerX + diamondWidth / 2},${centerY}`,
    `${centerX},${centerY + diamondHeight / 2}`,
    `${centerX - diamondWidth / 2},${centerY}`,
  ].join(' ');

  return (
    <ElementInteractionGroup
      elementId={entity.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
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
        x={centerX}
        y={centerY + 4}
        textAnchor="middle"
        className="fill-text text-xs font-semibold"
      >
        {entity.name}
      </text>

      {selected && showConnectionHandle && (
        <ConnectionHandle
          x={centerX + WIDTH / 2 + 10}
          y={centerY}
          onPointerDown={onConnectionPointerDown}
        />
      )}
    </ElementInteractionGroup>
  );
}
