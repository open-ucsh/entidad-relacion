import type { MouseEvent, PointerEvent } from 'react';

import { ELEMENT_GEOMETRY } from '@/domain/diagram/lib/geometry';
import type { Entity } from '@/domain/diagram/models';

import { ConnectionHandle } from './ConnectionHandle';
import { ElementInteractionGroup } from './ElementInteractionGroup';

const WIDTH = ELEMENT_GEOMETRY.entity.width;
const HEIGHT = ELEMENT_GEOMETRY.entity.height;

const DIAMOND_MARGIN_X = 14;
const DIAMOND_MARGIN_Y = 10;

interface EntityShapeProps {
  entity: Entity;
  selected: boolean;
  isEditing: boolean;
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
  isEditing,
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

  const stroke = isConnectionDropTarget
    ? 'var(--color-brand-primary-hover)'
    : isValidTarget || selected
      ? 'var(--color-brand-primary)'
      : 'var(--color-border)';

  const strokeWidth = isConnectionDropTarget ? 3 : selected ? 2.5 : isValidTarget ? 2 : 1.5;

  const fill = isConnectionDropTarget
    ? 'var(--color-brand-primary)'
    : selected
      ? 'var(--color-surface)'
      : 'var(--color-background)';

  return (
    <ElementInteractionGroup
      elementId={entity.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      <g opacity={isInvalidTarget ? 0.35 : 1}>
        {isWeak && (
          <rect
            x={x + 4}
            y={y + 4}
            width={WIDTH}
            height={HEIGHT}
            rx={5}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            pointerEvents="none"
          />
        )}

        <rect
          x={x}
          y={y}
          width={WIDTH}
          height={HEIGHT}
          rx={isAssociative ? 2 : 6}
          fill={fill}
          fillOpacity={isConnectionDropTarget ? 0.12 : 1}
          stroke={stroke}
          strokeWidth={strokeWidth}
          className="transition-all duration-150 group-hover:fill-surface-hover group-hover:stroke-brand-primary"
        />

        {isAssociative && (
          <polygon
            points={diamondPoints}
            fill={fill}
            fillOpacity={isConnectionDropTarget ? 0.12 : 1}
            stroke={stroke}
            strokeWidth={selected ? 2 : 1.5}
            className="transition-all duration-150 group-hover:fill-surface-hover group-hover:stroke-brand-primary"
            pointerEvents="none"
          />
        )}

        {!isEditing && (
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            className="pointer-events-none fill-text text-xs font-semibold"
          >
            {entity.name}
          </text>
        )}
      </g>

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
