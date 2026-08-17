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
  showConnectionTargets: boolean;
  isConnectionTarget: boolean;
  isConnectionDropTarget: boolean;
  isConnectionTargetInvalid: boolean;
  onClick: (event: MouseEvent<SVGGElement>) => void;
  onDoubleClick: () => void;
  onPointerDown?: ((event: PointerEvent<SVGGElement>) => void) | undefined;
  onConnectionPointerDown: (event: PointerEvent<SVGGElement>) => void;
}

export function EntityShape({
  entity,
  selected,
  showConnectionHandle,
  showConnectionTargets,
  isConnectionTarget,
  isConnectionDropTarget,
  isConnectionTargetInvalid,
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

  const isInvalidTarget = showConnectionTargets && isConnectionTargetInvalid && !selected;
  const isValidTarget =
    showConnectionTargets && isConnectionTarget && !selected && !isConnectionDropTarget;
  const isActiveTarget = isConnectionDropTarget;

  const stroke = isActiveTarget
    ? 'var(--color-brand-primary-hover)'
    : isValidTarget
      ? 'var(--color-brand-primary)'
      : 'var(--color-border)';

  const strokeWidth = isActiveTarget ? 4 : isValidTarget ? 2 : 1.5;
  const strokeOpacity = isValidTarget ? 0.55 : 1;
  const elementOpacity = isInvalidTarget ? 0.35 : 1;

  const fill = isActiveTarget ? 'var(--color-brand-primary)' : 'var(--color-background)';
  const fillOpacity = isActiveTarget ? 0.12 : 1;

  return (
    <ElementInteractionGroup
      elementId={entity.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={elementOpacity}>
        {isWeak && (
          <rect
            x={x + 4}
            y={y + 4}
            width={WIDTH}
            height={HEIGHT}
            rx={6}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
          />
        )}

        <rect
          x={x}
          y={y}
          width={WIDTH}
          height={HEIGHT}
          rx={isAssociative ? 0 : 6}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
        />

        {isAssociative && (
          <polygon
            points={diamondPoints}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={stroke}
            strokeWidth={isActiveTarget ? 3 : isValidTarget ? 2 : 1}
            strokeOpacity={strokeOpacity}
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
      </g>

      {selected && (
        <g data-export-exclude pointerEvents="none">
          {isWeak && (
            <rect
              x={x + 4}
              y={y + 4}
              width={WIDTH}
              height={HEIGHT}
              rx={6}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={3}
            />
          )}

          <rect
            x={x}
            y={y}
            width={WIDTH}
            height={HEIGHT}
            rx={isAssociative ? 0 : 6}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth={3}
          />

          {isAssociative && (
            <polygon
              points={diamondPoints}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth={2}
            />
          )}
        </g>
      )}

      {selected && showConnectionHandle && (
        <g data-export-exclude>
          <circle
            cx={centerX + WIDTH / 2 + 14}
            cy={centerY}
            r={9}
            fill="var(--color-brand-primary)"
          />

          <ConnectionHandle
            x={centerX + WIDTH / 2 + 14}
            y={centerY}
            onPointerDown={onConnectionPointerDown}
          />
        </g>
      )}
    </ElementInteractionGroup>
  );
}
